# PharmaTech - Setup Instructions

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your macOS system:

### Required Software

1. **Node.js** (version 18.x or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (version 9.x or higher)
   - Comes with Node.js
   - Verify installation: `npm --version`

3. **Xcode Command Line Tools** (for Better-SQLite3 compilation)
   ```bash
   xcode-select --install
   ```

---

## 🚀 Installation Steps

### Step 1: Navigate to Project Directory

```bash
cd /Users/fadyelsokary/Desktop/Fady_Elsokary_Mac/Mine/PharmaTech
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- Electron
- React and React DOM
- React Router
- Better-SQLite3
- Vite
- i18next
- And all development dependencies

**Note:** The installation may take 5-10 minutes depending on your internet connection.

### Step 3: Verify Installation

Check that all dependencies are installed:

```bash
npm list --depth=0
```

You should see all packages listed in `package.json`.

---

## 🏃 Running the Application

### Development Mode

To run the application in development mode with hot reload:

```bash
npm run electron:dev
```

This command will:
1. Start the Vite development server on port 5173
2. Wait for the server to be ready
3. Launch the Electron application
4. Open DevTools automatically

**First Launch:** The application will create a SQLite database at:
```
~/Library/Application Support/PharmaTech/pharmatech.db
```

### Production Build

To build the application for distribution:

```bash
# Build for macOS
npm run electron:build

# The output will be in the 'release' directory
```

---

## 🧪 Testing the Application

### 1. Test Language Switching

- Click the language button in the header
- Verify the interface switches between Arabic and English
- Check that RTL layout works correctly for Arabic

### 2. Test Inventory Module

1. Navigate to "إدارة المخزون" (Inventory Management)
2. Click "إضافة منتج جديد" (Add New Product)
3. Fill in the form with test data:
   - Product Name (Arabic): دواء تجريبي
   - Product Name (English): Test Medicine
   - Category: Select any
   - Unit Type: قطعة
   - Reorder Level: 10
4. Click "حفظ" (Save)
5. Verify the product appears in the list

### 3. Test Search Functionality

1. In the inventory list, use the search bar
2. Type part of a product name
3. Verify results are filtered correctly

### 4. Test Edit and Delete

1. Click "تعديل" (Edit) on a product
2. Modify some fields
3. Save and verify changes
4. Click "حذف" (Delete) on a product
5. Confirm deletion

---

## 🐛 Troubleshooting

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and try again
rm -rf node_modules
npm install
```

### Issue: Better-SQLite3 compilation fails

**Solution:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Rebuild Better-SQLite3
npm rebuild better-sqlite3
```

### Issue: Port 5173 is already in use

**Solution:**
```bash
# Find and kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.js
```

### Issue: Electron window doesn't open

**Solution:**
1. Check the terminal for error messages
2. Ensure Vite dev server started successfully
3. Try running `npm run dev` separately first
4. Check if port 5173 is accessible: `curl http://localhost:5173`

### Issue: Database errors

**Solution:**
```bash
# Delete the database and let it recreate
rm ~/Library/Application\ Support/PharmaTech/pharmatech.db

# Restart the application
npm run electron:dev
```

### Issue: Arabic text not displaying correctly

**Solution:**
1. Verify the HTML has `lang="ar"` and `dir="rtl"`
2. Check browser/Electron console for font loading errors
3. Ensure the CSS file is loaded correctly

---

## 📁 Project Structure

```
PharmaTech/
├── electron/                    # Electron main process
│   ├── main.js                 # Main entry point
│   ├── preload.js              # IPC bridge
│   └── database/
│       └── db.js               # Database manager
├── src/                        # React application
│   ├── App.jsx                 # Root component
│   ├── main.jsx               # React entry point
│   ├── components/
│   │   └── Layout/            # Layout components
│   ├── pages/
│   │   ├── Dashboard.jsx      # Welcome page
│   │   └── Inventory/         # Inventory module
│   ├── context/
│   │   └── LanguageContext.jsx # Language management
│   ├── i18n/                  # Translations
│   │   ├── ar.json
│   │   └── en.json
│   └── styles/
│       └── global.css         # Global styles
├── public/                    # Static assets
├── package.json              # Dependencies
├── vite.config.js           # Vite configuration
└── index.html               # HTML template
```

---

## 🔧 Development Workflow

### Making Changes

1. **Edit React Components:**
   - Changes will hot-reload automatically
   - Check the browser console for errors

2. **Edit Electron Main Process:**
   - Restart the application to see changes
   - Press `Ctrl+C` to stop, then run `npm run electron:dev` again

3. **Edit Database Schema:**
   - Delete the database file
   - Restart the application to recreate with new schema

### Adding New Features

1. Create new components in `src/components/`
2. Create new pages in `src/pages/`
3. Add routes in `src/App.jsx`
4. Add translations in `src/i18n/ar.json` and `src/i18n/en.json`
5. Add database operations in `electron/database/db.js`
6. Add IPC handlers in `electron/main.js`
7. Expose IPC methods in `electron/preload.js`

---

## 📊 Database Management

### Viewing the Database

Use DB Browser for SQLite:
```bash
# Install via Homebrew
brew install --cask db-browser-for-sqlite

# Open the database
open ~/Library/Application\ Support/PharmaTech/pharmatech.db
```

### Database Location

- **macOS:** `~/Library/Application Support/PharmaTech/pharmatech.db`
- **Windows:** `%APPDATA%/PharmaTech/pharmatech.db`

### Backup Database

```bash
# Create backup
cp ~/Library/Application\ Support/PharmaTech/pharmatech.db ~/Desktop/pharmatech-backup.db

# Restore backup
cp ~/Desktop/pharmatech-backup.db ~/Library/Application\ Support/PharmaTech/pharmatech.db
```

---

## 🎨 Customization

### Changing Colors

Edit `src/styles/global.css`:

```css
:root {
  --primary-color: #2563eb;  /* Change this */
  --success-color: #10b981;
  --danger-color: #ef4444;
  /* ... other colors */
}
```

### Adding New Languages

1. Create new translation file: `src/i18n/fr.json`
2. Update `src/context/LanguageContext.jsx` to include the new language
3. Add language switcher option in Header component

---

## 📦 Building for Distribution

### macOS

```bash
npm run electron:build
```

Output: `release/PharmaTech-1.0.0.dmg`

### Windows (from macOS)

```bash
npm run electron:build:win
```

Output: `release/PharmaTech Setup 1.0.0.exe`

**Note:** Building for Windows from macOS requires Wine to be installed.

---

## 🔐 Security Notes

1. **Database:** Stored locally, no external access
2. **IPC:** Context isolation enabled, secure bridge
3. **Input Validation:** All forms validate input
4. **SQL Injection:** Prevented via parameterized queries
5. **XSS:** React automatically escapes content

---

## 📝 Next Steps

After successful setup:

1. ✅ Test all features thoroughly
2. ✅ Add more products to test with real data
3. ✅ Customize colors and branding
4. ✅ Add more modules (Purchases, Sales, Payments)
5. ✅ Implement reports and analytics
6. ✅ Add backup/restore functionality
7. ✅ Create user manual

---

## 🆘 Getting Help

If you encounter issues:

1. Check the console for error messages
2. Review the troubleshooting section above
3. Check the documentation files:
   - `TECHNICAL_PLAN.md`
   - `IMPLEMENTATION_GUIDE.md`
   - `ARCHITECTURE.md`
   - `SECURITY_BEST_PRACTICES.md`

---

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Node.js and npm installed
- [ ] All dependencies installed successfully
- [ ] Application launches without errors
- [ ] Database created successfully
- [ ] Can add, edit, and delete products
- [ ] Search functionality works
- [ ] Language switching works
- [ ] RTL layout displays correctly for Arabic
- [ ] No console errors

---

**Setup Complete!** 🎉

You're now ready to use PharmaTech. Enjoy managing your pharmacy inventory!