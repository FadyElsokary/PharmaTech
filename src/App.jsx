import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';

// Inventory Pages
import InventoryList from './pages/Inventory/InventoryList';
import AddProduct from './pages/Inventory/AddProduct';
import EditProduct from './pages/Inventory/EditProduct';
import CategoryManagement from './pages/Inventory/CategoryManagement';

// Supplier & Purchase Pages
import SupplierList from './pages/Purchases/SupplierList';
import AddSupplier from './pages/Purchases/AddSupplier';

// Customer & Sales Pages
import CustomerList from './pages/Sales/CustomerList';
import AddCustomer from './pages/Sales/AddCustomer';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Inventory Routes */}
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/add" element={<AddProduct />} />
            <Route path="/inventory/edit/:id" element={<EditProduct />} />
            <Route path="/inventory/categories" element={<CategoryManagement />} />
            
            {/* Supplier Routes */}
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/add" element={<AddSupplier />} />
            
            {/* Customer Routes */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/add" element={<AddCustomer />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;
