# PharmaTech - Detailed Remaining Features Guide

## 📊 Status: 75% Complete | 25% Remaining

**Last Updated:** 2026-07-01 04:56 AM

---

## ✅ WHAT'S ALREADY DONE

### Backend (100% Complete)
- ✅ All 11 database tables
- ✅ 50+ database methods
- ✅ 50+ IPC handlers
- ✅ Complete API bridge
- ✅ Validation utilities
- ✅ 200+ translations (EN/AR)

### Frontend (25% Complete)
- ✅ CategoryManagement (full CRUD)
- ✅ SupplierList + AddSupplier
- ✅ CustomerList + AddCustomer
- ✅ Routing for above pages
- ✅ Reusable CSS with RTL

---

## 🚧 REMAINING FEATURES - DETAILED BREAKDOWN

### 📦 PHASE 1: Complete Supplier & Customer Modules (4 pages)
**Estimated Time:** 6-8 hours | **Difficulty:** Easy

#### 1.1 EditSupplier.jsx
**Location:** `src/pages/Purchases/EditSupplier.jsx`
**Copy From:** AddSupplier.jsx

**Changes Needed:**
```javascript
// Add these imports
import { useParams } from 'react-router-dom';

// In component
const { id } = useParams();

// Add useEffect to load data
useEffect(() => {
  loadSupplier();
}, [id]);

const loadSupplier = async () => {
  try {
    const data = await window.electronAPI.getSupplier(parseInt(id));
    setFormData({
      name_ar: data.name_ar,
      name_en: data.name_en,
      contact_person: data.contact_person || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      tax_number: data.tax_number || '',
      payment_terms: data.payment_terms || '',
      credit_limit: data.credit_limit || 0
    });
  } catch (error) {
    console.error('Error loading supplier:', error);
    alert(t('inventory.errorLoading'));
  }
};

// In handleSubmit, use updateSupplier instead of createSupplier
await window.electronAPI.updateSupplier(parseInt(id), formData);
alert(t('suppliers.supplierUpdated'));
```

**Route to Add:**
```javascript
<Route path="/suppliers/edit/:id" element={<EditSupplier />} />
```

---

#### 1.2 EditCustomer.jsx
**Location:** `src/pages/Sales/EditCustomer.jsx`
**Copy From:** AddCustomer.jsx

**Changes Needed:**
```javascript
// Same pattern as EditSupplier
const { id } = useParams();

useEffect(() => {
  loadCustomer();
}, [id]);

const loadCustomer = async () => {
  try {
    const data = await window.electronAPI.getCustomer(parseInt(id));
    setFormData({
      name_ar: data.name_ar,
      name_en: data.name_en,
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      customer_type: data.customer_type || 'retail',
      credit_limit: data.credit_limit || 0,
      discount_percentage: data.discount_percentage || 0
    });
  } catch (error) {
    console.error('Error loading customer:', error);
    alert(t('inventory.errorLoading'));
  }
};

// In handleSubmit
await window.electronAPI.updateCustomer(parseInt(id), formData);
alert(t('customers.customerUpdated'));
```

**Route to Add:**
```javascript
<Route path="/customers/edit/:id" element={<EditCustomer />} />
```

---

#### 1.3 SupplierDetails.jsx
**Location:** `src/pages/Purchases/SupplierDetails.jsx`

