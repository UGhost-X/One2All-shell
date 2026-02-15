const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

let mainWindow;
const prisma = new PrismaClient();

// 存储上一次打开的路径
const configPath = path.join(app.getPath('userData'), 'app-config.json');
let lastOpenPath = '';

// 加载配置
try {
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    lastOpenPath = config.lastOpenPath || '';
  }
} catch (err) {
  console.error('Failed to load config:', err);
}

// 保存配置
function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify({ lastOpenPath }), 'utf-8');
  } catch (err) {
    console.error('Failed to save config:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/.output/public/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // IPC 处理器
  ipcMain.handle('toggle-always-on-top', () => {
    if (mainWindow) {
      const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
      const newState = !isAlwaysOnTop;
      // 使用 'screen-saver' 级别确保在大多数情况下都能置顶
      mainWindow.setAlwaysOnTop(newState, 'screen-saver');
      return newState;
    }
    return false;
  });

  ipcMain.handle('is-always-on-top', () => {
    return mainWindow ? mainWindow.isAlwaysOnTop() : false;
  });

  // Prisma IPC 处理器
  ipcMain.handle('db:get-products', async () => {
    return await prisma.product.findMany({
      include: { scheme: true },
      orderBy: { createdAt: 'desc' }
    });
  });

  // Annotation Scheme IPC handlers
  ipcMain.handle('db:get-schemes', async () => {
    return await prisma.annotationScheme.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  });

  ipcMain.handle('db:save-scheme', async (event, scheme) => {
    if (scheme.id) {
      const { id, ...data } = scheme;
      return await prisma.annotationScheme.update({
        where: { id },
        data
      });
    }
    return await prisma.annotationScheme.create({
      data: scheme
    });
  });

  ipcMain.handle('db:delete-scheme', async (event, id) => {
    return await prisma.annotationScheme.delete({
      where: { id }
    });
  });

  ipcMain.handle('db:bind-scheme', async (event, { productId, schemeId }) => {
    return await prisma.product.update({
      where: { id: productId },
      data: { schemeId }
    });
  });

  // Annotation Results IPC handlers
  ipcMain.handle('db:get-annotations', async (event, { productId, imagePath }) => {
    return await prisma.annotation.findFirst({
      where: { productId, imagePath }
    });
  });

  ipcMain.handle('db:save-annotations', async (event, { productId, imagePath, data }) => {
    const existing = await prisma.annotation.findFirst({
      where: { productId, imagePath }
    });

    if (existing) {
      return await prisma.annotation.update({
        where: { id: existing.id },
        data: { data, updatedAt: new Date() }
      });
    }

    return await prisma.annotation.create({
      data: { productId, imagePath, data }
    });
  });

  ipcMain.handle('db:add-product', async (event, product) => {
    return await prisma.product.create({
      data: product
    });
  });

  ipcMain.handle('db:delete-product', async (event, id) => {
    // 获取产品信息以删除对应的图片文件
    try {
      const productDir = path.join(appSettings.dataPath, String(id));
      if (fs.existsSync(productDir)) {
        fs.rmSync(productDir, { recursive: true, force: true });
      }
    } catch (err) {
      console.error('Failed to delete product images:', err);
    }

    return await prisma.product.delete({
      where: { id }
    });
  });

  ipcMain.handle('db:get-cameras', async () => {
    return await prisma.camera.findMany();
  });

  ipcMain.handle('db:add-camera', async (event, camera) => {
    return await prisma.camera.create({
      data: camera
    });
  });

  ipcMain.handle('db:delete-camera', async (event, id) => {
    return await prisma.camera.delete({
      where: { id }
    });
  });

  ipcMain.handle('db:update-camera', async (event, { id, data }) => {
    return await prisma.camera.update({
      where: { id },
      data
    });
  });

  // 文件选择器 IPC 处理器
  ipcMain.handle('dialog:open-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: '选择图片文件',
      defaultPath: lastOpenPath,
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp', 'bmp', 'jpeg'] }
      ]
    });

    if (!canceled && filePaths.length > 0) {
      const selectedPath = filePaths[0];
      lastOpenPath = path.dirname(selectedPath);
      saveConfig();
      
      // 读取文件并转换为 base64 供渲染进程显示
      try {
        const buffer = fs.readFileSync(selectedPath);
        const base64 = `data:image/${path.extname(selectedPath).slice(1)};base64,${buffer.toString('base64')}`;
        return { path: selectedPath, data: base64 };
      } catch (err) {
        console.error('Failed to read file:', err);
        return null;
      }
    }
    return null;
  });

  // 存储路径管理
  let appSettings = {
    dataPath: path.join(app.getPath('documents'), 'One2All', 'Data')
  };

  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    if (fs.existsSync(settingsPath)) {
      appSettings = { ...appSettings, ...JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }

  ipcMain.handle('settings:get', () => appSettings);
  ipcMain.handle('settings:save', (event, newSettings) => {
    appSettings = { ...appSettings, ...newSettings };
    fs.writeFileSync(settingsPath, JSON.stringify(appSettings), 'utf-8');
    return true;
  });

  ipcMain.handle('dialog:select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: '选择数据存储目录',
      properties: ['openDirectory', 'createDirectory']
    });
    if (!canceled && filePaths.length > 0) {
      return filePaths[0];
    }
    return null;
  });

  // 保存图片到指定产品文件夹
  ipcMain.handle('storage:save-image', async (event, { productId, fileName, dataUrl }) => {
    try {
      const productDir = path.join(appSettings.dataPath, String(productId));
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }
      
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const filePath = path.join(productDir, fileName);
      
      fs.writeFileSync(filePath, buffer);

      // 更新数据库中的产品图片路径
      await prisma.product.update({
        where: { id: productId },
        data: { lastImagePath: filePath }
      });

      return filePath;
    } catch (err) {
      console.error('Failed to save image:', err);
      throw err;
    }
  });

  // 根据路径读取图片
  ipcMain.handle('storage:load-image', async (event, filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1);
      const base64 = `data:image/${ext};base64,${buffer.toString('base64')}`;
      return base64;
    } catch (err) {
      console.error('Failed to load image from path:', err);
      return null;
    }
  });

  // 获取产品目录下的所有图片
  ipcMain.handle('storage:get-product-images', async (event, productId) => {
    try {
      const productDir = path.join(appSettings.dataPath, String(productId));
      if (!fs.existsSync(productDir)) {
        return [];
      }
      const files = fs.readdirSync(productDir);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const imageFiles = files
        .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => path.join(productDir, file));
      return imageFiles;
    } catch (err) {
      console.error('Failed to get product images:', err);
      return [];
    }
  });

  ipcMain.handle('storage:save-dataset', async (event, { productId, versionName, moduleName, images, cocoData }) => {
    try {
      const baseDir = appSettings.dataPath;
      const targetDir = path.join(baseDir, String(productId), moduleName || 'data_augmentation', versionName);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const fileName = `image_${i + 1}.jpg`;
        const filePath = path.join(targetDir, fileName);
        const base64Data = img.imageUrl.split(',')[1];
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        
        if (cocoData.images[i]) {
          cocoData.images[i].file_name = fileName;
        }
      }

      const cocoPath = path.join(targetDir, 'annotations.json');
      fs.writeFileSync(cocoPath, JSON.stringify(cocoData, null, 2), 'utf-8');

      return { success: true, path: targetDir };
    } catch (err) {
      console.error('Failed to save dataset:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('storage:load-dataset', async (event, { id, savePath }) => {
    try {
      let finalPath = savePath;
      
      if (!finalPath && id) {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        const version = await prisma.datasetVersion.findUnique({ where: { id: numericId } });
        if (version) {
          if (version.savePath) {
            finalPath = version.savePath;
          } else {
            finalPath = path.join(
              appSettings.dataPath,
              String(version.productId),
              version.moduleName || 'data_augmentation',
              version.versionName
            );
          }
        }
      }

      if (!finalPath || !fs.existsSync(finalPath)) {
        throw new Error(`Save path does not exist: ${finalPath}`);
      }

      const cocoPath = path.join(finalPath, 'annotations.json');
      if (!fs.existsSync(cocoPath)) {
        throw new Error('Annotations file not found');
      }

      const cocoData = JSON.parse(fs.readFileSync(cocoPath, 'utf-8'));
      const images = [];

      for (const imgEntry of cocoData.images) {
        const imgPath = path.join(finalPath, imgEntry.file_name);
        if (fs.existsSync(imgPath)) {
          const buffer = fs.readFileSync(imgPath);
          const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
          
          const imgAnnotations = cocoData.annotations.filter(ann => ann.image_id === imgEntry.id);
          
          images.push({
            id: imgEntry.id,
            imageUrl: base64,
            width: imgEntry.width,
            height: imgEntry.height,
            annotations: imgAnnotations.map(ann => {
              let type = 'polygon';
              let points = ann.segmentation[0];
              
              if (ann.segmentation[0].length === 8) {
                const p = ann.segmentation[0];
                if (p[0] === p[6] && p[1] === p[3] && p[2] === p[4] && p[5] === p[7]) {
                  type = 'rect';
                  points = [p[0], p[1], p[2] - p[0], p[5] - p[1]];
                }
              }

              return {
                id: ann.id,
                categoryId: ann.category_id,
                type,
                points
              };
            })
          });
        }
      }

      return { success: true, images };
    } catch (err) {
      console.error('Failed to load dataset:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('db:save-dataset-version', async (event, data) => {
    return await prisma.datasetVersion.create({
      data
    });
  });

  ipcMain.handle('db:get-dataset-versions', async (event, productId) => {
    return await prisma.datasetVersion.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    });
  });

  ipcMain.handle('db:delete-dataset-version', async (event, id) => {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const version = await prisma.datasetVersion.findUnique({
        where: { id: numericId }
      });

      if (version) {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const candidates = [
          version.savePath,
          path.join(
            appSettings.dataPath,
            String(version.productId),
            version.moduleName || 'data_augmentation',
            version.versionName
          )
        ]
          .filter(Boolean)
          .map(p => path.normalize(String(p).trim()));

        const uniqueCandidates = Array.from(new Set(candidates));
        let deletedAny = false;
        const failedCandidates = [];

        for (const candidatePath of uniqueCandidates) {
          if (!candidatePath) continue;
          if (!fs.existsSync(candidatePath)) continue;
          try {
            let realCandidatePath = candidatePath;
            try {
              realCandidatePath = fs.realpathSync.native(candidatePath);
            } catch {}

            console.log('Deleting physical data at:', realCandidatePath);

            let lastErr = null;
            for (let attempt = 0; attempt < 8; attempt++) {
              try {
                fs.rmSync(realCandidatePath, { recursive: true, force: true });
              } catch (err) {
                lastErr = err;
              }

              if (fs.existsSync(realCandidatePath) && process.platform === 'win32') {
                try {
                  require('child_process').execSync(`rmdir /s /q "${realCandidatePath}"`);
                } catch (cmdErr) {
                  lastErr = cmdErr;
                }
              }

              if (!fs.existsSync(realCandidatePath)) {
                deletedAny = true;
                lastErr = null;
                break;
              }
              
              await sleep(200);
            }

            if (lastErr) {
              failedCandidates.push({ path: realCandidatePath, error: lastErr?.message || String(lastErr) });
            } else if (fs.existsSync(realCandidatePath)) {
              failedCandidates.push({ path: realCandidatePath, error: 'Path still exists after deletion attempts' });
            }
          } catch (rmErr) {
            console.error('Failed to delete physical data at:', candidatePath, rmErr);
            failedCandidates.push({ path: candidatePath, error: rmErr?.message || String(rmErr) });
          }
        }

        if (!deletedAny) {
          console.warn('No physical data deleted. savePath:', version.savePath);
        }
        if (failedCandidates.length > 0) {
          throw new Error(`物理数据删除失败：${failedCandidates.map(f => `${f.path} (${f.error})`).join('; ')}`);
        }
      } else {
        console.warn('Dataset version not found for deletion, id:', numericId);
      }

      return await prisma.datasetVersion.delete({
        where: { id: numericId }
      });
    } catch (err) {
      console.error('Failed to delete dataset version:', err);
      throw err;
    }
  });

  // Training Record API
  ipcMain.handle('db:save-training-record', async (event, data) => {
    try {
      const existing = await prisma.trainingRecord.findUnique({
        where: { 
          taskUuid_labelName: { 
            taskUuid: data.taskId, 
            labelName: data.labelName 
          } 
        }
      });
      
      if (existing) {
        const updateData = {
          status: data.status,
          progress: data.progress,
          totalEpochs: data.totalEpochs,
          currentEpoch: data.currentEpoch,
          endTime: data.completedAt
        };
        if (data.metrics) updateData.metrics = JSON.stringify(data.metrics);
        if (data.logs) updateData.logs = JSON.stringify(data.logs);
        return await prisma.trainingRecord.update({
          where: { 
            taskUuid_labelName: { 
              taskUuid: data.taskId, 
              labelName: data.labelName 
            } 
          },
          data: updateData
        });
      } else {
        return await prisma.trainingRecord.create({
          data: {
            productId: data.productId,
            taskUuid: data.taskId,
            labelName: data.labelName,
            modelName: data.modelName || 'STFPM',
            config: '{}',
            status: data.status || 'pending',
            progress: data.progress || 0,
            totalEpochs: data.totalEpochs,
            currentEpoch: data.currentEpoch,
            metrics: JSON.stringify(data.metrics || []),
            logs: JSON.stringify(data.logs || []),
            outputPath: data.outputPath,
            startTime: data.startedAt,
            endTime: data.completedAt
          }
        });
      }
    } catch (err) {
      console.error('Failed to save training record:', err);
      throw err;
    }
  });

  ipcMain.handle('db:get-training-records', async (event, productId) => {
    try {
      const records = await prisma.trainingRecord.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' }
      });
      
      return records.map(r => ({
        ...r,
        metrics: JSON.parse(r.metrics || '[]'),
        logs: JSON.parse(r.logs || '[]')
      }));
    } catch (err) {
      console.error('Failed to get training records:', err);
      throw err;
    }
  });

  ipcMain.handle('db:get-training-record', async (event, { taskId, labelName }) => {
    try {
      const record = await prisma.trainingRecord.findUnique({
        where: { 
          taskUuid_labelName: { 
            taskUuid: taskId, 
            labelName: labelName 
          } 
        }
      });
      
      if (record) {
        return {
          ...record,
          metrics: JSON.parse(record.metrics || '[]'),
          logs: JSON.parse(record.logs || '[]')
        };
      }
      return record;
    } catch (err) {
      console.error('Failed to get training record:', err);
      throw err;
    }
  });

  ipcMain.handle('db:delete-training-record', async (event, { taskId, labelName }) => {
    try {
      return await prisma.trainingRecord.delete({
        where: { 
          taskUuid_labelName: { 
            taskUuid: taskId, 
            labelName: labelName 
          } 
        }
      });
    } catch (err) {
      console.error('Failed to delete training record:', err);
      throw err;
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
