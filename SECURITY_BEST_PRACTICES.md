# PharmaTech - Security & Best Practices Guide

---

## 🔐 Security Overview

This document outlines the security measures and best practices implemented in PharmaTech to ensure data protection, secure operations, and compliance with industry standards.

---

## 🛡️ Security Architecture

### 1. Electron Security Model

#### Context Isolation ✅
```javascript
// electron/main.js
webPreferences: {
  contextIsolation: true,      // Isolate renderer from Node.js
  nodeIntegration: false,       // Disable Node.js in renderer
  preload: path.join(__dirname, 'preload.js')
}
```

**Why**: Prevents malicious code in renderer from accessing Node.js APIs directly.

#### Preload Script Security ✅
```javascript
// electron/preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  // Only expose specific, validated methods
  getProducts: () => ipcRenderer.invoke('db:getProducts'),
  // Never expose: require, process, fs, etc.
});
```

**Why**: Creates a secure bridge with whitelist-only API access.

---

## 💾 Database Security

### 1. SQL Injection Prevention ✅

**ALWAYS use parameterized queries:**

```javascript
// ✅ CORRECT - Parameterized query
const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
const product = stmt.get(userId);

// ❌ WRONG - String concatenation
const query = `SELECT * FROM products WHERE id = ${userId}`;
```

### 2. Database File Protection ✅

```javascript
// Store database in secure user data directory
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'pharmatech.db');
```

**Location on macOS**: `~/Library/Application Support/PharmaTech/`
**Location on Windows**: `%APPDATA%/PharmaTech/`

### 3. Write-Ahead Logging (WAL) ✅

```javascript
this.db.pragma('journal_mode = WAL');
```

**Benefits**:
- Better concurrency
- Improved performance
- Crash recovery

---

## 🔒 Data Protection

### 1. Input Validation

**Always validate user input before database operations:**

```javascript
// src/utils/validation.js
export function validateProduct(product) {
  const errors = {};
  
  // Required fields
  if (!product.name_ar || product.name_ar.trim() === '') {
    errors.name_ar = 'اسم المنتج مطلوب';
  }
  
  if (!product.name_en || product.name_en.trim() === '') {
    errors.name_en = 'Product name is required';
  }
  
  // Numeric validation
  if (product.reorder_level && product.reorder_level < 0) {
    errors.reorder_level = 'يجب أن يكون حد إعادة الطلب رقماً موجباً';
  }
  
  // Price validation
  if (product.selling_price && product.selling_price <= 0) {
    errors.selling_price = 'السعر يجب أن يكون أكبر من صفر';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

### 2. XSS Prevention ✅

React automatically escapes content, but be careful with:

```javascript
// ✅ SAFE - React escapes automatically
<div>{userInput}</div>

// ⚠️ DANGEROUS - Avoid dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - If you must use HTML, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 3. Sensitive Data Handling

**Never log sensitive information:**

```javascript
// ❌ WRONG
console.log('User data:', userData);

// ✅ CORRECT
console.log('User operation completed for ID:', userData.id);
```

---

## 🔑 Access Control

### 1. IPC Channel Whitelist

**Only expose necessary IPC channels:**

```javascript
// electron/main.js
const ALLOWED_CHANNELS = [
  'db:getProducts',
  'db:createProduct',
  'db:updateProduct',
  'db:deleteProduct',
  // ... other allowed channels
];

ipcMain.handle(channel, (event, ...args) => {
  if (!ALLOWED_CHANNELS.includes(channel)) {
    throw new Error('Unauthorized IPC channel');
  }
  // Process request
});
```

### 2. Operation Validation

**Validate operations before execution:**

```javascript
// electron/database/db.js
deleteProduct(id) {
  // Validate ID
  if (!id || typeof id !== 'number') {
    throw new Error('Invalid product ID');
  }
  
  // Check if product exists
  const product = this.getProduct(id);
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Soft delete (preserve data)
  return this.db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
}
```

---

## 📦 Dependency Security

### 1. Package Version Management ✅

**Use latest stable versions:**

```json
{
  "dependencies": {
    "electron": "^28.0.0",
    "react": "^18.2.0",
    "better-sqlite3": "^9.2.0"
  }
}
```

### 2. Regular Security Audits

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update dependencies
npm update
```

### 3. Dependency Scanning

**Use automated tools:**
- GitHub Dependabot
- Snyk
- npm audit

---

## 🚫 Security Anti-Patterns to Avoid

### ❌ 1. Never Disable Security Features

```javascript
// ❌ NEVER DO THIS
webPreferences: {
  nodeIntegration: true,        // DANGEROUS
  contextIsolation: false,      // DANGEROUS
  webSecurity: false            // DANGEROUS
}
```

### ❌ 2. Never Store Secrets in Code

```javascript
// ❌ WRONG
const API_KEY = "sk-1234567890abcdef";