**Structure:**
```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import '../Inventory/CategoryManagement.css';

function SupplierDetails() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supplierData = await window.electronAPI.getSupplier(parseInt(id));
      const purchasesData = await window.electronAPI.getPurchases();
      
      setSupplier(supplierData);
      // Filter purchases for this supplier
      setPurchases(purchasesData.filter(p => p.supplier_id === parseInt(id)));
    } catch (error) {
      console.error('Error loading ', error);
      alert(t('inventory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{t('common.loading')}</div>;
  if (!supplier) return <div className="no-data">{t('common.noData')}</div>;

  return (
    <div className="category-management">
      <div className="page-header">
        <h1>{t('suppliers.supplierDetails')}</h1>
        <div>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/suppliers/edit/${id}`)}
          >
            {t('common.edit')}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/suppliers')}
            style={{ marginLeft: '10px' }}
          >
            {t('common.back')}
          </button>
        </div>
      </div>

      <div className="categories-grid">
        {/* Supplier Info Section */}
        <div style={{ marginBottom: '30px' }}>
          <h2>{t('suppliers.supplierName')}</h2>
          <div className="form-row">
            <div><strong>{t('suppliers.supplierName')} (عربي):</strong> {supplier.name_ar}</div>
            <div><strong>{t('suppliers.supplierName')} (English):</strong> {supplier.name_en}</div>
          </div>
          <div className="form-row">
            <div><strong>{t('suppliers.contactPerson')}:</strong> {supplier.contact_person || '-'}</div>
            <div><strong>{t('suppliers.phone')}:</strong> {supplier.phone || '-'}</div>
          </div>
          <div className="form-row">
            <div><strong>{t('suppliers.email')}:</strong> {supplier.email || '-'}</div>
            <div><strong>{t('suppliers.taxNumber')}:</strong> {supplier.tax_number || '-'}</div>
          </div>
          <div><strong>{t('suppliers.address')}:</strong> {supplier.address || '-'}</div>
          <div className="form-row">
            <div><strong>{t('suppliers.paymentTerms')}:</strong> {supplier.payment_terms || '-'}</div>
            <div><strong>{t('suppliers.creditLimit')}:</strong> {supplier.credit_limit?.toFixed(2) || '0.00'}</div>
          </div>
          <div><strong>{t('suppliers.outstandingBalance')}:</strong> {supplier.current_balance?.toFixed(2) || '0.00'}</div>
        </div>

        {/* Purchase History Section */}
        <h2>{t('purchases.title')}</h2>
        {purchases.length === 0 ? (
          <div className="no-data">{t('common.noData')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('purchases.invoiceNumber')}</th>
                <th>{t('purchases.purchaseDate')}</th>
                <th>{t('purchases.total')}</th>
                <th>{t('purchases.paidAmount')}</th>
                <th>{t('purchases.status')}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{purchase.invoice_number}</td>
                  <td>{purchase.purchase_date}</td>
                  <td>{purchase.total_amount?.toFixed(2)}</td>
                  <td>{purchase.paid_amount?.toFixed(2)}</td>
                  <td>{purchase.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SupplierDetails;
```

**Route to Add:**
```javascript
<Route path="/suppliers/:id" element={<SupplierDetails />} />
```

---

#### 1.4 CustomerDetails.jsx
**Location:** `src/pages/Sales/CustomerDetails.jsx`

**Similar to SupplierDetails but:**
- Load customer data
- Show sales history instead of purchases
- Display customer type, discount percentage

**Route to Add:**
```javascript
<Route path="/customers/:id" element={<CustomerDetails />} />
```

---

### 📦 PHASE 2: Inventory Enhancement (2 pages)
**Estimated Time:** 4-6 hours | **Difficulty:** Easy-Medium

#### 2.1 ProductDetails.jsx
**Location:** `src/pages/Inventory/ProductDetails.jsx`

**Key Features:**
- Display product info (name, barcode, category, etc.)
- Show inventory by batch in a table
- Display transaction history
- Edit and Delete buttons

**API Calls:**
```javascript
const product = await window.electronAPI.getProduct(parseInt(id));
const inventory = await window.electronAPI.getInventoryByProduct(parseInt(id));
const transactions = await window.electronAPI.getInventoryTransactions(parseInt(id));
```

**Route to Add:**
```javascript
<Route path="/inventory/product/:id" element={<ProductDetails />} />
```

---

#### 2.2 StockAdjustment.jsx
**Location:** `src/pages/Inventory/StockAdjustment.jsx`

**Form Fields:**
- Product selector (dropdown)
- Current quantity (display only)
- Adjustment quantity (number input, can be negative)
- Adjustment type (dropdown: damage, theft, correction, expired)
- Reason (textarea)

**API Calls:**
```javascript
const products = await window.electronAPI.getProducts();

await window.electronAPI.adjustStock(productId, {
  quantity: adjustmentQuantity, // can be positive or negative
  type: adjustmentType,
  notes: reason
});
```

**Route to Add:**
```javascript
<Route path="/inventory/adjust-stock" element={<StockAdjustment />} />
```

---

### 📦 PHASE 3: Purchase Management (4 pages)
**Estimated Time:** 10-14 hours | **Difficulty:** Medium-Hard

#### 3.1 PurchaseList.jsx
**Location:** `src/pages/Purchases/PurchaseList.jsx`

**Copy From:** SupplierList.jsx pattern

**Table Columns:**
- Invoice Number
- Date
- Supplier Name
- Total Amount
- Paid Amount
- Remaining
- Status
- Actions (View, Receive if pending, Record Payment)

**API Call:**
```javascript
const purchases = await window.electronAPI.getPurchases();
```

**Route to Add:**
```javascript
<Route path="/purchases" element={<PurchaseList />} />
```

---

#### 3.2 CreatePurchase.jsx ⭐ COMPLEX
**Location:** `src/pages/Purchases/CreatePurchase.jsx`

**This is a multi-item form - most complex page so far**

**State Structure:**
```javascript
const [formData, setFormData] = useState({
  supplier_id: '',
  purchase_date: new Date().toISOString().split('T')[0],
  invoice_number: '',
  discount: 0,
  tax: 0,
  notes: ''
});

const [items, setItems] = useState([
  {
    product_id: '',
    quantity: 1,
    unit_price: 0,
    discount: 0,
    batch_number: '',
    expiry_date: '',
    manufacture_date: ''
  }
]);
```

**Key Functions:**
```javascript
// Add new item row
const addItem = () => {
  setItems([...items, {
    product_id: '',
    quantity: 1,
    unit_price: 0,
    discount: 0,
    batch_number: '',
    expiry_date: '',
    manufacture_date: ''
  }]);
};

// Remove item row
const removeItem = (index) => {
  setItems(items.filter((_, i) => i !== index));
};

// Update item
const updateItem = (index, field, value) => {
  const newItems = [...items];
  newItems[index][field] = value;
  setItems(newItems);
};

// Calculate totals
const calculateTotals = () => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = (item.quantity * item.unit_price) - item.discount;
    return sum + itemTotal;
  }, 0);
  
  const total = subtotal - formData.discount + formData.tax;
  
  return { subtotal, total };
};

