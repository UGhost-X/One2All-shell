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
  deleteCamera: (id) => ipcRenderer.invoke('db:delete-camera', id),
  updateCamera: (id, data) => ipcRenderer.invoke('db:update-camera', { id, data }),
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
