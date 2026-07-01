import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import '../Inventory/CategoryManagement.css';

function SupplierList() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      alert(t('suppliers.errorLoading') || t('inventory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('suppliers.deleteConfirm'))) return;

    try {
      await window.electronAPI.deleteSupplier(id);
      loadSuppliers();
      alert(t('suppliers.supplierDeleted'));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert(t('inventory.errorSaving'));
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="category-management">
      <div className="page-header">
        <h1>{t('suppliers.title')}</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/suppliers/add')}
        >
          {t('suppliers.addSupplier')}
        </button>
      </div>

      <div className="categories-grid">
        {suppliers.length === 0 ? (
          <div className="no-data">{t('common.noData')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('suppliers.supplierName')}</th>
                <th>{t('suppliers.contactPerson')}</th>
                <th>{t('suppliers.phone')}</th>
                <th>{t('suppliers.email')}</th>
                <th>{t('suppliers.outstandingBalance')}</th>
                <th>{t('suppliers.totalPurchases')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{language === 'ar' ? supplier.name_ar : supplier.name_en}</td>
                  <td>{supplier.contact_person || '-'}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td>{supplier.email || '-'}</td>
                  <td>{supplier.outstanding_balance?.toFixed(2) || '0.00'}</td>
                  <td>{supplier.total_purchases || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/suppliers/${supplier.id}`)}
                      >
                        {t('common.view')}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SupplierList;