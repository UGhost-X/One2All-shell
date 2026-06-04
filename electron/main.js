const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const http = require('http');
const log = require('electron-log');
const ModbusRTU = require('modbus-serial');

log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024;

const execAsync = util.promisify(exec);

let mainWindow;
let staticServer = null;
let buttonMonitor = null;

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

async function ensureCameraServiceReady() {
  if (cameraServiceReady) return true;
  // 后端可能后启动，尝试重新检测
  if (cameraServiceUrl) {
    const isReady = await checkCameraServiceHealth();
    cameraServiceReady = isReady;
    return isReady;
  }
  return false;
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
          if (res.statusCode === 404) {
            json.statusCode = 404;
          }
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

// ========== Modbus 按钮触发配置（默认值，会被DB配置覆盖） ==========
let modbusConfig = {
  enabled: true,           // 是否启用按钮监控
  ip: '192.168.1.12',
  port: 502,
  unitId: 1,
  buttonChannel: 1,      // 拍照按钮 → DI 通道 1（端子 0.1）
  resetChannel: 2,        // 复位按钮 → DI 通道 2（端子 0.2）
  lightGreen: 0,          // 绿灯 → 输出点 0.0
  lightYellow: 1,         // 黄灯 → 输出点 0.1
  lightRed: 2,            // 红灯 → 输出点 0.2
  buzzer: 3,              // 蜂鸣器 → 输出点 0.3
};

// 三色灯 + 蜂鸣器对应的继电器输出通道（通过 modbusConfig 动态引用）

class ButtonMonitor {
  constructor(ip, port, unit) {
    this.ip = ip;
    this.port = port;
    this.unit = unit;
    this.client = new ModbusRTU();
    this.lastButtonState = false;
    this.lastResetState = false;
    this.errorState = false;
    this.running = false;
    this.connected = false;
  }

  async connect(timeoutMs = 5000) {
    try {
      const connectPromise = (async () => {
        await this.client.connectTCP(this.ip, { port: this.port });
        await this.client.setID(this.unit);
        await this.client.readDiscreteInputs(modbusConfig.buttonChannel, 1);
      })();
      await Promise.race([
        connectPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('连接超时')), timeoutMs))
      ]);
      log.info(`[ButtonMonitor] Modbus 已连接并验证: ${this.ip}:${this.port}`);
      this.connected = true;
      return true;
    } catch (err) {
      log.error(`[ButtonMonitor] Modbus 连接/验证失败: ${err.message}`);
      try { this.client.close(); } catch (_) {}
      this.connected = false;
      return false;
    }
  }

  async readButtonState(channel) {
    try {
      const result = await this.client.readDiscreteInputs(channel, 1);
      return result.data[0];
    } catch (err) {
      log.error(`[ButtonMonitor] 读取 DI 通道 ${channel} 异常: ${err.message}`);
      return null;
    }
  }

  async writeCoil(channel, value) {
    if (!this.client.isOpen) return;
    try {
      await this.client.writeCoil(channel, value);
    } catch (err) {
      log.error(`[ButtonMonitor] 写线圈 ${channel} 异常: ${err.message}`);
    }
  }

  async lightOn(channel) { await this.writeCoil(channel, true); }
  async lightOff(channel) { await this.writeCoil(channel, false); }
  async buzzerOn() { await this.writeCoil(modbusConfig.buzzer, true); }
  async buzzerOff() { await this.writeCoil(modbusConfig.buzzer, false); }

  async allOff() {
    for (const ch of [modbusConfig.lightRed, modbusConfig.lightYellow, modbusConfig.lightGreen, modbusConfig.buzzer]) {
      await this.writeCoil(ch, false);
    }
  }

  async pollLoop(pollInterval = 100) {
    this.running = true;
    await this.lightOn(modbusConfig.lightGreen);  // 绿灯：系统就绪
    log.info(`[ButtonMonitor] 开始监控按钮（拍照: DI${modbusConfig.buttonChannel}, 复位: DI${modbusConfig.resetChannel}），轮询间隔 ${pollInterval}ms`);

    while (this.running) {
      const btnState = await this.readButtonState(modbusConfig.buttonChannel);
      const resetState = await this.readButtonState(modbusConfig.resetChannel);

      if (btnState === null || resetState === null) {
        log.info('[ButtonMonitor] 读取失败，尝试重连...');
        try { this.client.close(); } catch (_) {}
        await new Promise(r => setTimeout(r, 1000));
        await this.connect();
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      // ---- 拍照按钮（上升沿）----
      if (btnState && !this.lastButtonState) {
        log.info('[ButtonMonitor] 拍照按钮按下');

        if (this.errorState) await this.lightOff(modbusConfig.lightRed);

        await this.lightOff(modbusConfig.lightGreen);
        await this.lightOn(modbusConfig.lightYellow);

        let success = false;

        if (mainWindow && !mainWindow.isDestroyed()) {
          // 非阻塞触发拍照：避免长时间 await 导致 Modbus 模块看门狗超时熄灭黄灯
          let captureDone = false;
          let captureResult = null;

          mainWindow.webContents.executeJavaScript(
            'window.__externalCapture ? window.__externalCapture() : ({ success: false, error: "渲染进程未就绪" })'
          ).then(r => {
            captureResult = r;
            captureDone = true;
          }).catch(err => {
            log.error(`[ButtonMonitor] 触发拍照异常: ${err.message}`);
            captureResult = { success: false, error: err.message };
            captureDone = true;
          });

          // 轮询等待，同时每 2 秒重写黄灯信号，保持 Modbus 通信活跃
          while (!captureDone) {
            await new Promise(r => setTimeout(r, 2000));
            if (!captureDone) {
              await this.lightOn(modbusConfig.lightYellow).catch(() => {});
            }
          }

          success = captureResult && captureResult.success === true;
          if (!success) {
            log.warn(`[ButtonMonitor] 拍照失败: ${captureResult?.error || '未知错误'}`);
          }
        } else {
          log.error('[ButtonMonitor] App 窗口未就绪');
        }

        await this.lightOff(modbusConfig.lightYellow);

        if (success) {
          await new Promise(r => setTimeout(r, 300));
          await this.lightOn(modbusConfig.lightGreen);
          this.errorState = false;
          log.info('[ButtonMonitor] 拍照成功，恢复绿灯');
        } else {
          await this.buzzerOn();
          await this.lightOn(modbusConfig.lightRed);
          await new Promise(r => setTimeout(r, 1000));
          await this.buzzerOff();
          this.errorState = true;
          log.info('[ButtonMonitor] 拍照异常，红灯常亮');
        }
      }

      // ---- 复位按钮（上升沿）----
      if (resetState && !this.lastResetState) {
        log.info('[ButtonMonitor] 复位按钮按下');
        if (this.errorState) {
          await this.lightOff(modbusConfig.lightRed);
          await this.lightOn(modbusConfig.lightGreen);
          this.errorState = false;
        }
      }

      this.lastButtonState = btnState;
      this.lastResetState = resetState;
      await new Promise(r => setTimeout(r, pollInterval));
    }
  }

  async stop() {
    this.running = false;
    this.connected = false;
    try {
      await this.allOff();
      this.client.close();
      log.info('[ButtonMonitor] 已停止');
    } catch (_) {}
  }
}
// ==========================================

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
        imageSettings: settings.imageSettings ? JSON.parse(settings.imageSettings) : { exposure: 6084, gain: 1.2, offsetX: 0, offsetY: 0 },
        modbusSettings: settings.modbusSettings ? JSON.parse(settings.modbusSettings) : { ...modbusConfig }
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
        imageSettings: { exposure: 6084, gain: 1.2, offsetX: 0, offsetY: 0 },
        modbusSettings: { ...modbusConfig }
      };
    }
  }

  let appSettings = await loadSettingsFromDb();

  // 应用 Modbus 配置
  if (appSettings.modbusSettings) {
    Object.assign(modbusConfig, appSettings.modbusSettings);
  }

  async function stopButtonMonitor() {
    if (buttonMonitor) {
      await buttonMonitor.stop();
      buttonMonitor = null;
    }
  }

  async function startButtonMonitor() {
    await stopButtonMonitor();
    if (!modbusConfig.enabled) {
      log.info('[ButtonMonitor] 按钮监控已禁用');
      return;
    }
    buttonMonitor = new ButtonMonitor(modbusConfig.ip, modbusConfig.port, modbusConfig.unitId);
    // 先尝试连接，等待结果
    const connected = await buttonMonitor.connect();
    if (connected) {
      // 连接成功，启动后台轮询
      buttonMonitor.running = true;
      buttonMonitor.pollLoop(100).catch(err => log.error('[ButtonMonitor] 轮询异常:', err));
      log.info('[ButtonMonitor] Modbus 连接成功，监控已启动');
    } else {
      log.error('[ButtonMonitor] Modbus 连接失败，监控未启动');
    }
  }

  // 初始启动
  startButtonMonitor();

  ipcMain.handle('modbus:status', () => {
    return {
      enabled: modbusConfig.enabled ?? false,
      ip: modbusConfig.ip,
      port: modbusConfig.port,
      connected: buttonMonitor ? buttonMonitor.connected : false
    };
  });

  ipcMain.handle('modbus:stop', async () => {
    await stopButtonMonitor();
    return { success: true };
  });

  ipcMain.handle('modbus:restart', async () => {
    await startButtonMonitor();
    const connected = buttonMonitor ? buttonMonitor.connected : false;
    return { success: true, connected };
  });

  ipcMain.handle('settings:get', () => {
    return appSettings;
  });
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
      if (newSettings.modbusSettings) {
        dataToSave.modbusSettings = JSON.stringify(newSettings.modbusSettings);
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
        imageSettings: updated.imageSettings ? JSON.parse(updated.imageSettings) : { exposure: 67, gain: 1.2 },
        modbusSettings: updated.modbusSettings ? JSON.parse(updated.modbusSettings) : { ...modbusConfig }
      };
      // 应用新的 Modbus 配置
      if (appSettings.modbusSettings) {
        Object.assign(modbusConfig, appSettings.modbusSettings);
      }
      // 不在此处等待连接，由 modbus:restart IPC 显式控制
      // 重新初始化相机服务，使用新的后端URL
      await initCameraService(appSettings.backendUrl);
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

  ipcMain.handle('db:update-product', async (event, { id, data }) => {
    return await prisma.product.update({
      where: { id },
      data
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

    if (await ensureCameraServiceReady()) {
      try {
        const response = await makeCameraApiRequest('/camera/list');
        if (response.success && response.cameras) {
          const serviceCameraIds = new Set(response.cameras.map(c => c.camera_id));

          for (const cam of response.cameras) {
            const existingCam = dbCameras.find(c => c.name === cam.camera_id);
            if (existingCam) {
              existingCam.status = cam.connected ? 'online' : 'offline';
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

    if (await ensureCameraServiceReady() && camera.isNetworkCamera) {
      try {
        const params = new URLSearchParams();
        params.append('camera_id', cameraData.name);
        params.append('vendor', camera.vendor || 'Basler');
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
    if (await ensureCameraServiceReady() && isNetworkCamera) {
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
    if (await ensureCameraServiceReady() && data.isNetworkCamera) {
      try {
        const params = new URLSearchParams();
        if (data.ip) params.append('ip_address', data.ip);
        if (data.width) params.append('width', String(data.width));
        if (data.height) params.append('height', String(data.height));

        await makeCameraApiRequest(`/camera/${id}/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application-x-www-form-urlencoded'
          },
          body: params.toString()
        });
      } catch (err) {
        console.error('Failed to update camera config:', err);
      }
    }
    return await prisma.camera.update({
      where: { id },
      data
    });
  });

  ipcMain.handle('camera:connect', async (event, { cameraId, ipAddress, vendor, exposureTime, gain, offsetX, offsetY, width, height }) => {

    if (await ensureCameraServiceReady()) {
      try {
        const params = new URLSearchParams();
        params.append('vendor', vendor || 'Basler');
        if (ipAddress) params.append('ip_address', ipAddress);
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
            vendor: vendor || 'Basler',
            ipAddress,
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
    if (await ensureCameraServiceReady()) {
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
    if (await ensureCameraServiceReady()) {
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
    if (await ensureCameraServiceReady()) {
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

  ipcMain.handle('camera:update-parameters', async (event, { cameraId, exposureTime, gain, offsetX, offsetY }) => {
    if (await ensureCameraServiceReady()) {
      try {
        const params = new URLSearchParams();
        if (exposureTime !== undefined && exposureTime !== null) params.append('exposure_time', String(Math.round(exposureTime)));
        if (gain !== undefined && gain !== null) params.append('gain', String(Math.round(gain)));
        if (offsetX !== undefined && offsetX !== null) params.append('offset_x', String(Math.round(offsetX)));
        if (offsetY !== undefined && offsetY !== null) params.append('offset_y', String(Math.round(offsetY)));

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
            offsetY
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

  // 格式化日期为 YYYY-MM-DD hh:mm:ss
  const formatDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // 保存ROI图片 - 支持两种模式：
  // 1. manual: 用户手动保存（只保存修改过的ROI）-> extra-picture/{taskUuid}/{datetime}/{category}/NG|OK
  // 2. auto: 自动保存（每次请求后保存所有ROI）-> request-result/{taskUuid}/{datetime}/{category}/NG|OK
  ipcMain.handle('storage:save-roi-images', async (event, { productId, taskUuid, images, mode = 'auto', requestTime }) => {
    try {
      const baseDir = appSettings.dataPath;
      const savedRois = [];
      
      // 使用传入的时间或当前时间
      const datetime = requestTime || formatDateTime(new Date());
      
      // 根据模式确定基础目录
      const baseSubDir = mode === 'manual' ? 'extra-picture' : 'request-result';

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const category = img.category || 'unknown';
        const status = img.isAnomaly ? 'NG' : 'OK';
        
        // 构建目标目录: {baseDir}/{productId}/{baseSubDir}/{taskUuid}/{datetime}/{category}/{status}
        // 使用短横线替换datetime中的空格和冒号，避免Windows路径问题
        const safeDatetime = datetime.replace(/[:\s]/g, '-');
        const targetDir = path.join(baseDir, String(productId), baseSubDir, String(taskUuid), safeDatetime, category, status);

        // 确保目录存在（使用递归创建）
        try {
          fs.mkdirSync(targetDir, { recursive: true });
        } catch (mkdirErr) {
          console.error('Failed to create directory:', targetDir, mkdirErr);
          throw mkdirErr;
        }

        const fileName = `image_${Date.now()}_${i + 1}.jpg`;
        const filePath = path.join(targetDir, fileName);
        const base64Data = img.base64.split(',')[1];
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        // 计算ROI类型
        let roiType = 'NORMAL';
        if (img.modelIsAnomaly === true && img.userIsAnomaly === false) {
          roiType = 'FP'; // False Positive: 模型NG，用户OK
        } else if (img.modelIsAnomaly === false && img.userIsAnomaly === true) {
          roiType = 'FN'; // False Negative: 模型OK，用户NG
        }

        // 只有手动保存的ROI才存入数据库（用于重训）
        let roiRecord = null;
        
        if (mode === 'manual') {
          roiRecord = await prisma.roiImage.create({
            data: {
              productId: String(productId),
              sourceTaskUuid: String(taskUuid),
              category: category,
              modelIsAnomaly: img.modelIsAnomaly ?? img.isAnomaly,
              userIsAnomaly: img.userIsAnomaly ?? img.isAnomaly,
              roiType: roiType,
              filePath: filePath,
              fileName: fileName,
              posId: img.posId || null,
              generation: 0
            }
          });
        }

        savedRois.push({
          id: roiRecord?.id,
          filePath: filePath,
          roiType: roiType,
          mode: mode
        });
      }

      return { success: true, rois: savedRois };
    } catch (err) {
      console.error('Failed to save ROI images:', err);
      return { success: false, error: err.message };
    }
  });

  // 更新ROI类型（用户标记后）
  ipcMain.handle('storage:update-roi-type', async (event, { productId, taskUuid, category, fileName, userIsAnomaly }) => {
    try {
      // 查找对应的ROI记录
      const roi = await prisma.roiImage.findFirst({
        where: {
          productId: String(productId),
          sourceTaskUuid: String(taskUuid),
          category: category,
          fileName: fileName
        }
      });

      if (!roi) {
        return { success: false, error: 'ROI not found' };
      }

      // 计算新的ROI类型
      let roiType = 'NORMAL';
      if (roi.modelIsAnomaly === true && userIsAnomaly === false) {
        roiType = 'FP';
      } else if (roi.modelIsAnomaly === false && userIsAnomaly === true) {
        roiType = 'FN';
      }

      // 更新记录
      await prisma.roiImage.update({
        where: { id: roi.id },
        data: {
          userIsAnomaly: userIsAnomaly,
          roiType: roiType
        }
      });

      return { success: true, roiType: roiType };
    } catch (err) {
      console.error('Failed to update ROI type:', err);
      return { success: false, error: err.message };
    }
  });

  // 获取可用的ROI列表
  ipcMain.handle('storage:get-available-rois', async (event, { productId, baseTaskUuid, roiType }) => {
    try {
      const fs = require('fs');

      // 构建基础查询条件
      const whereClause = {
        productId: String(productId),
      };

      if (roiType) {
        whereClause.roiType = roiType;
      }

      // 如果指定了 baseTaskUuid，进行 generation 和祖先任务过滤
      if (baseTaskUuid) {
        const baseTask = await prisma.trainingRecord.findFirst({
          where: {
            taskUuid: baseTaskUuid,
            isRetrain: true
          }
        });

        const baseGeneration = baseTask?.generation ?? 0;
        const baseTaskChain = baseTask?.taskChain || '';

        const ancestorTasks = baseTaskChain
          ? [...baseTaskChain.split(','), baseTaskUuid]
          : [baseTaskUuid];

        whereClause.generation = { lte: baseGeneration };

        const allRois = await prisma.roiImage.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' }
        });

        const availableRois = allRois.filter(roi => {
          if (!roi.usedInRetrain || !roi.usedTaskUuid) return true;
          if (roi.usedTaskUuid === baseTaskUuid) return false;
          if (ancestorTasks.includes(roi.usedTaskUuid)) return true;
          return true;
        });

        const roisWithFileCheck = availableRois.map(roi => ({
          ...roi,
          fileExists: fs.existsSync(roi.filePath)
        }));

        return { success: true, rois: roisWithFileCheck };
      }

      // 未指定 baseTaskUuid：返回该 product 下所有 ROI，不做 generation 过滤
      const allRois = await prisma.roiImage.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      const roisWithFileCheck = allRois.map(roi => ({
        ...roi,
        fileExists: fs.existsSync(roi.filePath)
      }));

      return { success: true, rois: roisWithFileCheck };
    } catch (err) {
      console.error('Failed to get available ROIs:', err);
      return { success: false, error: err.message };
    }
  });

  // 标记ROI为已使用
  ipcMain.handle('storage:mark-rois-used', async (event, { roiIds, usedTaskUuid }) => {
    try {
      await prisma.roiImage.updateMany({
        where: {
          id: { in: roiIds }
        },
        data: {
          usedInRetrain: true,
          usedTaskUuid: usedTaskUuid,
          usedAt: new Date()
        }
      });

      return { success: true };
    } catch (err) {
      console.error('Failed to mark ROIs as used:', err);
      return { success: false, error: err.message };
    }
  });

  // 批量删除 ROI
  ipcMain.handle('storage:delete-rois', async (event, { roiIds }) => {
    try {
      if (!roiIds || !Array.isArray(roiIds) || roiIds.length === 0) {
        return { success: false, error: 'No ROI IDs provided' };
      }

      // 先查询要删除的ROI信息（用于删除文件）
      const roisToDelete = await prisma.roiImage.findMany({
        where: { id: { in: roiIds } }
      });

      const fs = require('fs');
      let deletedFiles = 0;
      for (const roi of roisToDelete) {
        try {
          if (roi.filePath && fs.existsSync(roi.filePath)) {
            fs.unlinkSync(roi.filePath);
            deletedFiles++;
          }
          if (roi.thumbnailPath && fs.existsSync(roi.thumbnailPath)) {
            fs.unlinkSync(roi.thumbnailPath);
          }
        } catch (fileErr) {
          console.warn(`Failed to delete ROI file: ${roi.filePath}`, fileErr);
        }
      }

      // 从数据库删除
      await prisma.roiImage.deleteMany({
        where: { id: { in: roiIds } }
      });

      return { success: true, deletedCount: roiIds.length, deletedFiles };
    } catch (err) {
      console.error('Failed to delete ROIs:', err);
      return { success: false, error: err.message };
    }
  });

  // 创建重训任务记录 - 使用 TrainingRecord 表
  ipcMain.handle('storage:create-retrain-task', async (event, data) => {
    try {
      // 重训任务使用第一个 path_id 作为主记录
      const firstPathId = data.pathId || '1';
      const task = await prisma.trainingRecord.create({
        data: {
          productId: String(data.productId),
          taskUuid: data.newTaskUuid,
          labelName: firstPathId,  // 使用 pathId 作为 labelName
          modelName: `retrain_${data.newTaskUuid}`,
          config: JSON.stringify({
            yoloEpochs: data.yoloEpochs,
            yoloBatch: data.yoloBatch,
            yoloImgsz: data.yoloImgsz
          }),
          status: 'pending',
          isRetrain: true,
          baseTaskUuid: data.baseTaskUuid,
          pathId: firstPathId,
          taskChain: data.taskChain || '',
          generation: data.generation || 1,
          fpCount: data.fpCount || 0,
          fnCount: data.fnCount || 0,
          yoloEpochs: data.yoloEpochs,
          yoloBatch: data.yoloBatch,
          yoloImgsz: data.yoloImgsz
        }
      });

      return { success: true, task: task };
    } catch (err) {
      console.error('Failed to create retrain task:', err);
      return { success: false, error: err.message };
    }
  });

  // 获取单个重训任务（通过 taskUuid 查询）
  ipcMain.handle('storage:get-retrain-task', async (event, { taskUuid }) => {
    try {
      const task = await prisma.trainingRecord.findFirst({
        where: { 
          taskUuid: taskUuid,
          isRetrain: true
        }
      });

      return { success: true, task: task };
    } catch (err) {
      console.error('Failed to get retrain task:', err);
      return { success: false, error: err.message };
    }
  });

  // 更新重训任务状态
  ipcMain.handle('storage:update-retrain-task', async (event, { taskId, status, message }) => {
    try {
      const task = await prisma.trainingRecord.update({
        where: { id: taskId },
        data: {
          status: status,
          logs: message || ''
        }
      });

      return { success: true, task: task };
    } catch (err) {
      console.error('Failed to update retrain task:', err);
      return { success: false, error: err.message };
    }
  });

  // 获取重训任务列表
  ipcMain.handle('storage:get-retrain-tasks', async (event, { productId, baseTaskUuid }) => {
    try {
      const whereClause = {
        isRetrain: true
      };
      if (productId) whereClause.productId = String(productId);
      if (baseTaskUuid) whereClause.baseTaskUuid = baseTaskUuid;

      const tasks = await prisma.trainingRecord.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      return { success: true, tasks: tasks };
    } catch (err) {
      console.error('Failed to get retrain tasks:', err);
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
      
      // 先查询是否已存在记录（可能是重训记录）
      const existingRecord = await prisma.trainingRecord.findUnique({
        where: {
          taskUuid_labelName: {
            taskUuid: data.taskId,
            labelName
          }
        }
      });
      
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
      // 如果是重训记录，保留重训相关字段
      if (existingRecord?.isRetrain) {
        updateData.isRetrain = true;
        if (existingRecord.baseTaskUuid) updateData.baseTaskUuid = existingRecord.baseTaskUuid;
        if (existingRecord.pathId) updateData.pathId = existingRecord.pathId;
        if (existingRecord.taskChain) updateData.taskChain = existingRecord.taskChain;
        if (existingRecord.generation != null) updateData.generation = existingRecord.generation;
        if (existingRecord.fpCount != null) updateData.fpCount = existingRecord.fpCount;
        if (existingRecord.fnCount != null) updateData.fnCount = existingRecord.fnCount;
        if (existingRecord.encoderName) updateData.encoderName = existingRecord.encoderName;
        if (existingRecord.decoderDepth != null) updateData.decoderDepth = existingRecord.decoderDepth;
        if (existingRecord.epochs != null) updateData.epochs = existingRecord.epochs;
        if (existingRecord.freezeEncoder != null) updateData.freezeEncoder = existingRecord.freezeEncoder;
      }

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
      // 但保留重训记录（isRetrain = true）
      const filteredRecords = records.filter(r => {
        // 保留重训记录
        if (r.isRetrain) {
          return true;
        }
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

  // ========== 识别工作流 IPC handlers ==========

  // 查询所有工作流（含步骤）
  ipcMain.handle('workflow:list', async () => {
    return await prisma.workflow.findMany({
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { updatedAt: 'desc' }
    });
  });

  // 查询单个工作流
  ipcMain.handle('workflow:get', async (event, id) => {
    return await prisma.workflow.findUnique({
      where: { id },
      include: { steps: { orderBy: { orderIndex: 'asc' } } }
    });
  });

  // 创建工作流 + 步骤
  ipcMain.handle('workflow:create', async (event, { name, description, steps }) => {
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        steps: {
          create: steps.map((s) => ({
            orderIndex: s.orderIndex,
            cameraId: s.cameraId || null,
            productId: s.productId || null,
            timeoutMs: s.timeoutMs || 30000
          }))
        }
      },
      include: { steps: { orderBy: { orderIndex: 'asc' } } }
    });
    return workflow;
  });

  // 更新工作流（删旧步骤 + 建新步骤）
  ipcMain.handle('workflow:update', async (event, { id, name, description, steps }) => {
    // 删除旧步骤
    await prisma.workflowStep.deleteMany({ where: { workflowId: id } });
    // 更新工作流并创建新步骤
    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        name,
        description,
        steps: {
          create: steps.map((s) => ({
            orderIndex: s.orderIndex,
            cameraId: s.cameraId || null,
            productId: s.productId || null,
            timeoutMs: s.timeoutMs || 30000
          }))
        }
      },
      include: { steps: { orderBy: { orderIndex: 'asc' } } }
    });
    return workflow;
  });

  // 删除工作流
  ipcMain.handle('workflow:delete', async (event, id) => {
    await prisma.workflow.delete({ where: { id } });
    return { success: true };
  });

  // 保存步骤执行结果
  ipcMain.handle('workflow:save-step-result', async (event, data) => {
    return await prisma.workflowStepResult.create({
      data: {
        executionId: data.executionId,
        stepId: data.stepId,
        stepOrderIndex: data.stepOrderIndex,
        cameraId: data.cameraId || null,
        productId: data.productId || null,
        status: data.status || 'pending',
        imagePath: data.imagePath || null,
        inferenceResult: data.inferenceResult || null,
        isAnomaly: data.isAnomaly ?? null,
        anomalyCount: data.anomalyCount ?? null,
        errorMessage: data.errorMessage || null,
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        completedAt: data.completedAt ? new Date(data.completedAt) : null
      }
    });
  });

  // 查询单次执行记录（含步骤结果）
  ipcMain.handle('workflow:get-execution', async (event, id) => {
    return await prisma.workflowExecution.findUnique({
      where: { id },
      include: {
        workflow: true,
        stepResults: { orderBy: { stepOrderIndex: 'asc' } }
      }
    });
  });

  // 列出工作流的执行历史
  ipcMain.handle('workflow:list-executions', async (event, workflowId) => {
    return await prisma.workflowExecution.findMany({
      where: { workflowId },
      include: {
        stepResults: { orderBy: { stepOrderIndex: 'asc' } }
      },
      orderBy: { startedAt: 'desc' }
    });
  });

  // ========== 工作流执行时创建 execution 记录 ==========
  ipcMain.handle('workflow:create-execution', async (event, { workflowId }) => {
    return await prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'running'
      }
    });
  });

  // 更新执行记录状态
  ipcMain.handle('workflow:update-execution', async (event, { id, status }) => {
    const data = { status };
    if (status === 'completed' || status === 'failed') {
      data.completedAt = new Date();
    }
    return await prisma.workflowExecution.update({
      where: { id },
      data
    });
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(staticPort);
  });
});

app.on('window-all-closed', async function () {
  if (buttonMonitor) {
    await buttonMonitor.stop();
  }
  if (staticServer) {
    staticServer.close();
  }
  if (process.platform !== 'darwin') app.quit();
});
