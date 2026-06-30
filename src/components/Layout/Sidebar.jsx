import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

function Sidebar() {
  const { t } = useLanguage();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: t('navigation.home'), icon: '🏠' },
    { path: '/inventory', label: t('navigation.inventory'), icon: '📦' },
    { path: '/purchases', label: t('navigation.purchases'), icon: '🛒' },
    { path: '/sales', label: t('navigation.sales'), icon: '💰' },
    { path: '/payments', label: t('navigation.payments'), icon: '💳' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">💊</span>
          <span className="logo-text">PharmaTech 👨‍💻</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

// Made with Bob
