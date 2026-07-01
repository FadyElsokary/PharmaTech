# PharmaTech - Remaining Features Implementation Plan

## 📊 Current Project Status

### ✅ Completed Features
- Basic Electron app structure with React
- Database setup with Better-SQLite3
- Bilingual support (Arabic/English) with RTL
- Layout components (Header, Sidebar, Layout)
- Dashboard with module cards
- Basic Inventory List page
- Product Add/Edit forms (basic structure)
- Language context and switching
- Basic routing setup

### 🚧 Features to Implement
This document outlines the complete implementation plan for all remaining features.

---

## 🎯 Phase 1: Complete Inventory Module

### Priority: **HIGH** | Estimated Time: 2-3 days

#### 1.1 Missing Pages

**A. Product Details Page**
- **File**: [`src/pages/Inventory/ProductDetails.jsx`](src/pages/Inventory/ProductDetails.jsx:1)
- **Features**:
  - Display complete product information
  - Show inventory levels by batch
  - Display transaction history
  - Show expiry dates and alerts
  - Edit and delete actions
  - Print product label

**B. Category Management**
- **File**: [`src/pages/Inventory/CategoryManagement.jsx`](src/pages/Inventory/CategoryManagement.jsx:1)
- **Features**:
  - List all categories
  - Add new category (with parent category support)
  - Edit category
  - Delete category (with validation)
  - View products in category

**C. Stock Adjustment**
- **File**: [`src/pages/Inventory/StockAdjustment.jsx`](src/pages/Inventory/StockAdjustment.jsx:1)
- **Features**:
  - Adjust inventory quantities
  - Record adjustment reasons
  - Log all adjustments in transactions table
  - Support for multiple adjustment types (damage, theft, correction)

#### 1.2 Enhance Existing Pages

**A. AddProduct.jsx Enhancements**
- Add image upload functionality
- Implement comprehensive validation
- Add batch number field
- Add expiry date field
- Add cost price and selling price
- Add storage location field
- Implement auto-save draft
- Add barcode generation option

**B. EditProduct.jsx Enhancements**
- Load existing product data
- Show edit history
- Validate changes
- Update inventory on price changes

**C. InventoryList.jsx Enhancements**
- Add advanced filtering (by category, stock status)
- Add sorting options
- Add bulk actions (delete, export)
- Add pagination
- Show low stock alerts prominently
- Add export to CSV/Excel

#### 1.3 Database Updates Needed

```javascript
// Add to electron/database/db.js

// Search products method
searchProducts(searchTerm) {
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
  `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
}

// Get inventory by product
getInventoryByProduct(productId) {
  return this.db.prepare(`
    SELECT * FROM inventory 
    WHERE product_id = ? 
    ORDER BY expiry_date ASC
  `).all(productId);
}

// Add inventory transaction
addInventoryTransaction(transaction) {
  const stmt = this.db.prepare(`
    INSERT INTO inventory_transactions 
    (product_id, transaction_type, quantity, reference_type, reference_id, notes, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    transaction.product_id,
    transaction.transaction_type,
    transaction.quantity,
    transaction.reference_type,
    transaction.reference_id,
    transaction.notes,
    transaction.user_id
  );
}
```

#### 1.4 Translation Updates

Add to [`src/i18n/ar.json`](src/i18n/ar.json:1) and [`src/i18n/en.json`](src/i18n/en.json:1):

```json
{
  "inventory": {
    "productDetails": "تفاصيل المنتج",
    "categoryManagement": "إدارة الفئات",
    "stockAdjustment": "تعديل المخزون",
    "adjustmentReason": "سبب التعديل",
    "batchNumber": "رقم الدفعة",
    "expiryDate": "تاريخ الانتهاء",
    "manufactureDate": "تاريخ الإنتاج",
    "costPrice": "سعر التكلفة",
    "sellingPrice": "سعر البيع",
    "storageLocation": "موقع التخزين",
    "inStock": "متوفر",
    "totalProducts": "إجمالي المنتجات",
    "errorLoading": "خطأ في تحميل البيانات",
    "errorSaving": "خطأ في حفظ البيانات",
    "deleteConfirm": "هل أنت متأكد من الحذف؟",
    "actions": "الإجراءات"
  }
}
```

---

## 🎯 Phase 2: Purchases & Suppliers Module

### Priority: **HIGH** | Estimated Time: 3-4 days

#### 2.1 Database Schema

**Add to [`electron/database/db.js`](electron/database/db.js:1) in `createTables()` method:**

```javascript
// Suppliers table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    tax_number TEXT,
    payment_terms TEXT,
    credit_limit DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Purchases table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    purchase_date DATE NOT NULL,
    invoice_number TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  )
`);

// Purchase items table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    batch_number TEXT,
    expiry_date DATE,
    manufacture_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);
