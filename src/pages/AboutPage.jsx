import React from 'react';
import { ShieldCheck, MapPin, Bus, Lightbulb, Cpu, Code } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 pt-10">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-6">
          <Bus className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">{t('aboutTitle')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t('aboutSubtitle1')} <span className="text-red-600 font-semibold">{t('aboutSubtitle2')}</span>.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MapPin className="h-32 w-32" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <ShieldCheck className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t('projectOverviewTitle')}</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg">
            {t('projectOverviewText')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
          <div className="bg-amber-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Cpu className="h-7 w-7 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('hardwareTitle')}</h3>
          <p className="text-gray-600 leading-relaxed">
            {t('hardwareText')}
          </p>
        </div>
        
        <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
          <div className="bg-red-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Code className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('technologyTitle')}</h3>
          <p className="text-gray-600 leading-relaxed">
            {t('technologyText')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200">
        <div className="inline-block p-4 bg-yellow-50 rounded-full mb-6">
          <Lightbulb className="h-10 w-10 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('futureScopeTitle')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          {t('futureScopeText')}
        </p>
      </div>
    </div>
  );
}
