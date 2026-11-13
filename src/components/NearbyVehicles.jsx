import React from 'react';
import { Bus, Car, Radio, Navigation } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { distanceKm, formatKm } from '../utils/geo';

// Lists every vehicle currently broadcasting, closest to the passenger first.
export default function NearbyVehicles({ activeVehicles = {}, passengerLocation, trackedVehicle, onTrack, now }) {
  const { t } = useLanguage();

  const vehicles = Object.values(activeVehicles)
    .map((v) => ({ ...v, km: distanceKm(passengerLocation, v) }))
    .sort((a, b) => {
      if (a.km == null && b.km == null) return a.id.localeCompare(b.id);
      if (a.km == null) return 1;
      if (b.km == null) return -1;
      return a.km - b.km;
    });

  return (
    <section className="mb-12">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-600" /> {t('nearbyTitle')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t('nearbySub')}</p>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="glass-panel py-8 px-6 text-center text-gray-500">{t('nearbyEmpty')}</div>
      ) : (
        <div className="glass-panel divide-y divide-gray-100 overflow-hidden">
          {vehicles.map((v) => {
            const isTracked = v.id === trackedVehicle;
            const seconds = Math.max(0, Math.round((now - v.localTimestamp) / 1000));
            const speedKmh = Math.round((v.speed || 0) * 3.6);
            return (
              <div
                key={v.id}
                className={`flex items-center gap-4 px-4 sm:px-5 py-4 transition-colors ${isTracked ? 'bg-red-50/70' : 'hover:bg-gray-50'}`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${isTracked ? 'bg-red-600 text-white' : 'bg-green-100 text-green-700'}`}>
                  {v.vehicleType === 'auto' || v.vehicleType === 'cab' ? <Car className="h-5 w-5" /> : <Bus className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-gray-900 uppercase truncate">{v.id}</span>
                    {v.vehicleType && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded capitalize">{v.vehicleType}</span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className="font-semibold text-gray-700">
                      {v.km != null ? t('kmAway', { d: formatKm(v.km) }) : t('distanceUnknown')}
                    </span>
                    <span>{speedKmh} km/h</span>
                    <span>{t('updatedAgo', { s: seconds })}</span>
                  </div>
                </div>
                <button
                  onClick={() => onTrack(v.id)}
                  disabled={isTracked}
                  className={`shrink-0 inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-lg transition-colors ${
                    isTracked
                      ? 'bg-red-100 text-red-700 cursor-default'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200'
                  }`}
                >
                  <Navigation className="h-4 w-4" />
                  <span className="hidden sm:inline">{isTracked ? t('trackingBtn') : t('trackBtn')}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
