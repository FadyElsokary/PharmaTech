import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

function Header() {
  const { language, changeLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">💊 PharmaTech 👨‍💻</h1>
        <div className="header-actions">
          <button 
            className="btn btn-outline btn-sm" 
            onClick={toggleLanguage}
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

// Made with Bob
