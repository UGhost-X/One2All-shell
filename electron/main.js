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

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
