import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import '../Inventory/CategoryManagement.css';

function CustomerList() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      alert(t('inventory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('customers.deleteConfirm'))) return;

    try {
      await window.electronAPI.deleteCustomer(id);
      loadCustomers();
      alert(t('customers.customerDeleted'));
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(t('inventory.errorSaving'));
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="category-management">
      <div className="page-header">
        <h1>{t('customers.title')}</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/customers/add')}
        >
          {t('customers.addCustomer')}
        </button>
      </div>

      <div className="categories-grid">
        {customers.length === 0 ? (
          <div className="no-data">{t('common.noData')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('customers.customerName')}</th>
                <th>{t('customers.phone')}</th>
                <th>{t('customers.customerType')}</th>
                <th>{t('customers.discountPercentage')}</th>
                <th>{t('customers.currentBalance')}</th>
                <th>{t('customers.totalSales')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{language === 'ar' ? customer.name_ar : customer.name_en}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.customer_type === 'retail' ? t('customers.retail') : t('customers.wholesale')}</td>
                  <td>{customer.discount_percentage}%</td>
                  <td>{customer.current_balance?.toFixed(2) || '0.00'}</td>
                  <td>{customer.total_sales || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        {t('common.view')}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/customers/edit/${customer.id}`)}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(customer.id)}
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

export default CustomerList;