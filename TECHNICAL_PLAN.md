# PharmaTech - Pharmacy Management System
## Technical Architecture & Implementation Plan

---

## 📋 Project Overview

**Application Name:** PharmaTech  
**Type:** Desktop Application (Cross-platform)  
**Primary Platform:** macOS (Development), Windows (Deployment)  
**Technology Stack:** Electron + React + Better-SQLite3  
**Languages:** Arabic & English (Switchable)

---

## 🎯 Core Modules (Phase 1)

1. **إدارة المخزون** (Inventory Management) - Priority 1
2. **إدارة المشتريات والموردين** (Purchases & Suppliers Management)
3. **المبيعات والعملاء** (Sales & Customers)
4. **المدفوعات والمقبوضات** (Payments & Receipts)

---

## 🏗️ Architecture Design

### Application Structure

```
PharmaTech/
├── electron/                    # Electron main process
│   ├── main.js                 # Main entry point
│   ├── preload.js              # Preload script for IPC
│   └── database/
│       ├── db.js               # Database initialization
│       └── migrations/         # Database schema versions
├── src/                        # React application
│   ├── App.jsx                 # Root component
│   ├── main.jsx               # React entry point
│   ├── components/            # Reusable components
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── Common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Table.jsx
│   │   │   └── Modal.jsx
│   │   └── LanguageSwitcher.jsx
│   ├── pages/                 # Application pages
│   │   ├── Dashboard.jsx      # Welcome page
│   │   ├── Inventory/
│   │   │   ├── InventoryList.jsx
│   │   │   ├── AddProduct.jsx
│   │   │   ├── EditProduct.jsx
│   │   │   └── ProductDetails.jsx
│   │   ├── Purchases/
│   │   ├── Sales/
│   │   └── Payments/
│   ├── context/               # React Context for state
│   │   ├── LanguageContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useDatabase.js
│   │   └── useLanguage.js
│   ├── i18n/                  # Internationalization
│   │   ├── ar.json            # Arabic translations
│   │   └── en.json            # English translations
│   ├── styles/                # CSS/SCSS files
│   │   ├── global.css
│   │   ├── rtl.css            # RTL-specific styles
│   │   └── components/
│   └── utils/                 # Utility functions
│       ├── validation.js
│       └── formatters.js
├── public/                    # Static assets
│   └── icons/
├── package.json
├── vite.config.js            # Vite configuration
└── electron-builder.json     # Build configuration
```

---

## 💾 Database Schema (Phase 1 - Inventory)

### Tables Structure

#### 1. **products** (المنتجات)
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    category_id INTEGER,
    unit_type TEXT NOT NULL,        -- قطعة، علبة، شريط
    reorder_level INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### 2. **categories** (الفئات)
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

#### 3. **inventory** (المخزون)
```sql
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    batch_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    expiry_date DATE,
    manufacture_date DATE,
    location TEXT,                   -- موقع التخزين
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### 4. **inventory_transactions** (حركات المخزون)
```sql
CREATE TABLE inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,  -- IN, OUT, ADJUSTMENT
    quantity INTEGER NOT NULL,
    reference_type TEXT,             -- PURCHASE, SALE, RETURN, ADJUSTMENT
    reference_id INTEGER,
    notes TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### 5. **settings** (الإعدادات)
