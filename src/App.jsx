import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/Inventory/InventoryList';
import AddProduct from './pages/Inventory/AddProduct';
import EditProduct from './pages/Inventory/EditProduct';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/add" element={<AddProduct />} />
            <Route path="/inventory/edit/:id" element={<EditProduct />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;

// Made with Bob
