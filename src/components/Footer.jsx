import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3 items-start">
        <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
          <Logo size="sm" />
          <p className="text-sm text-gray-500 max-w-xs">{t('footerTagline')}</p>
        </div>

        <div className="flex flex-col items-center md:items-start gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t('footerExplore')}</h4>
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">{t('navDashboard')}</Link>
          <Link to="/routes" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">{t('navRoutes')}</Link>
          <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">{t('navAbout')}</Link>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-gray-500 md:text-right">
          <span>OpenStreetMap &middot; OSRM &middot; Supabase</span>
          <span>&copy; {year} मेरी yatra. {t('footerRights')}</span>
        </div>
      </div>
    </footer>
  );
}
