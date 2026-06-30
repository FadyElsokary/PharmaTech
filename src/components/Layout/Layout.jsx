import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout({ children }) {
  const { direction } = useLanguage();

  return (
    <div className="app-container" dir={direction}>
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

// Made with Bob
