const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  isAlwaysOnTop: () => ipcRenderer.invoke('is-always-on-top'),
  // Database
  getProducts: () => ipcRenderer.invoke('db:get-products'),
  addProduct: (product) => ipcRenderer.invoke('db:add-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('db:delete-product', id),
  getCameras: () => ipcRenderer.invoke('db:get-cameras'),
  addCamera: (camera) => ipcRenderer.invoke('db:add-camera', camera),
  deleteCamera: (id, isNetworkCamera, dbId) => ipcRenderer.invoke('db:delete-camera', { id, isNetworkCamera, dbId }),
  updateCamera: (id, data) => ipcRenderer.invoke('db:update-camera', { id, data }),
  getSystemCameras: () => ipcRenderer.invoke('camera:get-system-cameras'),
  // Network Camera API
  connectCamera: (cameraId, params) => ipcRenderer.invoke('camera:connect', { cameraId, ...params }),
  disconnectCamera: (cameraId) => ipcRenderer.invoke('camera:disconnect', cameraId),
  captureFromCamera: (cameraId, savePath) => ipcRenderer.invoke('camera:capture', cameraId, savePath),
  getCameraStatus: (cameraId) => ipcRenderer.invoke('camera:get-status', cameraId),
  updateCameraParameters: (cameraId, params) => ipcRenderer.invoke('camera:update-parameters', { cameraId, ...params }),
  // Annotation Schemes
  getSchemes: () => ipcRenderer.invoke('db:get-schemes'),
  saveScheme: (scheme) => ipcRenderer.invoke('db:save-scheme', scheme),
  deleteScheme: (id) => ipcRenderer.invoke('db:delete-scheme', id),
  bindScheme: (productId, schemeId) => ipcRenderer.invoke('db:bind-scheme', { productId, schemeId }),
  // Annotation Results
  getAnnotations: (productId, imagePath) => ipcRenderer.invoke('db:get-annotations', { productId, imagePath }),
  saveAnnotations: (productId, imagePath, data) => ipcRenderer.invoke('db:save-annotations', { productId, imagePath, data }),
  openFile: () => ipcRenderer.invoke('dialog:open-file'),
  selectDirectory: () => ipcRenderer.invoke('dialog:select-directory'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  saveImage: (data) => ipcRenderer.invoke('storage:save-image', data),
  loadImage: (path) => ipcRenderer.invoke('storage:load-image', path),
  getProductImages: (productId) => ipcRenderer.invoke('storage:get-product-images', productId),
  saveDataset: (data) => ipcRenderer.invoke('storage:save-dataset', data),
  loadDataset: (params) => ipcRenderer.invoke('storage:load-dataset', params),
  saveDatasetVersion: (data) => ipcRenderer.invoke('db:save-dataset-version', data),
  getDatasetVersions: (productId) => ipcRenderer.invoke('db:get-dataset-versions', productId),
  deleteDatasetVersion: (id) => ipcRenderer.invoke('db:delete-dataset-version', id),
  // Training Records
  saveTrainingRecord: (data) => ipcRenderer.invoke('db:save-training-record', data),
  getTrainingRecords: (productId) => ipcRenderer.invoke('db:get-training-records', productId),
  getTrainingRecord: (taskId, labelName) => ipcRenderer.invoke('db:get-training-record', { taskId, labelName }),
  getTrainingRecordsByTaskUuid: (taskUuid) => ipcRenderer.invoke('db:get-training-records-by-task-uuid', taskUuid),
  deleteTrainingRecord: (taskId, labelName) => ipcRenderer.invoke('db:delete-training-record', { taskId, labelName }),
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
