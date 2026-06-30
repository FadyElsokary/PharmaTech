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

    console.log('Database path:', dbPath);
    
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

    console.log('Database tables created successfully');
  }

  insertDefaultData() {
    // Check if default data already exists
    const settingExists = this.db.prepare('SELECT COUNT(*) as count FROM settings WHERE key = ?').get('initialized');
    
    if (!settingExists || settingExists.count === 0) {
      console.log('Inserting default data...');
      
      // Insert default categories
      const insertCategory = this.db.prepare(`
        INSERT INTO categories (name_ar, name_en, description_ar, description_en)
        VALUES (?, ?, ?, ?)
      `);

      insertCategory.run('أدوية', 'Medicines', 'الأدوية والعقاقير الطبية', 'Medicines and pharmaceutical drugs');
      insertCategory.run('مستلزمات طبية', 'Medical Supplies', 'المستلزمات والأدوات الطبية', 'Medical supplies and equipment');
      insertCategory.run('مكملات غذائية', 'Supplements', 'المكملات الغذائية والفيتامينات', 'Dietary supplements and vitamins');
      insertCategory.run('مستحضرات تجميل', 'Cosmetics', 'مستحضرات التجميل والعناية الشخصية', 'Cosmetics and personal care products');
      insertCategory.run('أدوات طبية', 'Medical Devices', 'الأجهزة والأدوات الطبية', 'Medical devices and instruments');

      // Mark as initialized
      this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('initialized', 'true');
      this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('language', 'ar');
      
      console.log('Default data inserted successfully');
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
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid product ID');
    }
    return this.db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  }

  createProduct(product) {
    // Validate required fields
    if (!product.name_ar || !product.name_en || !product.unit_type) {
      throw new Error('Missing required fields');
    }

    const stmt = this.db.prepare(`
      INSERT INTO products (barcode, name_ar, name_en, description_ar, description_en, 
                           category_id, unit_type, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      product.barcode || null,
      product.name_ar,
      product.name_en,
      product.description_ar || null,
      product.description_en || null,
      product.category_id || null,
      product.unit_type,
      product.reorder_level || 10
    );
    
    return result.lastInsertRowid;
  }

  updateProduct(id, product) {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid product ID');
    }

    const stmt = this.db.prepare(`
      UPDATE products 
      SET barcode = ?, name_ar = ?, name_en = ?, description_ar = ?, 
          description_en = ?, category_id = ?, unit_type = ?, 
          reorder_level = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(
      product.barcode || null,
      product.name_ar,
      product.name_en,
      product.description_ar || null,
      product.description_en || null,
      product.category_id || null,
      product.unit_type,
      product.reorder_level || 10,
      id
    );

    return result.changes > 0;
  }

  deleteProduct(id) {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid product ID');
    }

    // Check if product exists
    const product = this.getProduct(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Soft delete
    const result = this.db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
    return result.changes > 0;
  }

  searchProducts(searchTerm) {
    if (!searchTerm) {
      return this.getProducts();
    }

    const term = `%${searchTerm}%`;
    return this.db.prepare(`
      SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en,
             COALESCE(SUM(i.quantity), 0) as total_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = 1 
        AND (p.name_ar LIKE ? OR p.name_en LIKE ? OR p.barcode LIKE ?)
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all(term, term, term);
  }

  // Category operations
  getCategories() {
    return this.db.prepare('SELECT * FROM categories ORDER BY name_ar').all();
  }

  createCategory(category) {
    if (!category.name_ar || !category.name_en) {
      throw new Error('Missing required fields');
    }

    const stmt = this.db.prepare(`
      INSERT INTO categories (name_ar, name_en, description_ar, description_en, parent_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      category.name_ar,
      category.name_en,
      category.description_ar || null,
      category.description_en || null,
      category.parent_id || null
    );
    
    return result.lastInsertRowid;
  }

  // Inventory operations
  getInventory() {
    return this.db.prepare(`
      SELECT i.*, p.name_ar as product_name_ar, p.name_en as product_name_en,
             p.barcode, p.unit_type
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE p.is_active = 1
      ORDER BY i.created_at DESC
    `).all();
  }

  updateInventory(data) {
    if (!data.product_id || !data.quantity) {
      throw new Error('Missing required fields');
    }

    const stmt = this.db.prepare(`
      INSERT INTO inventory (product_id, batch_number, quantity, cost_price, 
                            selling_price, expiry_date, manufacture_date, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.product_id,
      data.batch_number || null,
      data.quantity,
      data.cost_price || 0,
      data.selling_price || 0,
      data.expiry_date || null,
      data.manufacture_date || null,
      data.location || null
    );
    
    return result.lastInsertRowid;
  }

  // Settings operations
  getSetting(key) {
    const result = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return result ? result.value : null;
  }

  setSetting(key, value) {
    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(key, value, value);
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('Database connection closed');
    }
  }
}

module.exports = DatabaseManager;

// Made with Bob