// Submit
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const { subtotal, total } = calculateTotals();
  
  const purchaseData = {
    ...formData,
    subtotal,
    total_amount: total,
    status: 'pending'
  };
  
  const itemsData = items.map(item => ({
    ...item,
    total_price: (item.quantity * item.unit_price) - item.discount
  }));
  
  await window.electronAPI.createPurchase(purchaseData, itemsData);
  alert(t('purchases.purchaseCreated'));
  navigate('/purchases');
};
```

**Route to Add:**
```javascript
<Route path="/purchases/new" element={<CreatePurchase />} />
```

---

#### 3.3 PurchaseDetails.jsx
**Location:** `src/pages/Purchases/PurchaseDetails.jsx`

**Similar to SupplierDetails but:**
- Show purchase header (supplier, date, invoice, totals)
- Show items table
- Show payment status
- Actions: Receive Stock button, Record Payment button

**Route to Add:**
```javascript
<Route path="/purchases/:id" element={<PurchaseDetails />} />
```

---

#### 3.4 ReceiveStock.jsx
**Location:** `src/pages/Purchases/ReceiveStock.jsx`

**Features:**
- Load purchase items
- Show table with product, ordered quantity
- Allow editing batch numbers and expiry dates
- Confirm button to receive

**API Call:**
```javascript
await window.electronAPI.receivePurchase(purchaseId, itemsWithBatchInfo);
```

**Route to Add:**
```javascript
<Route path="/purchases/:id/receive" element={<ReceiveStock />} />
```

---

### 📦 PHASE 4