import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

function InventoryList() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.electronAPI.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(t('inventory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    try {
      if (term.trim()) {
        const data = await window.electronAPI.searchProducts(term);
        setProducts(data);
      } else {
        loadProducts();
      }
    } catch (err) {
      console.error('Error searching products:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('inventory.deleteConfirm'))) {
      try {
        await window.electronAPI.deleteProduct(id);
        loadProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert(t('inventory.errorSaving'));
      }
    }
  };

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity === 0) {
      return { label: t('inventory.outOfStock'), class: 'badge-danger' };
    } else if (quantity <= reorderLevel) {
      return { label: t('inventory.lowStock'), class: 'badge-warning' };
    } else {
      return { label: t('inventory.inStock'), class: 'badge-success' };
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t('inventory.title')}</h2>
          <Link to="/inventory/add" className="btn btn-primary">
            {t('inventory.addProduct')}
          </Link>
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="input search-input"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>{t('common.noData')}</p>
            <Link to="/inventory/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              {t('inventory.addProduct')}
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('inventory.barcode')}</th>
                  <th>{t('inventory.productName')}</th>
                  <th>{t('inventory.category')}</th>
                  <th>{t('inventory.quantity')}</th>
                  <th>{t('inventory.unitType')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = getStockStatus(product.total_quantity, product.reorder_level);
                  return (
                    <tr key={product.id}>
                      <td>{product.barcode || '-'}</td>
                      <td>
                        <strong>
                          {language === 'ar' ? product.name_ar : product.name_en}
                        </strong>
                      </td>
                      <td>
                        {product.category_name_ar && product.category_name_en
                          ? language === 'ar'
                            ? product.category_name_ar
                            : product.category_name_en
                          : '-'}
                      </td>
                      <td>
                        <span className={`badge ${status.class}`}>
                          {product.total_quantity} - {status.label}
                        </span>
                      </td>
                      <td>{product.unit_type}</td>
                      <td>
                        <div className="flex gap-1">
                          <Link
                            to={`/inventory/edit/${product.id}`}
                            className="btn btn-sm btn-secondary"
                          >
                            {t('common.edit')}
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn btn-sm btn-danger"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="card-footer" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <p className="text-secondary">
            {t('inventory.totalProducts')}: <strong>{products.length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default InventoryList;

// Made with Bob
