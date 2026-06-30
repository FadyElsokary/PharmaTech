# PharmaTech - Quick Reference Guide

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev              # Start Vite dev server only
npm run electron:dev     # Start full Electron app in dev mode

# Building
npm run build           # Build React app for production
npm run electron:build  # Build macOS app (.dmg)
npm run electron:build:win  # Build Windows app (.exe)

# Testing
npm test               # Run tests
npm run lint           # Check code quality
```

---

## 📁 File Locations

### Configuration Files
- [`package.json`](package.json:1) - Project dependencies and scripts
- [`vite.config.js`](vite.config.js:1) - Vite build configuration
- [`electron-builder.json`](electron-builder.json:1) - Electron packaging config

### Main Process
- [`electron/main.js`](electron/main.js:1) - Electron entry point
- [`electron/preload.js`](electron/preload.js:1) - IPC bridge
- [`electron/database/db.js`](electron/database/db.js:1) - Database manager

### React App
- [`src/main.jsx`](src/main.jsx:1) - React entry point
- [`src/App.jsx`](src/App.jsx:1) - Root component
- [`src/context/LanguageContext.jsx`](src/context/LanguageContext.jsx:1) - Language management

### Translations
- [`src/i18n/ar.json`](src/i18n/ar.json:1) - Arabic translations
- [`src/i18n/en.json`](src/i18n/en.json:1) - English translations

### Styles
- [`src/styles/global.css`](src/styles/global.css:1) - Global styles
- [`src/styles/rtl.css`](src/styles/rtl.css:1) - RTL-specific styles

---

## 🗄️ Database Quick Reference

### Common Queries

```javascript
// Get all products
const products = await window.electronAPI.getProducts();

// Get single product
const product = await window.electronAPI.getProduct(id);

// Create product
const id = await window.electronAPI.createProduct({
  barcode: '123456',
  name_ar: 'دواء أ',
  name_en: 'Medicine A',
  category_id: 1,
  unit_type: 'قطعة',
  reorder_level: 10
});

// Update product
await window.electronAPI.updateProduct(id, updatedData);

// Delete product (soft delete)
await window.electronAPI.deleteProduct(id);

// Get categories
const categories = await window.electronAPI.getCategories();
```

### Database Location

**macOS:** `~/Library/Application Support/PharmaTech/pharmatech.db`  
**Windows:** `%APPDATA%/PharmaTech/pharmatech.db`

---

## 🌐 Language Management

### Using Language Context

```javascript
import { useLanguage } from '@/context/LanguageContext';

function MyComponent() {
  const { language, direction, changeLanguage, t } = useLanguage();
  
  return (
    <div dir={direction}>
      <h1>{t('app.welcome')}</h1>
      <button onClick={() => changeLanguage(language === 'ar' ? 'en' : 'ar')}>
        {language === 'ar' ? 'English' : 'العربية'}
      </button>
    </div>
  );
}
```

### Translation Keys

```javascript
t('app.name')              // "فارماتك" or "PharmaTech"
t('common.save')           // "حفظ" or "Save"
t('inventory.title')       // "إدارة المخزون" or "Inventory Management"
t('modules.inventory')     // Module names
```

---

## 🎨 Styling Quick Reference

### CSS Variables

```css
var(--primary-color)      /* #2563eb */
var(--secondary-color)    /* #64748b */
var(--success-color)      /* #10b981 */
var(--danger-color)       /* #ef4444 */
var(--warning-color)      /* #f59e0b */
var(--background)         /* #f8fafc */
var(--surface)            /* #ffffff */
var(--text-primary)       /* #1e293b */
var(--text-secondary)     /* #64748b */
var(--border-color)       /* #e2e8f0 */
```

### Utility Classes

```css
.container    /* Max-width container with padding */
.card         /* Card with shadow and padding */
.btn          /* Base button styles */
.btn-primary  /* Primary button */
.btn-secondary /* Secondary button */
.btn-danger   /* Danger button */
.input        /* Input field styles */
```

### RTL Support

```css
/* Automatically applied when dir="rtl" */
[dir="rtl"] .flex-row { flex-direction: row-reverse; }
[dir="rtl"] .text-left { text-align: right; }
```

---

## 🔧 Common React Patterns

### Custom Hook for Database

```javascript
import { useState, useEffect } from 'react';

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, reload: loadProducts };
}
```

### Form Handling

```javascript
function ProductForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    barcode: '',
    category_id: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name_ar"
        value={formData.name_ar}
        onChange={handleChange}
        placeholder="اسم المنتج"
      />
      {/* More fields */}
      <button type="submit">حفظ</button>
    </form>
  );
}
```

---

## 🔐 Security Checklist

Before committing code:

- [ ] All database queries use parameterized statements
- [ ] User input is validated
- [ ] No sensitive data in logs
- [ ] No hardcoded secrets
- [ ] Error messages don't expose internals
- [ ] IPC channels are whitelisted

---

## 🐛 Debugging Tips

### Electron DevTools

```javascript
// In electron/main.js
mainWindow.webContents.openDevTools();
```

### Console Logging

```javascript
// Renderer process
console.log('React:', data);