```

#### 2.2 Pages to Create

**A. Supplier Management**

1. **SupplierList.jsx** - List all suppliers
   - Display supplier information in table
   - Search and filter suppliers
   - Add, edit, delete actions
   - Show outstanding balance

2. **AddSupplier.jsx** - Add new supplier
   - Form with all supplier fields
   - Validation for required fields
   - Duplicate check by name/phone

3. **EditSupplier.jsx** - Edit supplier
   - Load existing data
   - Update supplier information
   - Show purchase history

4. **SupplierDetails.jsx** - View supplier details
   - Complete supplier information
   - Purchase history
   - Payment history
   - Outstanding balance
   - Contact information

**B. Purchase Management**

1. **PurchaseList.jsx** - List all purchases
   - Display purchases in table
   - Filter by date, supplier, status
   - Show payment status
   - Quick actions (view, receive, pay)

2. **CreatePurchase.jsx** - Create new purchase order
   - Select supplier
   - Add multiple products
   - Calculate totals automatically
   - Set payment terms
   - Generate invoice number

3. **PurchaseDetails.jsx** - View purchase details
   - Complete purchase information
   - List of items
   - Payment status
   - Actions (receive stock, record payment, print)

4. **ReceiveStock.jsx** - Receive purchased items
   - Verify quantities
   - Add batch numbers and expiry dates
   - Update inventory automatically
   - Record transaction

#### 2.3 Database Methods

Add to [`electron/database/db.js`](electron/database/db.js:1):

```javascript
// Supplier operations
getSuppliers() {
  return this.db.prepare(`
    SELECT s.*, 
           COUNT(p.id) as total_purchases,
           COALESCE(SUM(p.total_amount - p.paid_amount), 0) as outstanding_balance
    FROM suppliers s
    LEFT JOIN purchases p ON s.id = p.supplier_id
    WHERE s.is_active = 1
    GROUP BY s.id
    ORDER BY s.name_ar
  `).all();
}