// ✅ CORRECT - Use environment variables or secure storage
const API_KEY = process.env.API_KEY;
```

### ❌ 3. Never Trust Client Input

```javascript
// ❌ WRONG - Direct database query
const query = `DELETE FROM products WHERE id = ${req.id}`;

// ✅ CORRECT - Parameterized query
const stmt = db.prepare('DELETE FROM products WHERE id = ?');
stmt.run(req.id);
```

### ❌ 4. Never Expose Internal Errors

```javascript
// ❌ WRONG
catch (error) {
  return { error: error.stack };
}

// ✅ CORRECT
catch (error) {
  console.error('Database error:', error);
  return { error: 'حدث خطأ في قاعدة البيانات' };
}
```

---

## 🔍 Code Review Checklist

Before committing code, verify:

- [ ] All database queries use parameterized statements
- [ ] User input is validated before processing
- [ ] No sensitive data in logs or error messages
- [ ] IPC channels are whitelisted
- [ ] No hardcoded credentials or secrets
- [ ] Error handling doesn't expose internal details
- [ ] Dependencies are up to date
- [ ] No use of `eval()` or `Function()` constructor
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Context isolation is enabled

---

## 🛠️ Development Best Practices

### 1. Error Handling

```javascript
// Comprehensive error handling
async function createProduct(product) {
  try {
    // Validate input
    const validation = validateProduct(product);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    
    // Perform operation
    const id = await window.electronAPI.createProduct(product);
    
    return {
      success: true,
      data: { id }
    };
  } catch (error) {
    console.error('Failed to create product:', error);
    return {
      success: false,
      error: 'فشل في إنشاء المنتج'
    };
  }
}
```

### 2. Transaction Management

```javascript
// Use transactions for multiple operations
createProductWithInventory(product, inventory) {
  const transaction = this.db.transaction((prod, inv) => {
    const productId = this.createProduct(prod);
    inv.product_id = productId;
    this.createInventory(inv);
    return productId;
  });
  
  return transaction(product, inventory);
}
```

### 3. Data Sanitization

```javascript
// Sanitize data before storage
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000);   // Limit length
}
```

---

## 📊 Logging Best Practices

### 1. Structured Logging

```javascript
// Good logging practice
function logOperation(operation, details) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    operation,
    details: {
      // Only log non-sensitive data
      id: details.id,
      type: details.type,
      success: details.success
    }
  }));
}
```

### 2. Log Levels

```javascript
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

function log(level, message, data = {}) {
  if (process.env.NODE_ENV === 'production' && level === LOG_LEVELS.DEBUG) {
    return; // Don't log debug in production
  }
  
  console[level](`[${level.toUpperCase()}]`, message, data);
}
```

---

## 🔄 Update Strategy

### 1. Electron Updates

```javascript
// electron/main.js
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  // Check for updates (only in production)
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdatesAndNotify();
  }
});
```

### 2. Database Migrations

```javascript
// electron/database/migrations/001_initial.js
module.exports = {
  up: (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        -- schema definition
      )
    `);
  },
  down: (db) => {
    db.exec('DROP TABLE IF EXISTS products');
  }
};
```

---

## 🧪 Security Testing

### 1. Manual Testing Checklist

- [ ] Test SQL injection attempts
- [ ] Test XSS attempts in input fields
- [ ] Test file path traversal
- [ ] Test invalid data types
- [ ] Test boundary conditions
- [ ] Test concurrent operations
- [ ] Test error handling

### 2. Automated Testing

```javascript
// tests/security.test.js
describe('Security Tests', () => {
  test('should prevent SQL injection', () => {
    const maliciousInput = "1'; DROP TABLE products; --";
    expect(() => {
      getProduct(maliciousInput);
    }).not.toThrow();
  });
  
  test('should sanitize HTML input', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });
});
```

---

## 📋 Compliance Checklist

### Data Protection
- [x] Local data storage only
- [x] No external API calls
- [x] User data encrypted at rest (OS-level)
- [x] Secure database location

### Application Security
- [x] Context isolation enabled
- [x] Node integration disabled
- [x] Parameterized queries
- [x] Input validation
- [x] Error handling without information disclosure

### Code Quality
- [x] No hardcoded secrets
- [x] Regular dependency updates
- [x] Security audit passing
- [x] Code review process

---

## 🚨 Incident Response

### If a Security Issue is Discovered:

1. **Assess Impact**: Determine severity and affected users
2. **Contain**: Disable affected features if necessary
3. **Fix**: Develop and test patch
4. **Deploy**: Release security update
5. **Notify**: Inform users if data was compromised
6. **Document**: Record incident and lessons learned

---

## 📞 Security Contact

For security issues, please contact:
- Email: security@pharmatech.com
- Do not open public issues for security vulnerabilities

---

## 📚 Additional Resources

- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-30  
**Next Review:** 2026-09-30