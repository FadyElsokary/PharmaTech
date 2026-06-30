import React, { createContext, useState, useContext, useEffect } from 'react';
import arTranslations from '../i18n/ar.json';
import enTranslations from '../i18n/en.json';

const LanguageContext = createContext();

const translations = {
  ar: arTranslations,
  en: enTranslations,
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ar');
  const [direction, setDirection] = useState('rtl');

  useEffect(() => {
    // Load saved language preference
    if (window.electronAPI) {
      window.electronAPI.getSetting('language').then((savedLang) => {
        if (savedLang) {
          changeLanguage(savedLang);
        }
      }).catch(err => {
        console.error('Error loading language setting:', err);
      });
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    setDirection(dir);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    
    // Save preference
    if (window.electronAPI) {
      window.electronAPI.setSetting('language', lang).catch(err => {
        console.error('Error saving language setting:', err);
      });
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Made with Bob
