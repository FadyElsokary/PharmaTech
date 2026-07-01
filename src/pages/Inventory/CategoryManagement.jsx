import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './CategoryManagement.css';

function CategoryManagement() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    parent_id: null,
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert(t('inventory.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.name_ar.trim()) newErrors.name_ar = t('inventory.requiredField');
    if (!formData.name_en.trim()) newErrors.name_en = t('inventory.requiredField');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingCategory) {
        await window.electronAPI.updateCategory(editingCategory.id, formData);
      } else {
        await window.electronAPI.createCategory(formData);
      }
      
      setShowModal(false);
      resetForm();
      loadCategories();
      alert(editingCategory ? t('inventory.productUpdated') : t('inventory.productAdded'));
    } catch (error) {
      console.error('Error saving category:', error);
      alert(t('inventory.errorSaving'));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name_ar: category.name_ar,
      name_en: category.name_en,
      parent_id: category.parent_id,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('inventory.deleteConfirm'))) return;

    try {
      await window.electronAPI.deleteCategory(id);
      loadCategories();
      alert(t('inventory.productDeleted'));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(t('inventory.errorSaving'));
    }
  };

  const resetForm = () => {
    setFormData({
      name_ar: '',
      name_en: '',
      parent_id: null,
      description: ''
    });
    setEditingCategory(null);
    setErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="category-management">
      <div className="page-header">
        <h1>{t('inventory.categoryManagement')}</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          {t('inventory.addCategory')}
        </button>
      </div>

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="no-data">{t('common.noData')}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{language === 'ar' ? t('inventory.category') + ' (عربي)' : t('inventory.category') + ' (Arabic)'}</th>
                <th>{language === 'ar' ? t('inventory.category') + ' (English)' : t('inventory.category') + ' (English)'}</th>
                <th>{t('inventory.parentCategory')}</th>
                <th>{t('inventory.productCount')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name_ar}</td>
                  <td>{category.name_en}</td>
                  <td>{category.parent_name_ar || category.parent_name_en || '-'}</td>
                  <td>{category.product_count}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(category)}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category.id)}
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? t('inventory.editCategory') : t('inventory.addCategory')}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('inventory.category')} (عربي) *</label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className={errors.name_ar ? 'error' : ''}
                />
                {errors.name_ar && <span className="error-message">{errors.name_ar}</span>}
              </div>

              <div className="form-group">
                <label>{t('inventory.category')} (English) *</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className={errors.name_en ? 'error' : ''}
                />
                {errors.name_en && <span className="error-message">{errors.name_en}</span>}
              </div>

              <div className="form-group">
                <label>{t('inventory.parentCategory')}</label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">{t('inventory.noParent')}</option>
                  {categories
                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'ar' ? cat.name_ar : cat.name_en}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('inventory.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManagement;