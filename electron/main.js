const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const http = require('http');
const log = require('electron-log');

log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024;

const execAsync = util.promisify(exec);

let mainWindow;
let staticServer = null;

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

const dbPath = isDev
  ? path.join(__dirname, '../prisma/dev.db')
  : path.join(process.resourcesPath, 'prisma/dev.db');

const prismaGeneratedPath = isDev
  ? path.join(__dirname, '../prisma/generated/client')
  : path.join(process.resourcesPath, 'prisma/generated/client');

const { PrismaClient } = require(prismaGeneratedPath);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

function startStaticServer(publicPath) {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon',
      '.svg': 'image/svg+xml',
    };

    staticServer = http.createServer((req, res) => {
      let filePath = path.join(publicPath, req.url === '/' ? 'index.html' : req.url);
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.readFile(path.join(publicPath, 'index.html'), (err2, content2) => {
              if (err2) {
                res.writeHead(500);
                res.end('Server Error');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content2);
              }
            });
          } else {
            res.writeHead(500);
            res.end('Server Error');
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    staticServer.listen(0, '127.0.0.1', () => {
      const port = staticServer.address().port;
      resolve(port);
    });
  });
}

// 网络相机服务配置 - 将在 initCameraService 中从设置获取
let cameraServiceUrl = '';
let cameraServiceReady = false;

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

function createWindow(staticPort) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'One2All 视觉检测平台',
    icon: path.join(__dirname, '../renderer/public/favicon.ico'),
    backgroundColor: '#E0E0E0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`http://127.0.0.1:${staticPort}`);
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

