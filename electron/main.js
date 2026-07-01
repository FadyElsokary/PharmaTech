const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database/db');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'PharmaTech - نظام إدارة الصيدليات',
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize database
  db = new Database();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});

// IPC Handlers for Database Operations

// Product handlers
ipcMain.handle('db:getProducts', async () => {
  try {
    return db.getProducts();
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
});

ipcMain.handle('db:getProduct', async (event, id) => {
  try {
    return db.getProduct(id);
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
});

ipcMain.handle('db:createProduct', async (event, product) => {
  try {
    return db.createProduct(product);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
});

ipcMain.handle('db:updateProduct', async (event, id, product) => {
  try {
    return db.updateProduct(id, product);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteProduct', async (event, id) => {
  try {
    return db.deleteProduct(id);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
});

ipcMain.handle('db:searchProducts', async (event, searchTerm) => {
  try {
    return db.searchProducts(searchTerm);
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
});

// Category handlers
ipcMain.handle('db:getCategories', async () => {
  try {
    return db.getCategories();
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
});

ipcMain.handle('db:getCategory', async (event, id) => {
  try {
    return db.getCategory(id);
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
});

ipcMain.handle('db:createCategory', async (event, category) => {
  try {
    return db.createCategory(category);
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
});

ipcMain.handle('db:updateCategory', async (event, id, category) => {
  try {
    return db.updateCategory(id, category);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteCategory', async (event, id) => {
  try {
    return db.deleteCategory(id);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
});

// Inventory handlers
ipcMain.handle('db:getInventoryByProduct', async (event, productId) => {
  try {
    return db.getInventoryByProduct(productId);
  } catch (error) {
    console.error('Error getting inventory by product:', error);
    throw error;
  }
});

ipcMain.handle('db:addInventory', async (event, inventory) => {
  try {
    return db.addInventory(inventory);
  } catch (error) {
    console.error('Error adding inventory:', error);
    throw error;
  }
});

ipcMain.handle('db:updateInventoryQuantity', async (event, id, quantity) => {
  try {
    return db.updateInventoryQuantity(id, quantity);
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    throw error;
  }
});

ipcMain.handle('db:adjustStock', async (event, productId, adjustment) => {
  try {
    return db.adjustStock(productId, adjustment);
  } catch (error) {
    console.error('Error adjusting stock:', error);
    throw error;
  }
});

ipcMain.handle('db:getInventoryTransactions', async (event, productId) => {
  try {
    return db.getInventoryTransactions(productId);
  } catch (error) {
    console.error('Error getting inventory transactions:', error);
    throw error;
  }
});

// Supplier handlers
ipcMain.handle('db:getSuppliers', async () => {
  try {
    return db.getSuppliers();
  } catch (error) {
    console.error('Error getting suppliers:', error);
    throw error;
  }
});

ipcMain.handle('db:getSupplier', async (event, id) => {
  try {
    return db.getSupplier(id);
  } catch (error) {
    console.error('Error getting supplier:', error);
    throw error;
  }
});

ipcMain.handle('db:createSupplier', async (event, supplier) => {
  try {
    return db.createSupplier(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
});

ipcMain.handle('db:updateSupplier', async (event, id, supplier) => {
  try {
    return db.updateSupplier(id, supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteSupplier', async (event, id) => {
  try {
    return db.deleteSupplier(id);
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
});

// Purchase handlers
ipcMain.handle('db:getPurchases', async () => {
  try {
    return db.getPurchases();
  } catch (error) {
    console.error('Error getting purchases:', error);
    throw error;
  }
});

ipcMain.handle('db:getPurchase', async (event, id) => {
  try {
    return db.getPurchase(id);
  } catch (error) {
    console.error('Error getting purchase:', error);
    throw error;
  }
});

ipcMain.handle('db:getPurchaseItems', async (event, purchaseId) => {
  try {
    return db.getPurchaseItems(purchaseId);
  } catch (error) {
    console.error('Error getting purchase items:', error);
    throw error;
  }
});

ipcMain.handle('db:createPurchase', async (event, purchase, items) => {
  try {
    return db.createPurchase(purchase, items);
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
});

ipcMain.handle('db:receivePurchase', async (event, purchaseId, items) => {
  try {
    return db.receivePurchase(purchaseId, items);
  } catch (error) {
    console.error('Error receiving purchase:', error);
    throw error;
  }
});

ipcMain.handle('db:recordPurchasePayment', async (event, purchaseId, amount) => {
  try {
    return db.recordPurchasePayment(purchaseId, amount);
  } catch (error) {
    console.error('Error recording purchase payment:', error);
    throw error;
  }
});

// Customer handlers
ipcMain.handle('db:getCustomers', async () => {
  try {
    return db.getCustomers();
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
});

ipcMain.handle('db:getCustomer', async (event, id) => {
  try {
    return db.getCustomer(id);
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
});

ipcMain.handle('db:createCustomer', async (event, customer) => {
  try {
    return db.createCustomer(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
});

ipcMain.handle('db:updateCustomer', async (event, id, customer) => {
  try {
    return db.updateCustomer(id, customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteCustomer', async (event, id) => {
  try {
    return db.deleteCustomer(id);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
});

// Sales handlers
ipcMain.handle('db:getSales', async () => {
  try {
    return db.getSales();
  } catch (error) {
    console.error('Error getting sales:', error);
    throw error;
  }
});

ipcMain.handle('db:getSale', async (event, id) => {
  try {
    return db.getSale(id);
  } catch (error) {
    console.error('Error getting sale:', error);
    throw error;
  }
});

ipcMain.handle('db:getSaleItems', async (event, saleId) => {
  try {
    return db.getSaleItems(saleId);
  } catch (error) {
    console.error('Error getting sale items:', error);
    throw error;
  }
});

ipcMain.handle('db:generateInvoiceNumber', async () => {
  try {
    return db.generateInvoiceNumber();
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
});

ipcMain.handle('db:createSale', async (event, sale, items) => {
  try {
    return db.createSale(sale, items);
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
});

// Dashboard handlers
ipcMain.handle('db:getDashboardStats', async () => {
  try {
    return db.getDashboardStats();
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
});