createSupplier(supplier) {
  const stmt = this.db.prepare(`
    INSERT INTO suppliers (name_ar, name_en, contact_person, phone, email, 
                          address, tax_number, payment_terms, credit_limit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    supplier.name_ar, supplier.name_en, supplier.contact_person,
    supplier.phone, supplier.email, supplier.address,
    supplier.tax_number, supplier.payment_terms, supplier.credit_limit
  ).lastInsertRowid;
}

// Purchase operations
createPurchase(purchase, items) {
  const transaction = this.db.transaction((purchase, items) => {
    // Insert purchase
    const purchaseStmt = this.db.prepare(`
      INSERT INTO purchases (supplier_id, purchase_date, invoice_number, 
                            subtotal, discount, tax, total_amount, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = purchaseStmt.run(
      purchase.supplier_id, purchase.purchase_date, purchase.invoice_number,
      purchase.subtotal, purchase.discount, purchase.tax, 
      purchase.total_amount, purchase.status, purchase.notes
    );
    const purchaseId = result.lastInsertRowid;

    // Insert purchase items
    const itemStmt = this.db.prepare(`
      INSERT INTO purchase_items (purchase_id, product_id, quantity, 
                                 unit_price, discount, total_price, 
                                 batch_number, expiry_date, manufacture_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of items) {
      itemStmt.run(
        purchaseId, item.product_id, item.quantity,
        item.unit_price, item.discount, item.total_price,
        item.batch_number, item.expiry_date, item.manufacture_date
      );
    }

    return purchaseId;
  });

  return transaction(purchase, items);
}

receivePurchase(purchaseId, items) {
  const transaction = this.db.transaction((purchaseId, items) => {
    // Update inventory for each item
    const inventoryStmt = this.db.prepare(`
      INSERT INTO inventory (product_id, batch_number, quantity, cost_price, 
                            selling_price, expiry_date, manufacture_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transactionStmt = this.db.prepare(`
      INSERT INTO inventory_transactions (product_id, transaction_type, 
                                         quantity, reference_type, reference_id)
      VALUES (?, 'IN', ?, 'PURCHASE', ?)
    `);

    for (const item of items) {
      inventoryStmt.run(
        item.product_id, item.batch_number, item.quantity,
        item.cost_price, item.selling_price,
        item.expiry_date, item.manufacture_date
      );

      transactionStmt.run(item.product_id, item.quantity, purchaseId);
    }

    // Update purchase status
    this.db.prepare('UPDATE purchases SET status = ? WHERE id = ?')
      .run('received', purchaseId);
  });

  return transaction(purchaseId, items);
}
```

#### 2.4 IPC Handlers

Add to [`electron/main.js`](electron/main.js:1):

```javascript
// Supplier handlers
ipcMain.handle('db:getSuppliers', () => db.getSuppliers());
ipcMain.handle('db:getSupplier', (event, id) => db.getSupplier(id));
ipcMain.handle('db:createSupplier', (event, supplier) => db.createSupplier(supplier));
ipcMain.handle('db:updateSupplier', (event, id, supplier) => db.updateSupplier(id, supplier));
ipcMain.handle('db:deleteSupplier', (event, id) => db.deleteSupplier(id));

// Purchase handlers
ipcMain.handle('db:getPurchases', () => db.getPurchases());
ipcMain.handle('db:getPurchase', (event, id) => db.getPurchase(id));
ipcMain.handle('db:createPurchase', (event, purchase, items) => db.createPurchase(purchase, items));
ipcMain.handle('db:receivePurchase', (event, purchaseId, items) => db.receivePurchase(purchaseId, items));
ipcMain.handle('db:recordPurchasePayment', (event, purchaseId, amount) => db.recordPurchasePayment(purchaseId, amount));
```

#### 2.5 Preload Script Updates

Add to [`electron/preload.js`](electron/preload.js:1):

```javascript
// Suppliers
getSuppliers: () => ipcRenderer.invoke('db:getSuppliers'),
getSupplier: (id) => ipcRenderer.invoke('db:getSupplier', id),
createSupplier: (supplier) => ipcRenderer.invoke('db:createSupplier', supplier),
updateSupplier: (id, supplier) => ipcRenderer.invoke('db:updateSupplier', id, supplier),
deleteSupplier: (id) => ipcRenderer.invoke('db:deleteSupplier', id),

// Purchases
getPurchases: () => ipcRenderer.invoke('db:getPurchases'),
getPurchase: (id) => ipcRenderer.invoke('db:getPurchase', id),
createPurchase: (purchase, items) => ipcRenderer.invoke('db:createPurchase', purchase, items),
receivePurchase: (purchaseId, items) => ipcRenderer.invoke('db:receivePurchase', purchaseId, items),
recordPurchasePayment: (purchaseId, amount) => ipcRenderer.invoke('db:recordPurchasePayment', purchaseId, amount),
```

#### 2.6 Routing Updates

Add to [`src/App.jsx`](src/App.jsx:1):

```javascript
// Import purchase pages
import SupplierList from './pages/Purchases/SupplierList';
import AddSupplier from './pages/Purchases/AddSupplier';
import EditSupplier from './pages/Purchases/EditSupplier';
import SupplierDetails from './pages/Purchases/SupplierDetails';
import PurchaseList from './pages/Purchases/PurchaseList';
import CreatePurchase from './pages/Purchases/CreatePurchase';
import PurchaseDetails from './pages/Purchases/PurchaseDetails';
import ReceiveStock from './pages/Purchases/ReceiveStock';

// Add routes
<Route path="/purchases" element={<PurchaseList />} />
<Route path="/purchases/new" element={<CreatePurchase />} />
<Route path="/purchases/:id" element={<PurchaseDetails />} />
<Route path="/purchases/:id/receive" element={<ReceiveStock />} />
<Route path="/suppliers" element={<SupplierList />} />
<Route path="/suppliers/add" element={<AddSupplier />} />
<Route path="/suppliers/edit/:id" element={<EditSupplier />} />
<Route path="/suppliers/:id" element={<SupplierDetails />} />
```

---

## 🎯 Phase 3: Sales & Customers Module

### Priority: **HIGH** | Estimated Time: 4-5 days

#### 3.1 Database Schema

Add to [`electron/database/db.js`](electron/database/db.js:1):

```javascript
// Customers table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    customer_type TEXT DEFAULT 'retail',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Sales table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    sale_date DATE NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_method TEXT,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )
`);

// Sale items table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    inventory_id INTEGER,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    batch_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
  )
`);

// Sale returns table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS sale_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    return_date DATE NOT NULL,
    return_amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id)
  )
`);
```

#### 3.2 Pages to Create

**A. Customer Management**

1. **CustomerList.jsx** - List all customers
2. **AddCustomer.jsx** - Add new customer
3. **EditCustomer.jsx** - Edit customer
4. **CustomerDetails.jsx** - View customer details and history

**B. Sales Management**