async function checkCameraServiceHealth() {
  if (!cameraServiceUrl) {
    return false;
  }
  const healthUrl = `${cameraServiceUrl}/camera/list`;


  return new Promise((resolve) => {
    const urlObj = new URL(healthUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'GET',
      timeout: 10000
    };


    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', (err) => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function initCameraService(backendUrl) {

  cameraServiceUrl = backendUrl;
  const isReady = await checkCameraServiceHealth();
  cameraServiceReady = isReady;

  return isReady;
}

async function makeCameraApiRequest(endpoint, options = {}) {
  const url = `${cameraServiceUrl}${endpoint}`;
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

app.whenReady().then(async () => {
  let staticPort = 0;
  if (!isDev) {
    const publicPath = path.join(process.resourcesPath, 'renderer/.output/public');
    staticPort = await startStaticServer(publicPath);
  }
  createWindow(staticPort);

  let defaultDataPath = path.join(app.getPath('documents'), 'One2All', 'Data');

  async function loadSettingsFromDb() {
    try {
      let settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
      if (!settings) {
        settings = await prisma.appSettings.create({
          data: {
            id: 1,
            dataPath: defaultDataPath,
            locale: 'zh',
            backendMode: 'local',
            backendIp: 'localhost',
            backendUrl: 'http://localhost:8000',
            backendPort: '8000'
          }
        });
      }
      return {
        dataPath: settings.dataPath,
        locale: settings.locale,
        backendMode: settings.backendMode,
        backendIp: settings.backendIp,
        backendUrl: settings.backendUrl,
        backendPort: settings.backendPort,
        imageSettings: settings.imageSettings ? JSON.parse(settings.imageSettings) : { exposure: 6084, gain: 1.2, offsetX: 0, offsetY: 0 }
      };
    } catch (err) {
      console.error('Failed to load settings from database:', err);
      return {
        dataPath: defaultDataPath,
        locale: 'zh',
        backendMode: 'local',
        backendIp: 'localhost',
        backendUrl: 'http://localhost:8000',
        backendPort: '8000',
        imageSettings: { exposure: 6084, gain: 1.2, offsetX: 0, offsetY: 0 }
      };
    }
  }

  let appSettings = await loadSettingsFromDb();

  ipcMain.handle('settings:get', () => appSettings);
  ipcMain.handle('settings:save', async (event, newSettings) => {
    try {
      const dataToSave = {
        dataPath: newSettings.dataPath,
        locale: newSettings.locale,
        backendMode: newSettings.backendMode,
        backendIp: newSettings.backendIp,
        backendUrl: newSettings.backendUrl,
        backendPort: newSettings.backendPort
      };
      if (newSettings.imageSettings) {
        dataToSave.imageSettings = JSON.stringify(newSettings.imageSettings);
      }
      const updated = await prisma.appSettings.update({
        where: { id: 1 },
        data: dataToSave
      });
      appSettings = {
        dataPath: updated.dataPath,
        locale: updated.locale,
        backendMode: updated.backendMode,
        backendIp: updated.backendIp,
        backendUrl: updated.backendUrl,
        backendPort: updated.backendPort,
        imageSettings: updated.imageSettings ? JSON.parse(updated.imageSettings) : { exposure: 67, gain: 1.2 }
      };
      return true;
    } catch (err) {
      console.error('Failed to save settings:', err);
      return false;
    }
  });

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

  async function getSystemCameras() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic path Win32_PnPEntity where "PNPClass=\'Camera\' or PNPClass=\'Image\'" get Name /format:list');
        const lines = stdout.split('\n').filter(line => line.trim().startsWith('Name='));
        return lines.map((line, index) => {
          const name = line.replace('Name=', '').trim();
          return {
            id: `system_${index}`,
            name: name,
            deviceId: `camera_${index}`,
            isSystemCamera: true
          };
        });
      } else if (process.platform === 'darwin') {
        const { stdout } = await execAsync('system_profiler SPCameraDataType -json');
        const data = JSON.parse(stdout);
        const cameras = data?.SPCameraDataType || [];
        return cameras.map((cam, index) => ({
          id: `system_${index}`,
          name: cam._name || `Camera ${index + 1}`,
          deviceId: cam.spcamera_unique_id || `camera_${index}`,
          isSystemCamera: true
        }));
      } else {
        const { stdout } = await execAsync('ls /dev/video* 2>/dev/null || echo ""');
        const devices = stdout.trim().split('\n').filter(Boolean);
        return devices.map((device, index) => ({
          id: `system_${index}`,
          name: `Video Device ${index + 1}`,
          deviceId: device,
          isSystemCamera: true
        }));
      }
    } catch (err) {
      console.error('Failed to get system cameras:', err);
      return [];
    }
  }

  ipcMain.handle('camera:get-system-cameras', async () => {
    return await getSystemCameras();
  });

  ipcMain.handle('db:get-cameras', async () => {
    const dbCameras = await prisma.camera.findMany();

    for (const cam of dbCameras) {
      const config = cam.config ? JSON.parse(cam.config) : {};
      if (config.width && config.height) {
        cam.resolution = `${config.width}x${config.height}`;
      }
    }

    if (cameraServiceReady) {
      try {
        const response = await makeCameraApiRequest('/camera/list');
        if (response.success && response.cameras) {
          const serviceCameraIds = new Set(response.cameras.map(c => c.camera_id));

          for (const cam of response.cameras) {
            const existingCam = dbCameras.find(c => c.name === cam.camera_id);
            if (existingCam) {
              existingCam.status = cam.connected ? 'online' : 'offline';
              existingCam.ip = cam.ip_address;
              if (cam.resolution) {
                existingCam.resolution = cam.resolution;
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to get cameras from service:', err);
      }
    }

    return dbCameras;
  });

  ipcMain.handle('db:add-camera', async (event, camera) => {
    const cameraData = {
      name: camera.name || camera.cameraId || 'Unnamed Camera',
      ip: camera.ip || '127.0.0.1',
      status: camera.status || 'offline',
      config: camera.config || null,
      isNetworkCamera: camera.isNetworkCamera || false
    };

    if (cameraServiceReady && camera.isNetworkCamera) {
      try {
        const params = new URLSearchParams();
        params.append('camera_id', cameraData.name);
        params.append('ip_address', cameraData.ip);
        if (camera.width) params.append('width', String(camera.width));
        if (camera.height) params.append('height', String(camera.height));
        if (camera.exposureTime) params.append('exposure_time', String(camera.exposureTime));
        if (camera.gain) params.append('gain', String(camera.gain));
        if (camera.offsetX) params.append('offset_x', String(camera.offsetX));
        if (camera.offsetY) params.append('offset_y', String(camera.offsetY));

        const response = await makeCameraApiRequest('/camera/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        if (response.success) {
          const dbRecord = await prisma.camera.create({
            data: cameraData
          });
          return { ...dbRecord, serviceId: response.camera_id };
        }
      } catch (err) {
        console.error('Failed to add camera to service:', err);
      }
    }
    return await prisma.camera.create({
      data: cameraData
    });
  });

  ipcMain.handle('db:delete-camera', async (event, { id, isNetworkCamera, dbId }) => {
    if (cameraServiceReady && isNetworkCamera) {
      try {
        const response = await makeCameraApiRequest(`/camera/${id}/remove`, {
          method: 'POST'
        });
        if (response.success) {
          // 同时删除数据库记录
          await prisma.camera.delete({ where: { id: dbId } }).catch(() => {});
          return response;
        }
      } catch (err) {
        console.error('Failed to delete camera from service:', err);
      }
    }
    return await prisma.camera.delete({
      where: { id: dbId || id }
    });
  });

  ipcMain.handle('db:update-camera', async (event, { id, data }) => {
    if (cameraServiceReady && data.isNetworkCamera) {
      try {
        const params = new URLSearchParams();
        if (data.ip) params.append('ip_address', data.ip);
        if (data.width) params.append('width', String(data.width));
        if (data.height) params.append('height', String(data.height));

        const response = await makeCameraApiRequest(`/camera/${id}/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        if (response.success) {
          return response;
        }
      } catch (err) {
        console.error('Failed to update camera config:', err);
      }
    }
    return await prisma.camera.update({
      where: { id },
      data
    });
  });

  ipcMain.handle('camera:connect', async (event, { cameraId, exposureTime, gain, offsetX, offsetY, width, height }) => {

    if (cameraServiceReady) {
      try {
        const params = new URLSearchParams();
        if (exposureTime !== undefined && exposureTime !== null) params.append('exposure_time', String(Math.round(exposureTime)));
        if (gain !== undefined && gain !== null) params.append('gain', String(Math.round(gain)));
        if (offsetX !== undefined && offsetX !== null) params.append('offset_x', String(Math.round(offsetX)));
        if (offsetY !== undefined && offsetY !== null) params.append('offset_y', String(Math.round(offsetY)));
        if (width !== undefined && width !== null) params.append('width', String(Math.round(width)));
        if (height !== undefined && height !== null) params.append('height', String(Math.round(height)));

        const response = await makeCameraApiRequest(`/camera/${cameraId}/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const camera = await prisma.camera.findFirst({
          where: { name: cameraId }
        });
        if (camera) {
          const existingConfig = camera.config ? JSON.parse(camera.config) : {};
          const updatedConfig = {
            ...existingConfig,
            exposureTime,
            gain,
            offsetX,
            offsetY,
            width,
            height
          };
          await prisma.camera.update({
            where: { id: camera.id },
            data: { config: JSON.stringify(updatedConfig) }
          });
        }

        return response;
      } catch (err) {
        log.error('Failed to connect camera:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'Camera service not available' };
  });

  ipcMain.handle('camera:disconnect', async (event, cameraId) => {
    if (cameraServiceReady) {
      try {
        const response = await makeCameraApiRequest(`/camera/${cameraId}/disconnect`, {
          method: 'POST'
        });
        return response;
      } catch (err) {
        console.error('Failed to disconnect camera:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'Camera service not available' };
  });

  ipcMain.handle('camera:capture', async (event, cameraId, savePath) => {
    if (cameraServiceReady) {
      try {
        const query = savePath ? `?save_path=${encodeURIComponent(savePath)}&return_base64=true` : '?return_base64=true';
        const response = await makeCameraApiRequest(`/camera/${cameraId}/capture${query}`, {
          method: 'POST'
        });
        return response;
      } catch (err) {
        console.error('Failed to capture from camera:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'Camera service not available' };
  });

  ipcMain.handle('camera:get-status', async (event, cameraId) => {
    if (cameraServiceReady) {
      try {
        const response = await makeCameraApiRequest(`/camera/${cameraId}/status`);
        return response;
      } catch (err) {
        console.error('Failed to get camera status:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'Camera service not available' };
  });

  ipcMain.handle('camera:update-parameters', async (event, { cameraId, exposureTime, gain, offsetX, offsetY, width, height }) => {
    if (cameraServiceReady) {
      try {
        const params = new URLSearchParams();
        if (exposureTime !== undefined && exposureTime !== null) params.append('exposure_time', String(exposureTime));
        if (gain !== undefined && gain !== null) params.append('gain', String(gain));
        if (offsetX !== undefined && offsetX !== null) params.append('offset_x', String(offsetX));
        if (offsetY !== undefined && offsetY !== null) params.append('offset_y', String(offsetY));
        if (width !== undefined && width !== null) params.append('width', String(width));
        if (height !== undefined && height !== null) params.append('height', String(height));

        const response = await makeCameraApiRequest(`/camera/${cameraId}/parameters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const camera = await prisma.camera.findFirst({
          where: { name: cameraId }
        });
        if (camera) {
          const existingConfig = camera.config ? JSON.parse(camera.config) : {};
          const updatedConfig = {
            ...existingConfig,
            exposureTime,
            gain,
            offsetX,
            offsetY,
            width,
            height
          };
          await prisma.camera.update({
            where: { id: camera.id },
            data: { config: JSON.stringify(updatedConfig) }
          });
        }

        return response;
      } catch (err) {
        console.error('Failed to update camera parameters:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'Camera service not available' };
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

      // 检查产品是否已有图片，如果有则删除旧图片
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { lastImagePath: true }
      });

      if (product?.lastImagePath && fs.existsSync(product.lastImagePath)) {
        try {
          fs.unlinkSync(product.lastImagePath);
        } catch (deleteErr) {
          console.error('Failed to delete old image:', deleteErr);
        }
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
          cocoData.images[i].params = img.params;
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
        const version = await prisma.datasetVersion.findUnique({ where: { id } });
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
            params: imgEntry.params,
            annotations: imgAnnotations.map(ann => {
              let type = 'polygon';
              let points = ann.segmentation?.[0] || [];

              if (ann.rbbox && ann.rbbox.length >= 5) {
                type = 'rbbox';
                if (!points || points.length === 0) {
                  const [cx, cy, w, h, angle] = ann.rbbox;
                  const rad = (angle * Math.PI) / 180;
                  const cos = Math.cos(rad);
                  const sin = Math.sin(rad);
                  const dx = w / 2;
                  const dy = h / 2;
                  const corners = [
                    cx - dx * cos - (-dy) * sin, cy - dx * sin + (-dy) * cos,
                    cx + dx * cos - (-dy) * sin, cy + dx * sin + (-dy) * cos,
                    cx + dx * cos - dy * sin, cy + dx * sin + dy * cos,
                    cx - dx * cos - dy * sin, cy - dx * sin + dy * cos,
                  ];
                  points = corners;
                }
              } else if (points.length === 8) {
                const p = points;
                if (p[0] === p[6] && p[1] === p[3] && p[2] === p[4] && p[5] === p[7]) {
                  type = 'rect';
                  points = [p[0], p[1], p[2] - p[0], p[5] - p[1]];
                }
              }

              return {
                id: ann.id,
                categoryId: ann.category_id,
                type,
                points,
                rbbox: ann.rbbox,
                posId: ann.pos_id,
                segmentation: ann.segmentation,
                angle: ann.angle || 0,
                horizontal_flip: ann.horizontal_flip || false,
                vertical_flip: ann.vertical_flip || false
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
      const version = await prisma.datasetVersion.findUnique({
        where: { id }
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
      const labelName = data.labelName || 'default'
      const updateData = {
        status: data.status,
        progress: data.progress,
        totalEpochs: data.totalEpochs,
        currentEpoch: data.currentEpoch,
        endTime: data.completedAt
      };
      if (data.metrics) updateData.metrics = JSON.stringify(data.metrics);
      if (data.logs) updateData.logs = JSON.stringify(data.logs);
      if (data.batchSize != null) updateData.batchSize = data.batchSize;
      if (data.learningRate != null) updateData.learningRate = data.learningRate;

      return await prisma.trainingRecord.upsert({
        where: {
          taskUuid_labelName: {
            taskUuid: data.taskId,
            labelName
          }
        },
        update: updateData,
        create: {
          productId: data.productId,
          taskUuid: data.taskId,
          labelName,
          modelName: data.modelName || 'PatchCore',
          config: '{}',
          status: data.status || 'pending',
          progress: data.progress || 0,
          totalEpochs: data.totalEpochs,
          currentEpoch: data.currentEpoch,
          batchSize: data.batchSize,
          learningRate: data.learningRate,
          metrics: JSON.stringify(data.metrics || []),
          logs: JSON.stringify(data.logs || []),
          outputPath: data.outputPath,
          startTime: data.startedAt,
          endTime: data.completedAt
        }
      });
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
      
      // 过滤掉组记录（labelName 包含"个任务"、"个类别"、"统一训练"等的记录）
      const filteredRecords = records.filter(r => {
        const labelName = r.labelName || '';
        // 排除组记录
        if (labelName.includes('个任务') || labelName.includes('个类别') || labelName === '统一训练') {
          return false;
        }
        return true;
      });
      
      return filteredRecords.map(r => ({
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

  ipcMain.handle('db:get-training-records-by-task-uuid', async (event, taskUuid) => {
    try {
      const records = await prisma.trainingRecord.findMany({
        where: { taskUuid },
        orderBy: { createdAt: 'desc' }
      });
      return records.map(r => ({
        ...r,
        metrics: JSON.parse(r.metrics || '[]'),
        logs: JSON.parse(r.logs || '[]')
      }));
    } catch (err) {
      console.error('Failed to get training records by taskUuid:', err);
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

  // 所有 IPC handler 注册完成后，初始化相机服务
  initCameraService(appSettings.backendUrl);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(staticPort);
  });
});

app.on('window-all-closed', function () {
  if (staticServer) {
    staticServer.close();
  }
  if (process.platform !== 'darwin') app.quit();
});