// Main process
console.log('Electron:', data);
```

### Database Debugging

```javascript
// View database file
// Use DB Browser for SQLite
// Location: ~/Library/Application Support/PharmaTech/pharmatech.db
```

---

## 📊 Common Issues & Solutions

### Issue: Electron window doesn't open
**Solution:** Check if port 5173 is available, restart dev server

### Issue: Database not found
**Solution:** Check app.getPath('userData'), ensure database is initialized

### Issue: Arabic text not displaying correctly
**Solution:** Verify `dir="rtl"` and `lang="ar"` in HTML

### Issue: Better-SQLite3 installation fails
**Solution:** Install Xcode command line tools: `xcode-select --install`

### Issue: IPC not working
**Solution:** Verify preload script is loaded, check contextBridge exposure

---

## 📦 Package Management

### Adding Dependencies

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Update specific package
npm update package-name
```

### Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🎯 Module Structure Template

### Creating a New Module

```
src/pages/ModuleName/
├── index.jsx           # Main module component
├── List.jsx           # List view
├── Add.jsx            # Add form
├── Edit.jsx           # Edit form
├── Details.jsx        # Details view
└── styles.css         # Module-specific styles
```

### Module Component Template

```javascript
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

function ModuleName() {
  const { t } = useLanguage();

  return (
    <div className="module-container">
      <h1>{t('module.title')}</h1>
      {/* Module content */}
    </div>
  );
}

export default ModuleName;
```

---

## 🔄 Git Workflow

### Branch Naming

```bash
feature/inventory-module
bugfix/database-connection
hotfix/security-issue
docs/update-readme
```

### Commit Messages

```bash
feat: add inventory list page
fix: resolve database connection issue
docs: update installation guide
style: improve button styling
refactor: reorganize component structure
test: add unit tests for validation
```

### Common Commands

```bash
# Create branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin feature/new-feature

# Pull latest
git pull origin main
```

---

## 📱 Responsive Design Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Test on macOS
- [ ] Test on Windows (if available)
- [ ] Test language switching
- [ ] Test RTL layout
- [ ] Test all CRUD operations
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test with large datasets
- [ ] Test offline functionality

---

## 📚 Useful Code Snippets

### Loading State

```javascript
{loading ? (
  <div className="loading">جاري التحميل...</div>
) : (
  <div>{/* Content */}</div>
)}
```

### Error Display

```javascript
{error && (
  <div className="error-message">
    {error}
  </div>
)}
```

### Empty State

```javascript
{products.length === 0 ? (
  <div className="empty-state">
    {t('common.noData')}
  </div>
) : (
  <div>{/* Products list */}</div>
)}
```

### Confirmation Dialog

```javascript
const handleDelete = (id) => {
  if (window.confirm(t('common.confirm'))) {
    deleteProduct(id);
  }
};
```

---

## 🎨 Icon Resources

- [Heroicons](https://heroicons.com) - Beautiful hand-crafted SVG icons
- [Lucide](https://lucide.dev) - Clean icon set
- [Tabler Icons](https://tabler-icons.io) - Free and open source icons

---

## 📞 Quick Links

- [Electron Docs](https://www.electronjs.org/docs/latest)
- [React Docs](https://react.dev)
- [Better-SQLite3 API](https://github.com/WiseLibs/better-sqlite3/wiki/API)
- [Vite Guide](https://vitejs.dev/guide/)
- [MDN Web Docs](https://developer.mozilla.org)

---

**Last Updated:** 2026-06-30  
**Version:** 1.0