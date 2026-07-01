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
  getCategory: (id) => ipcRenderer.invoke('db:getCategory', id),
  createCategory: (category) => ipcRenderer.invoke('db:createCategory', category),
  updateCategory: (id, category) => ipcRenderer.invoke('db:updateCategory', id, category),
  deleteCategory: (id) => ipcRenderer.invoke('db:deleteCategory', id),
  
  // Inventory operations
  getInventoryByProduct: (productId) => ipcRenderer.invoke('db:getInventoryByProduct', productId),
  addInventory: (inventory) => ipcRenderer.invoke('db:addInventory', inventory),
  updateInventoryQuantity: (id, quantity) => ipcRenderer.invoke('db:updateInventoryQuantity', id, quantity),
  adjustStock: (productId, adjustment) => ipcRenderer.invoke('db:adjustStock', productId, adjustment),
  getInventoryTransactions: (productId) => ipcRenderer.invoke('db:getInventoryTransactions', productId),
  
  // Supplier operations
  getSuppliers: () => ipcRenderer.invoke('db:getSuppliers'),
  getSupplier: (id) => ipcRenderer.invoke('db:getSupplier', id),
  createSupplier: (supplier) => ipcRenderer.invoke('db:createSupplier', supplier),
  updateSupplier: (id, supplier) => ipcRenderer.invoke('db:updateSupplier', id, supplier),
  deleteSupplier: (id) => ipcRenderer.invoke('db:deleteSupplier', id),
  
  // Purchase operations
  getPurchases: () => ipcRenderer.invoke('db:getPurchases'),
  getPurchase: (id) => ipcRenderer.invoke('db:getPurchase', id),
  getPurchaseItems: (purchaseId) => ipcRenderer.invoke('db:getPurchaseItems', purchaseId),
  createPurchase: (purchase, items) => ipcRenderer.invoke('db:createPurchase', purchase, items),
  receivePurchase: (purchaseId, items) => ipcRenderer.invoke('db:receivePurchase', purchaseId, items),
  recordPurchasePayment: (purchaseId, amount) => ipcRenderer.invoke('db:recordPurchasePayment', purchaseId, amount),
  
  // Customer operations
  getCustomers: () => ipcRenderer.invoke('db:getCustomers'),
  getCustomer: (id) => ipcRenderer.invoke('db:getCustomer', id),
  createCustomer: (customer) => ipcRenderer.invoke('db:createCustomer', customer),
  updateCustomer: (id, customer) => ipcRenderer.invoke('db:updateCustomer', id, customer),
  deleteCustomer: (id) => ipcRenderer.invoke('db:deleteCustomer', id),
  
  // Sales operations
  getSales: () => ipcRenderer.invoke('db:getSales'),
  getSale: (id) => ipcRenderer.invoke('db:getSale', id),
  getSaleItems: (saleId) => ipcRenderer.invoke('db:getSaleItems', saleId),
  generateInvoiceNumber: () => ipcRenderer.invoke('db:generateInvoiceNumber'),
  createSale: (sale, items) => ipcRenderer.invoke('db:createSale', sale, items),
  
  // Dashboard operations
  getDashboardStats: () => ipcRenderer.invoke('db:getDashboardStats'),
});
