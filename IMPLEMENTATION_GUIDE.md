# PharmaTech - Implementation Guide
## Step-by-Step Development Instructions

---

## 🎯 Overview

This guide provides detailed instructions for implementing the PharmaTech pharmacy management system. Follow these steps in order to build a fully functional application.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js**: Version 18.x or higher (LTS recommended)
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended
- **macOS**: For development and testing

### Verify Installation

```bash
node --version    # Should show v18.x or higher
npm --version     # Should show 9.x or higher
```

---

## 🚀 Phase 1: Project Initialization

### Step 1.1: Create Project Structure

```bash
# Create project directory
mkdir PharmaTech
cd PharmaTech

# Initialize npm project
npm init -y

# Create directory structure
mkdir -p electron/database/migrations
mkdir -p src/{components/{Layout,Common},pages/{Inventory,Purchases,Sales,Payments},context,hooks,i18n,styles/components,utils}
mkdir -p public/icons
```

### Step 1.2: Install Core Dependencies

```bash
# Production dependencies
npm install electron react react-dom react-router-dom better-sqlite3

# Development dependencies
npm install -D vite @vitejs/plugin-react electron-builder concurrently wait-on cross-env

# Additional utilities
npm install i18next react-i18next clsx
```

### Step 1.3: Configure package.json

Update [`package.json`](package.json:1) with the following scripts:

```json
{
  "name": "pharmatech",
  "version": "1.0.0",
  "description": "Pharmacy Management System",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .\"",
    "electron:build": "npm run build && electron-builder --mac",
    "electron:build:win": "npm run build && electron-builder --win"
  },
  "keywords": ["pharmacy", "inventory", "electron", "desktop"],
  "author": "Your Name",
  "license": "MIT"
}
```

### Step 1.4: Create Vite Configuration

Create [`vite.config.js`](vite.config.js:1):

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
```

---

## 🔧 Phase 2: Electron Setup

### Step 2.1: Create Main Process

Create [`electron/main.js`](electron/main.js:1):

```javascript
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
    app.quit();
  }
});

// IPC Handlers will be added here
```

### Step 2.2: Create Preload Script

Create [`electron/preload.js`](electron/preload.js:1):

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getProducts: () => ipcRenderer.invoke('db:getProducts'),
  getProduct: (id) => ipcRenderer.invoke('db:getProduct', id),
  createProduct: (product) => ipcRenderer.invoke('db:createProduct', product),
  updateProduct: (id, product) => ipcRenderer.invoke('db:updateProduct', id, product),
  deleteProduct: (id) => ipcRenderer.invoke('db:deleteProduct', id),
  
  // Categories
  getCategories: () => ipcRenderer.invoke('db:getCategories'),
  createCategory: (category) => ipcRenderer.invoke('db:createCategory', category),
  
  // Inventory
  getInventory: () => ipcRenderer.invoke('db:getInventory'),
  updateInventory: (data) => ipcRenderer.invoke('db:updateInventory', data),
  
  // Settings
  getSetting: (key) => ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key, value) => ipcRenderer.invoke('db:setSetting', key, value),
});
```

---

## 💾 Phase 3: Database Implementation

### Step 3.1: Create Database Class

Create [`electron/database/db.js`](electron/database/db.js:1):