1. **SalesList.jsx** - List all sales
2. **NewSale.jsx** - POS interface for new sale
3. **SaleDetails.jsx** - View sale details
4. **SaleReturn.jsx** - Process returns

#### 3.3 Key Features for POS Interface

**NewSale.jsx should include:**
- Product search by name or barcode
- Quick add to cart
- Quantity adjustment
- Discount application (item-level and total)
- Multiple payment methods
- Customer selection (optional)
- Real-time total calculation
- Print receipt
- Save and print invoice

**Example POS Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [Search Product...]                    [Customer ▼]│
├─────────────────────────────────────────────────────┤
│  Cart Items:                                         │
│  ┌───────────────────────────────────────────────┐  │
│  │ Product    Qty  Price  Discount  Total        │  │
│  │ Aspirin    2    10.00  0.00      20.00   [X]  │  │
│  │ Vitamin C  1    25.00  5.00      20.00   [X]  │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  Subtotal:                              40.00       │
│  Discount:                              5.00        │
│  Tax:                                   0.00        │
│  ─────────────────────────────────────────────      │
│  Total:                                 35.00       │
│                                                      │
│  [Cash] [Card] [Credit]                             │
│  [Clear Cart]  [Save Draft]  [Complete Sale]        │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Phase 4: Payments & Receipts Module

### Priority: **MEDIUM** | Estimated Time: 2-3 days

#### 4.1 Database Schema

```javascript
// Payments table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_type TEXT NOT NULL,
    reference_type TEXT,
    reference_id INTEGER,
    entity_id INTEGER,
    entity_type TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_date DATE NOT NULL,
    receipt_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Expenses table
this.db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    payment_method TEXT,
    receipt_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

#### 4.2 Pages to Create

1. **PaymentList.jsx** - All payments and receipts
2. **RecordPayment.jsx** - Record new payment
3. **ExpenseList.jsx** - List expenses
4. **AddExpense.jsx** - Add new expense
5. **CashFlow.jsx** - Cash flow report

---

## 🎯 Phase 5: Reports & Analytics

### Priority: **MEDIUM** | Estimated Time: 3-4 days

#### 5.1 Dashboard Enhancements

Add statistics cards to [`Dashboard.jsx`](src/pages/Dashboard.jsx:1):
- Total inventory value
- Low stock items count
- Today's sales
- Pending payments
- Recent transactions
- Sales chart

#### 5.2 Report Pages

1. **InventoryReport.jsx** - Stock levels and valuation
2. **SalesReport.jsx** - Sales analysis by date range
3. **PurchaseReport.jsx** - Purchase analysis
4. **ProfitLossReport.jsx** - Financial summary
5. **ExpiryReport.jsx** - Products expiring soon
6. **CustomerReport.jsx** - Customer analytics
7. **SupplierReport.jsx** - Supplier analytics

---

## 🎯 Phase 6: Advanced Features

### Priority: **LOW** | Estimated Time: 2-3 days

#### 6.1 Settings Page

Create [`src/pages/Settings/Settings.jsx`](src/pages/Settings/Settings.jsx:1):
- Company information
- Tax settings
- Currency settings
- Receipt template customization
- Backup and restore
- User preferences

#### 6.2 Backup & Restore

- Export database to file
- Import database from file
- Scheduled automatic backups
- Cloud backup integration (optional)

#### 6.3 Notifications System

- Low stock alerts
- Expiry date warnings
- Payment reminders
- System notifications

#### 6.4 Search Enhancement

- Global search across all modules
- Advanced filters
- Saved searches

---

## 🎯 Phase 7: Form Validation & Error Handling

### Priority: **HIGH** | Estimated Time: 2 days

#### 7.1 Create Validation Utilities

Create [`src/utils/validation.js`](src/utils/validation.js:1):

```javascript
export const validators = {
  required: (value) => {
    return value && value.toString().trim() !== '';
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  phone: (value) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(value.replace(/[\s-]/g, ''));
  },
  
  number: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  positiveNumber: (value) => {
    return validators.number(value) && parseFloat(value) > 0;
  },
  
  barcode: (value) => {
    return /^[0-9]{8,13}$/.test(value);
  },
  
  minLength: (value, min) => {
    return value && value.length >= min;
  },
  
  maxLength: (value, max) => {
    return value && value.length <= max;
  }
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const field in rules) {
    const fieldRules = rules[field];
    const value = formData[field];
    
    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

#### 7.2 Error Handling Components

Create [`src/components/Common/ErrorBoundary.jsx`](src/components/Common/ErrorBoundary.jsx:1):

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 🎯 Phase 8: Security Features

### Priority: **HIGH** | Estimated Time: 2 days

#### 8.1 Input Sanitization

Create [`src/utils/security.js`](src/utils/security.js:1):

```javascript
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

export const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};
```

#### 8.2 Database Security

- Use parameterized queries (already implemented)
- Validate all inputs before database operations
- Implement transaction rollback on errors
- Add database backup encryption (optional)

---

## 🎯 Phase 9: User Documentation

### Priority: **MEDIUM** | Estimated Time: 2-3 days

#### 9.1 Create User Manuals

**Files to Create:**
- [`docs/USER_MANUAL_AR.md`](docs/USER_MANUAL_AR.md:1) - Arabic user manual
- [`docs/USER_MANUAL_EN.md`](docs/USER_MANUAL_EN.md:1) - English user manual
- [`docs/INSTALLATION_GUIDE.md`](docs/INSTALLATION_GUIDE.md:1) - Installation instructions
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md:1) - Common issues and solutions

