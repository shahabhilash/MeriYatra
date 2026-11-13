import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-6">
        <MapPin className="h-10 w-10 text-red-600" />
      </div>
      <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">404</p>
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{t('notFoundTitle')}</h1>
      <p className="text-gray-600 mb-8">{t('notFoundDesc')}</p>
      <Link
        to="/"
        className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-red-200"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
