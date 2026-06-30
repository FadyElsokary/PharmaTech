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

ipcMain.handle('db:createCategory', async (event, category) => {
  try {
    return db.createCategory(category);
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
});

// Inventory handlers
ipcMain.handle('db:getInventory', async () => {
  try {
    return db.getInventory();
  } catch (error) {
    console.error('Error getting inventory:', error);
    throw error;
  }
});

ipcMain.handle('db:updateInventory', async (event, data) => {
  try {
    return db.updateInventory(data);
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
});

// Settings handlers
ipcMain.handle('db:getSetting', async (event, key) => {
  try {
    return db.getSetting(key);
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
});

ipcMain.handle('db:setSetting', async (event, key, value) => {
  try {
    return db.setSetting(key, value);
  } catch (error) {
    console.error('Error setting setting:', error);
    throw error;
  }
});

// Made with Bob
