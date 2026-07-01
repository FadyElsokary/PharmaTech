const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'pharmatech.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.createTables();
  }

  createTables() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT NOT NULL, name_en TEXT NOT NULL, parent_id INTEGER, description TEXT, is_active BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (parent_id) REFERENCES categories(id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT NOT NULL, name_en TEXT NOT NULL, category_id INTEGER, barcode TEXT UNIQUE, description TEXT, manufacturer TEXT, active_ingredient TEXT, unit TEXT DEFAULT 'piece', min_stock_level INTEGER DEFAULT 10, max_stock_level INTEGER DEFAULT 1000, reorder_point INTEGER DEFAULT 20, storage_location TEXT, image_path TEXT, is_active BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES categories(id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, batch_number TEXT, quantity INTEGER NOT NULL DEFAULT 0, cost_price DECIMAL(10,2), selling_price DECIMAL(10,2), manufacture_date DATE, expiry_date DATE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products(id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS inventory_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, transaction_type TEXT NOT NULL, quantity INTEGER NOT NULL, reference_type TEXT, reference_id INTEGER, notes TEXT, user_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products(id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS suppliers (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT NOT NULL, name_en TEXT NOT NULL, contact_person TEXT, phone TEXT, email TEXT, address TEXT, tax_number TEXT, payment_terms TEXT, credit_limit DECIMAL(10,2) DEFAULT 0, current_balance DECIMAL(10,2) DEFAULT 0, is_active BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY AUTOINCREMENT, supplier_id INTEGER NOT NULL, purchase_date DATE NOT NULL, invoice_number TEXT, subtotal DECIMAL(10,2) NOT NULL, discount DECIMAL(10,2) DEFAULT 0, tax DECIMAL(10,2) DEFAULT 0, total_amount DECIMAL(10,2) NOT NULL, paid_amount DECIMAL(10,2) DEFAULT 0, status TEXT DEFAULT 'pending', notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (supplier_id) REFERENCES suppliers(id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS purchase_items (id INTEGER PRIMARY KEY AUTOINCREMENT, purchase_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, unit_price DECIMAL(10,2) NOT NULL, discount DECIMAL(10,2) DEFAULT 0, total_price DECIMAL(10,2) NOT NULL, batch_number TEXT, expiry_date DATE, manufacture_date DATE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (purchase_id) REFERENCES purchases(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT NOT NULL, name_en TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, customer_type TEXT DEFAULT 'retail', credit_limit DECIMAL(10,2) DEFAULT 0, current_balance DECIMAL(10,2) DEFAULT 0, discount_percentage DECIMAL(5,2) DEFAULT 0, is_active BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS sales (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER, sale_date DATE NOT NULL, invoice_number TEXT UNIQUE NOT NULL, subtotal DECIMAL(10,2) NOT NULL, discount DECIMAL(10,2) DEFAULT 0, tax DECIMAL(10,2) DEFAULT 0, total_amount DECIMAL(10,2) NOT NULL, paid_amount DECIMAL(10,2) DEFAULT 0, payment_method TEXT, status TEXT DEFAULT 'completed', notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (customer_id) REFERENCES customers(id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS sale_items (id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id INTEGER NOT NULL, product_id INTEGER NOT NULL, inventory_id INTEGER, quantity INTEGER NOT NULL, unit_price DECIMAL(10,2) NOT NULL, discount DECIMAL(10,2) DEFAULT 0, total_price DECIMAL(10,2) NOT NULL, batch_number TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (sale_id) REFERENCES sales(id), FOREIGN KEY (product_id) REFERENCES products(id), FOREIGN KEY (inventory_id) REFERENCES inventory(id))`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, payment_type TEXT NOT NULL, reference_type TEXT, reference_id INTEGER, entity_id INTEGER, entity_type TEXT, amount DECIMAL(10,2) NOT NULL, payment_method TEXT NOT NULL, payment_date DATE NOT NULL, receipt_number TEXT, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  }

  getCategories() { return this.db.prepare('SELECT c.*, COUNT(DISTINCT p.id) as product_count, pc.name_ar as parent_name_ar, pc.name_en as parent_name_en FROM categories c LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1 LEFT JOIN categories pc ON c.parent_id = pc.id WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.name_ar').all(); }
  getCategory(id) { return this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id); }
  createCategory(category) { return this.db.prepare('INSERT INTO categories (name_ar, name_en, parent_id, description) VALUES (?, ?, ?, ?)').run(category.name_ar, category.name_en, category.parent_id, category.description).lastInsertRowid; }
  updateCategory(id, category) { return this.db.prepare('UPDATE categories SET name_ar = ?, name_en = ?, parent_id = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(category.name_ar, category.name_en, category.parent_id, category.description, id); }
  deleteCategory(id) { return this.db.prepare('UPDATE categories SET is_active = 0 WHERE id = ?').run(id); }

  getProducts() { return this.db.prepare('SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, COALESCE(SUM(i.quantity), 0) as total_quantity, COALESCE(AVG(i.selling_price), 0) as avg_selling_price FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN inventory i ON p.id = i.product_id WHERE p.is_active = 1 GROUP BY p.id ORDER BY p.created_at DESC').all(); }
  getProduct(id) { return this.db.prepare('SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, COALESCE(SUM(i.quantity), 0) as total_quantity FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN inventory i ON p.id = i.product_id WHERE p.id = ? GROUP BY p.id').get(id); }
  searchProducts(searchTerm) { const term = `%${searchTerm}%`; return this.db.prepare('SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, COALESCE(SUM(i.quantity), 0) as total_quantity FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN inventory i ON p.id = i.product_id WHERE p.is_active = 1 AND (p.name_ar LIKE ? OR p.name_en LIKE ? OR p.barcode LIKE ?) GROUP BY p.id ORDER BY p.created_at DESC').all(term, term, term); }
  createProduct(product) { return this.db.prepare('INSERT INTO products (name_ar, name_en, category_id, barcode, description, manufacturer, active_ingredient, unit, min_stock_level, max_stock_level, reorder_point, storage_location, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(product.name_ar, product.name_en, product.category_id, product.barcode, product.description, product.manufacturer, product.active_ingredient, product.unit, product.min_stock_level, product.max_stock_level, product.reorder_point, product.storage_location, product.image_path).lastInsertRowid; }
  updateProduct(id, product) { return this.db.prepare('UPDATE products SET name_ar = ?, name_en = ?, category_id = ?, barcode = ?, description = ?, manufacturer = ?, active_ingredient = ?, unit = ?, min_stock_level = ?, max_stock_level = ?, reorder_point = ?, storage_location = ?, image_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(product.name_ar, product.name_en, product.category_id, product.barcode, product.description, product.manufacturer, product.active_ingredient, product.unit, product.min_stock_level, product.max_stock_level, product.reorder_point, product.storage_location, product.image_path, id); }
  deleteProduct(id) { return this.db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id); }

  getInventoryByProduct(productId) { return this.db.prepare('SELECT * FROM inventory WHERE product_id = ? ORDER BY expiry_date ASC').all(productId); }
  addInventory(inventory) { return this.db.prepare('INSERT INTO inventory (product_id, batch_number, quantity, cost_price, selling_price, manufacture_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)').run(inventory.product_id, inventory.batch_number, inventory.quantity, inventory.cost_price, inventory.selling_price, inventory.manufacture_date, inventory.expiry_date).lastInsertRowid; }
  updateInventoryQuantity(id, quantity) { return this.db.prepare('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, id); }
  
  adjustStock(productId, adjustment) {
    const transaction = this.db.transaction((prodId, adj) => {
      const inventory = this.db.prepare('SELECT * FROM inventory WHERE product_id = ? ORDER BY expiry_date ASC LIMIT 1').get(prodId);
      if (inventory) {
        const newQuantity = inventory.quantity + adj.quantity;
        this.db.prepare('UPDATE inventory SET quantity = ? WHERE id = ?').run(newQuantity, inventory.id);
      }
      this.db.prepare('INSERT INTO inventory_transactions (product_id, transaction_type, quantity, reference_type, notes) VALUES (?, ?, ?, ?, ?)').run(prodId, adj.type, adj.quantity, 'ADJUSTMENT', adj.notes);
    });
    return transaction(productId, adjustment);
  }

  getInventoryTransactions(productId) { return this.db.prepare('SELECT * FROM inventory_transactions WHERE product_id = ? ORDER BY created_at DESC').all(productId); }

  getSuppliers() { return this.db.prepare('SELECT s.*, COUNT(p.id) as total_purchases, COALESCE(SUM(p.total_amount - p.paid_amount), 0) as outstanding_balance FROM suppliers s LEFT JOIN purchases p ON s.id = p.supplier_id WHERE s.is_active = 1 GROUP BY s.id ORDER BY s.name_ar').all(); }
  getSupplier(id) { return this.db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id); }
  createSupplier(supplier) { return this.db.prepare('INSERT INTO suppliers (name_ar, name_en, contact_person, phone, email, address, tax_number, payment_terms, credit_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(supplier.name_ar, supplier.name_en, supplier.contact_person, supplier.phone, supplier.email, supplier.address, supplier.tax_number, supplier.payment_terms, supplier.credit_limit).lastInsertRowid; }
  updateSupplier(id, supplier) { return this.db.prepare('UPDATE suppliers SET name_ar = ?, name_en = ?, contact_person = ?, phone = ?, email = ?, address = ?, tax_number = ?, payment_terms = ?, credit_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(supplier.name_ar, supplier.name_en, supplier.contact_person, supplier.phone, supplier.email, supplier.address, supplier.tax_number, supplier.payment_terms, supplier.credit_limit, id); }
  deleteSupplier(id) { return this.db.prepare('UPDATE suppliers SET is_active = 0 WHERE id = ?').run(id); }

  getPurchases() { return this.db.prepare('SELECT p.*, s.name_ar as supplier_name_ar, s.name_en as supplier_name_en FROM purchases p LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.purchase_date DESC').all(); }
  getPurchase(id) { return this.db.prepare('SELECT p.*, s.name_ar as supplier_name_ar, s.name_en as supplier_name_en FROM purchases p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?').get(id); }
  getPurchaseItems(purchaseId) { return this.db.prepare('SELECT pi.*, pr.name_ar as product_name_ar, pr.name_en as product_name_en FROM purchase_items pi LEFT JOIN products pr ON pi.product_id = pr.id WHERE pi.purchase_id = ?').all(purchaseId); }
  
  createPurchase(purchase, items) {
    const transaction = this.db.transaction((purch, itms) => {
      const result = this.db.prepare('INSERT INTO purchases (supplier_id, purchase_date, invoice_number, subtotal, discount, tax, total_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(purch.supplier_id, purch.purchase_date, purch.invoice_number, purch.subtotal, purch.discount, purch.tax, purch.total_amount, purch.status, purch.notes);
      const purchaseId = result.lastInsertRowid;
      const itemStmt = this.db.prepare('INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, discount, total_price, batch_number, expiry_date, manufacture_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const item of itms) { itemStmt.run(purchaseId, item.product_id, item.quantity, item.unit_price, item.discount, item.total_price, item.batch_number, item.expiry_date, item.manufacture_date); }
      return purchaseId;
    });
    return transaction(purchase, items);
  }

  receivePurchase(purchaseId, items) {
    const transaction = this.db.transaction((purId, itms) => {
      const inventoryStmt = this.db.prepare('INSERT INTO inventory (product_id, batch_number, quantity, cost_price, selling_price, expiry_date, manufacture_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const transactionStmt = this.db.prepare('INSERT INTO inventory_transactions (product_id, transaction_type, quantity, reference_type, reference_id) VALUES (?, ?, ?, ?, ?)');
      for (const item of itms) {
        inventoryStmt.run(item.product_id, item.batch_number, item.quantity, item.cost_price, item.selling_price, item.expiry_date, item.manufacture_date);
        transactionStmt.run(item.product_id, 'IN', item.quantity, 'PURCHASE', purId);
      }
      this.db.prepare('UPDATE purchases SET status = ? WHERE id = ?').run('received', purId);
    });
    return transaction(purchaseId, items);
  }

  recordPurchasePayment(purchaseId, amount) {
    const purchase = this.getPurchase(purchaseId);
    const newPaidAmount = purchase.paid_amount + amount;
    this.db.prepare('UPDATE purchases SET paid_amount = ? WHERE id = ?').run(newPaidAmount, purchaseId);
    this.db.prepare('INSERT INTO payments (payment_type, reference_type, reference_id, amount, payment_method, payment_date) VALUES (?, ?, ?, ?, ?, ?)').run('PURCHASE_PAYMENT', 'PURCHASE', purchaseId, amount, 'CASH', new Date().toISOString().split('T')[0]);
  }

  getCustomers() { return this.db.prepare('SELECT c.*, COUNT(s.id) as total_sales, COALESCE(SUM(s.total_amount - s.paid_amount), 0) as outstanding_balance FROM customers c LEFT JOIN sales s ON c.id = s.customer_id WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.name_ar').all(); }
  getCustomer(id) { return this.db.prepare('SELECT * FROM customers WHERE id = ?').get(id); }
  createCustomer(customer) { return this.db.prepare('INSERT INTO customers (name_ar, name_en, phone, email, address, customer_type, credit_limit, discount_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(customer.name_ar, customer.name_en, customer.phone, customer.email, customer.address, customer.customer_type, customer.credit_limit, customer.discount_percentage).lastInsertRowid; }
  updateCustomer(id, customer) { return this.db.prepare('UPDATE customers SET name_ar = ?, name_en = ?, phone = ?, email = ?, address = ?, customer_type = ?, credit_limit = ?, discount_percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(customer.name_ar, customer.name_en, customer.phone, customer.email, customer.address, customer.customer_type, customer.credit_limit, customer.discount_percentage, id); }
  deleteCustomer(id) { return this.db.prepare('UPDATE customers SET is_active = 0 WHERE id = ?').run(id); }

  getSales() { return this.db.prepare('SELECT s.*, c.name_ar as customer_name_ar, c.name_en as customer_name_en FROM sales s LEFT JOIN customers c ON s.customer_id = c.id ORDER BY s.sale_date DESC').all(); }
  getSale(id) { return this.db.prepare('SELECT s.*, c.name_ar as customer_name_ar, c.name_en as customer_name_en FROM sales s LEFT JOIN customers c ON s.customer_id = c.id WHERE s.id = ?').get(id); }
  getSaleItems(saleId) { return this.db.prepare('SELECT si.*, p.name_ar as product_name_ar, p.name_en as product_name_en FROM sale_items si LEFT JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?').all(saleId); }
  
  generateInvoiceNumber() {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const lastSale = this.db.prepare('SELECT invoice_number FROM sales WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1').get(`INV-${today}%`);
    if (lastSale) {
      const lastNum = parseInt(lastSale.invoice_number.split('-')[2]);
      return `INV-${today}-${String(lastNum + 1).padStart(4, '0')}`;
    }
    return `INV-${today}-0001`;
  }

  createSale(sale, items) {
    const transaction = this.db.transaction((sl, itms) => {
      const result = this.db.prepare('INSERT INTO sales (customer_id, sale_date, invoice_number, subtotal, discount, tax, total_amount, paid_amount, payment_method, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(sl.customer_id, sl.sale_date, sl.invoice_number, sl.subtotal, sl.discount, sl.tax, sl.total_amount, sl.paid_amount, sl.payment_method, sl.status, sl.notes);
      const saleId = result.lastInsertRowid;
      const itemStmt = this.db.prepare('INSERT INTO sale_items (sale_id, product_id, inventory_id, quantity, unit_price, discount, total_price, batch_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      const updateInventoryStmt = this.db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE id = ?');
      const transactionStmt = this.db.prepare('INSERT INTO inventory_transactions (product_id, transaction_type, quantity, reference_type, reference_id) VALUES (?, ?, ?, ?, ?)');
      for (const item of itms) {
        itemStmt.run(saleId, item.product_id, item.inventory_id, item.quantity, item.unit_price, item.discount, item.total_price, item.batch_number);
        updateInventoryStmt.run(item.quantity, item.inventory_id);
        transactionStmt.run(item.product_id, 'OUT', -item.quantity, 'SALE', saleId);
      }
      return saleId;
    });
    return transaction(sale, items);
  }

  getDashboardStats() {
    const totalProducts = this.db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count;
    const totalInventoryValue = this.db.prepare('SELECT COALESCE(SUM(quantity * cost_price), 0) as value FROM inventory').get().value;
    const lowStockCount = this.db.prepare('SELECT COUNT(DISTINCT p.id) as count FROM products p LEFT JOIN inventory i ON p.id = i.product_id WHERE p.is_active = 1 GROUP BY p.id HAVING COALESCE(SUM(i.quantity), 0) < p.min_stock_level').get()?.count || 0;
    const todaySales = this.db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE DATE(sale_date) = DATE(?)').get(new Date().toISOString().split('T')[0]).total;
    return { totalProducts, totalInventoryValue, lowStockCount, todaySales };
  }

  close() { this.db.close(); }
}

module.exports = DatabaseManager;
