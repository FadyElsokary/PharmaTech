const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Product operations
  getProducts: () => ipcRenderer.invoke('db:getProducts'),
  getProduct: (id) => ipcRenderer.invoke('db:getProduct', id),
  createProduct: (product) => ipcRenderer.invoke('db:createProduct', product),
  updateProduct: (id, product) => ipcRenderer.invoke('db:updateProduct', id, product),
  deleteProduct: (id) => ipcRenderer.invoke('db:deleteProduct', id),
  searchProducts: (searchTerm) => ipcRenderer.invoke('db:searchProducts', searchTerm),
  
  // Category operations
  getCategories: () => ipcRenderer.invoke('db:getCategories'),
  createCategory: (category) => ipcRenderer.invoke('db:createCategory', category),
  
  // Inventory operations
  getInventory: () => ipcRenderer.invoke('db:getInventory'),
  updateInventory: (data) => ipcRenderer.invoke('db:updateInventory', data),
  
  // Settings operations
  getSetting: (key) => ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key, value) => ipcRenderer.invoke('db:setSetting', key, value),
});

// Made with Bob