```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 Bilingual Support Implementation

### Language Context Structure

```javascript
{
  currentLanguage: 'ar' | 'en',
  direction: 'rtl' | 'ltr',
  translations: {
    // Loaded from i18n files
  }
}
```

### Translation File Structure (ar.json)

```json
{
  "app": {
    "name": "فارماتك",
    "welcome": "مرحباً بك"
  },
  "modules": {
    "inventory": "إدارة المخزون",
    "purchases": "إدارة المشتريات والموردين",
    "sales": "المبيعات والعملاء",
    "payments": "المدفوعات والمقبوضات"
  },
  "inventory": {
    "title": "إدارة المخزون",
    "addProduct": "إضافة منتج",
    "productName": "اسم المنتج",
    "barcode": "الباركود",
    "quantity": "الكمية",
    "price": "السعر"
  }
}
```

---

## 🎨 UI/UX Design Principles

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  [Logo] PharmaTech          [Language] [Settings]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│              مرحباً بك في فارماتك                   │
│         نظام إدارة الصيدليات المتكامل               │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   📦         │  │   🛒         │                │
│  │ إدارة المخزون│  │ المشتريات    │                │
│  └──────────────┘  └──────────────┘                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   💰         │  │   💳         │                │
│  │  المبيعات    │  │  المدفوعات   │                │
│  └──────────────┘  └──────────────┘                │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Inventory Management Page

```
┌─────────────────────────────────────────────────────┐
│  ← العودة    إدارة المخزون                          │
├─────────────────────────────────────────────────────┤
│  [بحث...] [فلتر] [+ إضافة منتج]                    │
├─────────────────────────────────────────────────────┤
│  الباركود │ اسم المنتج │ الكمية │ السعر │ إجراءات  │
│  ─────────┼───────────┼────────┼───────┼──────────  │
│  123456   │ دواء أ    │  50    │ 25.00 │ [✏️] [🗑️] │
│  789012   │ دواء ب    │  30    │ 45.00 │ [✏️] [🗑️] │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack Details

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Electron | Latest stable | Desktop application framework |
| React | 18.x | UI framework |
| Vite | Latest | Build tool and dev server |
| Better-SQLite3 | Latest | Database engine |
| React Router | 6.x | Navigation |
| i18next | Latest | Internationalization |

### Development Dependencies

- **electron-builder**: For packaging and distribution
- **concurrently**: Run multiple commands simultaneously
- **wait-on**: Wait for resources before starting

---

## 🔐 Security Considerations

### Data Protection
- ✅ Local database stored in user's app data directory
- ✅ No hardcoded credentials
- ✅ Input validation on all forms
- ✅ SQL injection prevention via parameterized queries
- ✅ XSS prevention via React's built-in escaping

### IPC Security
- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Preload script for secure IPC communication
- ✅ Whitelist allowed IPC channels

---

## 📦 Build & Deployment Strategy

### Development Environment
```bash
npm run dev          # Start development server
npm run electron:dev # Start Electron in dev mode
```

### Production Build
```bash
npm run build        # Build React app
npm run electron:build # Package for macOS
npm run electron:build:win # Package for Windows
```

### Distribution
- **macOS**: `.dmg` installer
- **Windows**: `.exe` installer with auto-updater support

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Current)
- [x] Project setup and configuration
- [ ] Database schema implementation
- [ ] Basic UI components
- [ ] Language switching functionality
- [ ] Dashboard/Welcome page

### Phase 2: Inventory Module
- [ ] Product management (CRUD)
- [ ] Category management
- [ ] Stock tracking
- [ ] Low stock alerts
- [ ] Search and filtering

### Phase 3: Additional Modules
- [ ] Purchases & Suppliers
- [ ] Sales & Customers
- [ ] Payments & Receipts

### Phase 4: Advanced Features
- [ ] Reports and analytics
- [ ] Backup and restore
- [ ] User management
- [ ] Barcode scanning integration

---

## 🧪 Testing Strategy

### Unit Tests
- Database operations
- Utility functions
- Validation logic

### Integration Tests
- IPC communication
- Database transactions
- Component interactions

### Manual Testing
- UI/UX flow
- RTL layout verification
- Cross-platform compatibility

---

## 📚 Documentation Requirements

1. **README.md**: Setup and installation instructions
2. **USER_GUIDE.md**: End-user documentation (Arabic & English)
3. **API_DOCUMENTATION.md**: IPC API reference
4. **DATABASE_SCHEMA.md**: Database structure and relationships

---

## 🎯 Success Criteria

- ✅ Application runs on macOS without errors
- ✅ Smooth language switching between Arabic and English
- ✅ RTL layout works correctly for Arabic
- ✅ All inventory CRUD operations functional
- ✅ Data persists correctly in local database
- ✅ Responsive UI that works on different screen sizes
- ✅ No security vulnerabilities in dependencies

---

## 🔄 Future Enhancements

1. **Cloud Sync**: Optional cloud backup
2. **Multi-pharmacy**: Support for multiple branches
3. **Mobile App**: Companion mobile application
4. **Barcode Scanner**: Hardware integration
5. **Reporting**: Advanced analytics and reports
6. **Notifications**: Expiry alerts, low stock warnings
7. **Prescription Management**: Track prescriptions
8. **Insurance Integration**: Insurance claim processing

---

## 📞 Support & Maintenance

- Regular dependency updates
- Security patches
- Bug fixes
- Feature requests from users
- Performance optimization

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-30  
**Status:** Ready for Implementation