#### 9.2 In-App Help

- Add help tooltips to forms
- Create tutorial videos (optional)
- Add keyboard shortcuts guide
- Create FAQ section

---

## 🎯 Phase 10: Testing & Bug Fixes

### Priority: **HIGH** | Estimated Time: 3-4 days

#### 10.1 Testing Checklist

**Functional Testing:**
- [ ] All CRUD operations work correctly
- [ ] Database transactions are atomic
- [ ] Search and filter functions work
- [ ] Reports generate correctly
- [ ] Calculations are accurate
- [ ] Language switching works
- [ ] RTL layout displays correctly

**UI/UX Testing:**
- [ ] All pages are responsive
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Navigation is intuitive
- [ ] Print functionality works

**Security Testing:**
- [ ] Input validation works
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Data sanitization

**Performance Testing:**
- [ ] Large datasets load quickly
- [ ] Database queries are optimized
- [ ] No memory leaks
- [ ] Smooth animations

#### 10.2 Bug Tracking

Create a bug tracking document to log and fix issues:
- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Priority level
- Status (open, in progress, fixed)

---

## 🎯 Phase 11: Build & Package

### Priority: **HIGH** | Estimated Time: 1-2 days

#### 11.1 Build Configuration

Update [`package.json`](package.json:1) build section:

```json
{
  "build": {
    "appId": "com.pharmatech.app",
    "productName": "PharmaTech",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/icons/icon.icns",
      "category": "public.app-category.business"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icons/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

#### 11.2 Create Application Icons

- Create icon.icns for macOS (1024x1024)
- Create icon.ico for Windows (256x256)
- Place in [`public/icons/`](public/icons/:1)

#### 11.3 Build Commands

```bash
# Build for macOS
npm run electron:build

# Build for Windows (from macOS)
npm run electron:build:win

# Test production build
npm run build && npm run preview
```

---

## 📊 Implementation Timeline

### Week 1-2: Core Modules
- Complete Inventory Module
- Start Purchases & Suppliers Module

### Week 3-4: Sales & Payments
- Complete Purchases & Suppliers
- Implement Sales & Customers
- Implement Payments & Receipts

### Week 5: Reports & Advanced Features
- Add Reports and Analytics
- Implement Advanced Features
- Add Settings page

### Week 6: Polish & Testing
- Form Validation & Error Handling
- Security Features
- Comprehensive Testing
- Bug Fixes

### Week 7: Documentation & Deployment
- User Documentation
- Final Testing
- Build & Package
- Deployment

---

## 🎯 Success Criteria

The project will be considered complete when:

- ✅ All four core modules are fully functional
- ✅ All CRUD operations work correctly
- ✅ Bilingual support works perfectly
- ✅ RTL layout displays correctly
- ✅ All reports generate accurately
- ✅ Forms validate properly
- ✅ No critical bugs
- ✅ Application builds successfully for macOS and Windows
- ✅ User documentation is complete
- ✅ Performance is acceptable

---

## 📝 Notes

- Focus on completing one module at a time
- Test each feature before moving to the next
- Keep code clean and well-documented
- Follow security best practices
- Maintain consistent code style
- Regular commits with clear messages

---

## 🚀 Getting Started

To begin implementation:

1. Review this plan thoroughly
2. Start with Phase 1 (Complete Inventory Module)
3. Follow the order of phases
4. Test each feature as you build it
5. Update the todo list as you progress

When ready to start coding, switch to **Code mode** and begin with Phase 1!

---

**Document Version:** 1.0  
**Created:** 2026-07-01  
**Status:** Ready for Implementation
