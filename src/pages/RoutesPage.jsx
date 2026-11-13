import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, MapPin, Search, X, Navigation } from 'lucide-react';
import { useBuses } from '../hooks/useBuses';
import { useLanguage } from '../context/LanguageContext';

export default function RoutesPage() {
  const { t } = useLanguage();
  const { routes, loading, error } = useBuses();
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.trim().toLowerCase();
  const filteredRoutes = routes.filter(
    (route) =>
      !q ||
      route.name.toLowerCase().includes(q) ||
      route.stops.some((stop) => stop.toLowerCase().includes(q)) ||
      route.busesAssigned.some((bus) => bus.toLowerCase().includes(q))
  );

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500 font-medium">{t('loadingRoutes')}</div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-red-500 font-medium">
        {t('errorLoadingRoutes')} {error}
      </div>
    );
  }

  const highlight = (text) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q);
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-amber-100 text-gray-900 rounded px-0.5">{text.slice(i, i + q.length)}</mark>
        {text.slice(i + q.length)}
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{t('routesPageTitle')}</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">{t('routesPageSubtitle')}</p>

        {/* Global Route Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('routesSearchPlaceholder')}
            className="w-full pl-12 pr-12 py-4 rounded-2xl font-medium text-lg border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all bg-white text-gray-900 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label={t('clearLabel')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {filteredRoutes.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-6 bg-white rounded-full mb-4 shadow-sm">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noRoutesFound')}</h3>
          <p className="text-gray-500">{t('noRoutesDesc', { q: searchQuery })}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="glass-panel p-6 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="bg-amber-100 p-3 rounded-xl shrink-0">
                  <Map className="h-6 w-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900">{highlight(route.name)}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {route.id}
                    </span>
                    <span className="text-xs font-medium text-gray-500">{t('stopsCount', { n: route.stops.length })}</span>
                  </div>
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">{t('stopsLabel')}</h3>
                <ol className="relative">
                  {route.stops.map((stop, idx) => {
                    const isEnd = idx === 0 || idx === route.stops.length - 1;
                    return (
                      <li key={idx} className="relative flex items-center gap-3 pb-3 last:pb-0">
                        {idx < route.stops.length - 1 && (
                          <span className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-amber-200" aria-hidden="true" />
                        )}
                        <div
                          className={`relative z-10 p-1 rounded-full border-2 shadow-sm ${
                            isEnd ? 'bg-amber-500 border-amber-500' : 'bg-white border-amber-200'
                          }`}
                        >
                          <MapPin className={`h-3 w-3 ${isEnd ? 'text-white' : 'text-amber-500'}`} />
                        </div>
                        <span className={`text-base text-gray-800 ${isEnd ? 'font-bold' : 'font-medium'}`}>{highlight(stop)}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-2">
                  {t('assignedRidesLabel')} <span className="text-gray-400">&middot; {t('trackVehicleHint')}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {route.busesAssigned.map((bus) => (
                    <Link
                      key={bus}
                      to={`/?track=${encodeURIComponent(bus)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-full transition-colors"
                    >
                      <Navigation className="h-3 w-3" />
                      {highlight(bus)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
