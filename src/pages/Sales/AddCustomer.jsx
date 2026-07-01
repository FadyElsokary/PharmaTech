import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import '../Inventory/CategoryManagement.css';

function AddCustomer() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    phone: '',
    email: '',
    address: '',
    customer_type: 'retail',
    credit_limit: 0,
    discount_percentage: 0
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.name_ar.trim()) newErrors.name_ar = t('inventory.requiredField');
    if (!formData.name_en.trim()) newErrors.name_en = t('inventory.requiredField');
    if (!formData.phone.trim()) newErrors.phone = t('inventory.requiredField');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      await window.electronAPI.createCustomer(formData);
      alert(t('customers.customerAdded'));
      navigate('/customers');
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(t('inventory.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="category-management">
      <div className="page-header">
        <h1>{t('customers.addCustomer')}</h1>
      </div>

      <div className="categories-grid">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{t('customers.customerName')} (عربي) *</label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => handleChange('name_ar', e.target.value)}
                className={errors.name_ar ? 'error' : ''}
              />
              {errors.name_ar && <span className="error-message">{errors.name_ar}</span>}
            </div>

            <div className="form-group">
              <label>{t('customers.customerName')} (English) *</label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => handleChange('name_en', e.target.value)}
                className={errors.name_en ? 'error' : ''}
              />
              {errors.name_en && <span className="error-message">{errors.name_en}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('customers.phone')} *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>{t('customers.email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('customers.address')}</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('customers.customerType')}</label>
              <select
                value={formData.customer_type}
                onChange={(e) => handleChange('customer_type', e.target.value)}
              >
                <option value="retail">{t('customers.retail')}</option>
                <option value="wholesale">{t('customers.wholesale')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('customers.discountPercentage')}</label>
              <input
                type="number"
                value={formData.discount_percentage}
                onChange={(e) => handleChange('discount_percentage', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('customers.creditLimit')}</label>
            <input
              type="number"
              value={formData.credit_limit}
              onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/customers')}
              disabled={saving}
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomer;