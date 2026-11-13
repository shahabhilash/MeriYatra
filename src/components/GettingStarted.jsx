import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Radio, Share2, Route, Languages, Map as MapIcon, Navigation, ArrowRight, X, Car } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// First-visit guide: explains the three-step flow and turns every feature into a clickable tile,
// so a new visitor can understand and try the whole site without reading any docs.
export default function GettingStarted({ onTrackFocus, onRouteFocus, onShowNearby, onShowMap, onHide }) {
  const { t, toggleLanguage, language } = useLanguage();

  const steps = [
    { icon: Search, title: t('howStep1Title'), desc: t('howStep1Desc') },
    { icon: MapPin, title: t('howStep2Title'), desc: t('howStep2Desc') },
    { icon: Clock, title: t('howStep3Title'), desc: t('howStep3Desc') },
  ];

  const features = [
    { icon: Navigation, title: t('featTrackTitle'), desc: t('featTrackDesc'), cta: t('featTrackCta'), onClick: onTrackFocus },
    { icon: Radio, title: t('featNearbyTitle'), desc: t('featNearbyDesc'), cta: t('featNearbyCta'), onClick: onShowNearby },
    { icon: Route, title: t('featPlanTitle'), desc: t('featPlanDesc'), cta: t('featPlanCta'), onClick: onRouteFocus },
    { icon: MapIcon, title: t('featMapTitle'), desc: t('featMapDesc'), cta: t('featMapCta'), onClick: onShowMap },
    { icon: Share2, title: t('featShareTitle'), desc: t('featShareDesc'), cta: t('featShareCta'), onClick: onTrackFocus },
    { icon: Search, title: t('featRoutesTitle'), desc: t('featRoutesDesc'), cta: t('featRoutesCta'), to: '/routes' },
    {
      icon: Languages,
      title: t('featLangTitle'),
      desc: t('featLangDesc'),
      cta: language === 'en' ? 'हिंदी में देखें' : 'View in English',
      onClick: toggleLanguage,
    },
  ];

  const tileClass =
    'group text-left glass-panel p-4 sm:p-5 flex flex-row sm:flex-col gap-3 sm:gap-0 h-full hover:-translate-y-0.5 hover:shadow-lg hover:border-red-200 transition-all duration-200';

  return (
    <section className="mb-14" aria-labelledby="how-it-works">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">{t('guideEyebrow')}</p>
          <h2 id="how-it-works" className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {t('howTitle')}
          </h2>
        </div>
        <button
          onClick={onHide}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 bg-white/70 hover:bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" /> {t('hideGuide')}
        </button>
      </div>

      {/* 3 steps */}
      <ol className="grid gap-3 md:gap-4 md:grid-cols-3 mb-10">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <li key={title} className="relative glass-panel p-4 md:p-5 flex gap-4 items-start">
            <div className="shrink-0 flex flex-col items-center">
              <span className="h-9 w-9 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center shadow-sm shadow-red-200">
                {i + 1}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Icon className="h-4 w-4 text-red-600 shrink-0" /> {title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Feature tiles */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{t('featGridTitle')}</h3>
      <p className="text-sm text-gray-500 mb-4">{t('featGridSub')}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, desc, cta, onClick, to }) => {
          const body = (
            <>
              <div className="bg-red-50 text-red-600 w-10 h-10 shrink-0 rounded-lg flex items-center justify-center sm:mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex flex-col flex-grow">
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed flex-grow">{desc}</p>
                <span className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-sm font-bold text-red-600 group-hover:gap-2 transition-all">
                  {cta} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </>
          );
          return to ? (
            <Link key={title} to={to} className={tileClass}>
              {body}
            </Link>
          ) : (
            <button key={title} type="button" onClick={onClick} className={tileClass}>
              {body}
            </button>
          );
        })}

        {/* Driver call-to-action fills the last grid cell */}
        <Link
          to="/login"
          className="group text-left rounded-2xl p-4 sm:p-5 flex flex-row sm:flex-col gap-3 sm:gap-0 h-full bg-red-600 text-white shadow-md shadow-red-200 hover:bg-red-700 transition-colors"
        >
          <div className="bg-white/15 w-10 h-10 shrink-0 rounded-lg flex items-center justify-center sm:mb-3">
            <Car className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex flex-col flex-grow">
            <h4 className="font-bold">{t('featDriverTitle')}</h4>
            <p className="text-sm text-red-50 mt-1 leading-relaxed flex-grow">{t('featDriverDesc')}</p>
            <span className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all">
              {t('featDriverCta')} <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
