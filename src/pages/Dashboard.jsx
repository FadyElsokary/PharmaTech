import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function Dashboard() {
  const { t } = useLanguage();

  const modules = [
    {
      title: t('modules.inventory'),
      icon: '📦',
      description: 'إدارة المنتجات والمخزون',
      path: '/inventory',
      color: '#2563eb'
    },
    {
      title: t('modules.purchases'),
      icon: '🛒',
      description: 'إدارة المشتريات والموردين',
      path: '/purchases',
      color: '#10b981'
    },
    {
      title: t('modules.sales'),
      icon: '💰',
      description: 'إدارة المبيعات والعملاء',
      path: '/sales',
      color: '#f59e0b'
    },
    {
      title: t('modules.payments'),
      icon: '💳',
      description: 'إدارة المدفوعات والمقبوضات',
      path: '/payments',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{t('app.welcome')}</h1>
        <p className="dashboard-subtitle">{t('app.subtitle')}</p>
      </div>

      <div className="modules-grid">
        {modules.map((module, index) => (
          <Link
            key={index}
            to={module.path}
            className="module-card"
            style={{ '--module-color': module.color }}
          >
            <div className="module-icon">{module.icon}</div>
            <h3 className="module-title">{module.title}</h3>
            <p className="module-description">{module.description}</p>
          </Link>
        ))}
      </div>

      <style>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .module-card {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 2rem;
          text-decoration: none;
          transition: all 0.3s;
          box-shadow: var(--shadow);
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .module-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--module-color);
        }

        .module-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .module-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .module-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .dashboard-title {
            font-size: 2rem;
          }

          .modules-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;

// Made with Bob