```javascript
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'pharmatech.db');
    
    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initialize();
  }

  initialize() {
    // Create tables
    this.createTables();
    // Insert default data
    this.insertDefaultData();
  }

  createTables() {
    // Categories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        description_ar TEXT,
        description_en TEXT,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id)
      )
    `);

    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT UNIQUE,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        description_ar TEXT,
        description_en TEXT,
        category_id INTEGER,
        unit_type TEXT NOT NULL,
        reorder_level INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Inventory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        batch_number TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        cost_price DECIMAL(10,2) NOT NULL,
        selling_price DECIMAL(10,2) NOT NULL,
        expiry_date DATE,
        manufacture_date DATE,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Inventory transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        transaction_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reference_type TEXT,
        reference_id INTEGER,
        notes TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  insertDefaultData() {
    // Check if default data already exists
    const settingExists = this.db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('initialized');
    
    if (!settingExists || settingExists.count === 0) {
      // Insert default categories
      const insertCategory = this.db.prepare(`
        INSERT INTO categories (name_ar, name_en, description_ar, description_en)
        VALUES (?, ?, ?, ?)
      `);

      insertCategory.run('أدوية', 'Medicines', 'الأدوية والعقاقير', 'Medicines and drugs');
      insertCategory.run('مستلزمات طبية', 'Medical Supplies', 'المستلزمات الطبية', 'Medical supplies');
      insertCategory.run('مكملات غذائية', 'Supplements', 'المكملات الغذائية', 'Dietary supplements');

      // Mark as initialized
      this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('initialized', 'true');
      this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('language', 'ar');
    }
  }

  // Product operations
  getProducts() {
    return this.db.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en,
             COALESCE(SUM(i.quantity), 0) as total_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();
  }

  getProduct(id) {
    return this.db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  }

  createProduct(product) {
    const stmt = this.db.prepare(`
      INSERT INTO products (barcode, name_ar, name_en, description_ar, description_en, 
                           category_id, unit_type, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      product.barcode,
      product.name_ar,
      product.name_en,
      product.description_ar,
      product.description_en,
      product.category_id,
      product.unit_type,
      product.reorder_level
    );
    
    return result.lastInsertRowid;
  }

  updateProduct(id, product) {
    const stmt = this.db.prepare(`
      UPDATE products 
      SET barcode = ?, name_ar = ?, name_en = ?, description_ar = ?, 
          description_en = ?, category_id = ?, unit_type = ?, 
          reorder_level = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    return stmt.run(
      product.barcode,
      product.name_ar,
      product.name_en,
      product.description_ar,
      product.description_en,
      product.category_id,
      product.unit_type,
      product.reorder_level,
      id
    );
  }

  deleteProduct(id) {
    // Soft delete
    return this.db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
  }

  // Category operations
  getCategories() {
    return this.db.prepare('SELECT * FROM categories ORDER BY name_ar').all();
  }

  createCategory(category) {
    const stmt = this.db.prepare(`
      INSERT INTO categories (name_ar, name_en, description_ar, description_en, parent_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      category.name_ar,
      category.name_en,
      category.description_ar,
      category.description_en,
      category.parent_id
    );
    
    return result.lastInsertRowid;
  }

  // Settings operations
  getSetting(key) {
    const result = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return result ? result.value : null;
  }

  setSetting(key, value) {
    return this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `).run(key, value, value);
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;
```

### Step 3.2: Add IPC Handlers to Main Process

Add to [`electron/main.js`](electron/main.js:1) after `app.whenReady()`:

```javascript
// Product handlers
ipcMain.handle('db:getProducts', () => db.getProducts());
ipcMain.handle('db:getProduct', (event, id) => db.getProduct(id));
ipcMain.handle('db:createProduct', (event, product) => db.createProduct(product));
ipcMain.handle('db:updateProduct', (event, id, product) => db.updateProduct(id, product));
ipcMain.handle('db:deleteProduct', (event, id) => db.deleteProduct(id));

// Category handlers
ipcMain.handle('db:getCategories', () => db.getCategories());
ipcMain.handle('db:createCategory', (event, category) => db.createCategory(category));

// Settings handlers
ipcMain.handle('db:getSetting', (event, key) => db.getSetting(key));
ipcMain.handle('db:setSetting', (event, key, value) => db.setSetting(key, value));
```

---

## ⚛️ Phase 4: React Application Setup

### Step 4.1: Create Main Entry Point

Create [`src/main.jsx`](src/main.jsx:1):

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 4.2: Create HTML Template

Create [`index.html`](index.html:1):

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PharmaTech - نظام إدارة الصيدليات</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 🌐 Phase 5: Internationalization Setup

### Step 5.1: Create Translation Files

Create [`src/i18n/ar.json`](src/i18n/ar.json:1):

```json
{
  "app": {
    "name": "فارماتك",
    "welcome": "مرحباً بك في فارماتك",
    "subtitle": "نظام إدارة الصيدليات المتكامل"
  },
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "add": "إضافة",
    "search": "بحث",
    "filter": "فلتر",
    "back": "رجوع",
    "loading": "جاري التحميل...",
    "noData": "لا توجد بيانات",
    "confirm": "تأكيد",
    "yes": "نعم",
    "no": "لا"
  },
  "modules": {
    "inventory": "إدارة المخزون",
    "purchases": "إدارة المشتريات والموردين",
    "sales": "المبيعات والعملاء",
    "payments": "المدفوعات والمقبوضات"
  },
  "inventory": {
    "title": "إدارة المخزون",
    "addProduct": "إضافة منتج جديد",
    "editProduct": "تعديل المنتج",
    "productDetails": "تفاصيل المنتج",
    "barcode": "الباركود",
    "productName": "اسم المنتج",
    "category": "الفئة",
    "quantity": "الكمية",
    "unitType": "نوع الوحدة",
    "costPrice": "سعر التكلفة",
    "sellingPrice": "سعر البيع",
    "reorderLevel": "حد إعادة الطلب",
    "description": "الوصف",
    "expiryDate": "تاريخ الانتهاء",
    "manufactureDate": "تاريخ الإنتاج",
    "batchNumber": "رقم الدفعة",
    "location": "موقع التخزين",
    "lowStock": "مخزون منخفض",
    "outOfStock": "نفذ من المخزون"
  }
}
```

Create [`src/i18n/en.json`](src/i18n/en.json:1):

```json
{
  "app": {
    "name": "PharmaTech",
    "welcome": "Welcome to PharmaTech",
    "subtitle": "Integrated Pharmacy Management System"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "search": "Search",
    "filter": "Filter",
    "back": "Back",
    "loading": "Loading...",
    "noData": "No data available",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No"
  },
  "modules": {
    "inventory": "Inventory Management",
    "purchases": "Purchases & Suppliers Management",
    "sales": "Sales & Customers",
    "payments": "Payments & Receipts"
  },
  "inventory": {
    "title": "Inventory Management",
    "addProduct": "Add New Product",
    "editProduct": "Edit Product",
    "productDetails": "Product Details",
    "barcode": "Barcode",
    "productName": "Product Name",
    "category": "Category",
    "quantity": "Quantity",
    "unitType": "Unit Type",
    "costPrice": "Cost Price",
    "sellingPrice": "Selling Price",
    "reorderLevel": "Reorder Level",
    "description": "Description",
    "expiryDate": "Expiry Date",
    "manufactureDate": "Manufacture Date",
    "batchNumber": "Batch Number",
    "location": "Storage Location",
    "lowStock": "Low Stock",
    "outOfStock": "Out of Stock"
  }
}
```

### Step 5.2: Create Language Context

Create [`src/context/LanguageContext.jsx`](src/context/LanguageContext.jsx:1):

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import arTranslations from '../i18n/ar.json';
import enTranslations from '../i18n/en.json';

const LanguageContext = createContext();

const translations = {
  ar: arTranslations,
  en: enTranslations,
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ar');
  const [direction, setDirection] = useState('rtl');

  useEffect(() => {
    // Load saved language preference
    if (window.electronAPI) {
      window.electronAPI.getSetting('language').then((savedLang) => {
        if (savedLang) {
          changeLanguage(savedLang);
        }
      });
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Save preference
    if (window.electronAPI) {
      window.electronAPI.setSetting('language', lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
```

---

## 🎨 Phase 6: Styling Setup

### Step 6.1: Create Global Styles

Create [`src/styles/global.css`](src/styles/global.css:1):

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --background: #f8fafc;
  --surface: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background);
  color: var(--text-primary);
}

