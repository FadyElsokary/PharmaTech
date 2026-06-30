import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

function EditProduct() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    barcode: '',
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    category_id: '',
    unit_type: '',
    reorder_level: 10,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [product, cats] = await Promise.all([
        window.electronAPI.getProduct(parseInt(id)),
        window.electronAPI.getCategories()
      ]);

      if (product) {
        setFormData({
          barcode: product.barcode || '',
          name_ar: product.name_ar || '',
          name_en: product.name_en || '',
          description_ar: product.description_ar || '',
          description_en: product.description_en || '',
          category_id: product.category_id || '',
          unit_type: product.unit_type || '',
          reorder_level: product.reorder_level || 10,
        });
      }
      setCategories(cats);
    } catch (err) {
      console.error('Error loading data:', err);
      alert(t('inventory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = t('inventory.requiredField');
    }

    if (!formData.name_en.trim()) {
      newErrors.name_en = t('inventory.requiredField');
    }

    if (!formData.unit_type.trim()) {
      newErrors.unit_type = t('inventory.requiredField');
    }

    if (formData.reorder_level < 0) {
      newErrors.reorder_level = t('inventory.invalidNumber');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const productData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        reorder_level: parseInt(formData.reorder_level) || 10,
      };

      await window.electronAPI.updateProduct(parseInt(id), productData);
      navigate('/inventory');
    } catch (err) {
      console.error('Error updating product:', err);
      alert(t('inventory.errorSaving'));
    } finally {
      setSaving(false);
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
    <div className="edit-product-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t('inventory.editProduct')}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('inventory.barcode')}</label>
            <input
              type="text"
              name="barcode"
              className="input"
              value={formData.barcode}
              onChange={handleChange}
              placeholder={t('inventory.enterBarcode')}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">{t('inventory.productName')} (عربي)</label>
            <input
              type="text"
              name="name_ar"
              className={`input ${errors.name_ar ? 'error' : ''}`}
              value={formData.name_ar}
              onChange={handleChange}
              placeholder={t('inventory.enterProductName')}
              required
            />
            {errors.name_ar && <div className="form-error">{errors.name_ar}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required">{t('inventory.productName')} (English)</label>
            <input
              type="text"
              name="name_en"
              className={`input ${errors.name_en ? 'error' : ''}`}
              value={formData.name_en}
              onChange={handleChange}
              placeholder="Enter Product Name"
              required
            />
            {errors.name_en && <div className="form-error">{errors.name_en}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('inventory.description')} (عربي)</label>
            <textarea
              name="description_ar"
              className="textarea"
              value={formData.description_ar}
              onChange={handleChange}
              placeholder={t('inventory.enterDescription')}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('inventory.description')} (English)</label>
            <textarea
              name="description_en"
              className="textarea"
              value={formData.description_en}
              onChange={handleChange}
              placeholder="Enter Description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('inventory.category')}</label>
            <select
              name="category_id"
              className="select"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">{t('inventory.selectCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_ar} - {cat.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">{t('inventory.unitType')}</label>
            <select
              name="unit_type"
              className={`select ${errors.unit_type ? 'error' : ''}`}
              value={formData.unit_type}
              onChange={handleChange}
              required
            >
              <option value="">اختر نوع الوحدة - Select Unit Type</option>
              <option value="قطعة">قطعة - Piece</option>
              <option value="علبة">علبة - Box</option>
              <option value="شريط">شريط - Strip</option>
              <option value="زجاجة">زجاجة - Bottle</option>
              <option value="أنبوب">أنبوب - Tube</option>
            </select>
            {errors.unit_type && <div className="form-error">{errors.unit_type}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('inventory.reorderLevel')}</label>
            <input
              type="number"
              name="reorder_level"
              className={`input ${errors.reorder_level ? 'error' : ''}`}
              value={formData.reorder_level}
              onChange={handleChange}
              min="0"
            />
            {errors.reorder_level && <div className="form-error">{errors.reorder_level}</div>}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/inventory')}
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

export default EditProduct;

// Made with Bob
