import React from 'react';
import { ShieldCheck, MapPin, Bus, Lightbulb, Cpu, Code, Radio, Clock, CalendarCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 pt-10">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-6">
          <Bus className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">{t('aboutTitleText')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {t('aboutHeroSub1')}
          <span className="text-red-600 font-semibold">{t('aboutHeroSub2')}</span>
          {t('aboutHeroSub3')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MapPin className="h-32 w-32" />
          </div>
          <div className="flex items-center gap-4 mb-6">
            <ShieldCheck className="h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">{t('whatIsTitle')}</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-lg relative z-10">
            {t('projectOverviewText')}
          </p>
        </div>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900">{t('coreFeaturesTitle')}</h2>
        <p className="text-gray-500 mt-2">{t('coreFeaturesSub')}</p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 hover:shadow-lg transition-shadow">
          <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Radio className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feat1Title')}</h3>
          <p className="text-gray-600 leading-relaxed">
            {t('feat1Desc')}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-3xl p-8 border border-green-100 hover:shadow-lg transition-shadow">
          <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Clock className="h-7 w-7 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feat2Title')}</h3>
          <p className="text-gray-600 leading-relaxed">
            {t('feat2Desc')}
          </p>
        </div>

        <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100 hover:shadow-lg transition-shadow">
          <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <CalendarCheck className="h-7 w-7 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feat3Title')}</h3>
          <p className="text-gray-600 leading-relaxed">
            {t('feat3Desc')}
          </p>
        </div>

        <div className="bg-red-50 rounded-3xl p-8 border border-red-100 hover:shadow-lg transition-shadow">
          <div className="bg-red-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Code className="h-7 w-7 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('feat4Title')}</h3>
          <p className="text-gray-600 leading-relaxed">
            {t('feat4Desc')}
          </p>
        </div>
      </div>

    </div>
  );
}