/* Arabic font support */
[lang="ar"] {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#root {
  min-height: 100vh;
}

/* Utility classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card {
  background: var(--surface);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* RTL Support */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .btn {
  direction: rtl;
}
```

### Step 6.2: Create RTL-specific Styles

Create [`src/styles/rtl.css`](src/styles/rtl.css:1):

```css
/* RTL-specific overrides */
[dir="rtl"] {
  direction: rtl;
}

[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}

[dir="rtl"] .ml-auto {
  margin-left: 0;
  margin-right: auto;
}

[dir="rtl"] .mr-auto {
  margin-right: 0;
  margin-left: auto;
}
```

---

## 📄 Next Steps

After completing this implementation guide:

1. **Test the application** on macOS
2. **Verify database operations** work correctly
3. **Test language switching** and RTL layout
4. **Build the remaining UI components** (Dashboard, Inventory pages)
5. **Implement form validation**
6. **Add error handling**
7. **Create user documentation**

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Better-SQLite3 installation fails
- **Solution**: Install build tools: `xcode-select --install`

**Issue**: Electron window doesn't open
- **Solution**: Check console for errors, verify port 5173 is available

**Issue**: Database file not found
- **Solution**: Check app.getPath('userData') location

**Issue**: Arabic text not displaying correctly
- **Solution**: Ensure HTML has `lang="ar"` and `dir="rtl"` attributes

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-30