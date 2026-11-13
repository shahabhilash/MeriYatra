import React, { useEffect, useRef, forwardRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Pill-shaped label for a live GPS vehicle. Tracked vehicle is drawn in brand orange.
// Icons are cached so markers are not rebuilt on every GPS tick.
const iconCache = new Map();
const vehicleIcon = (id, highlighted) => {
  const key = `${id}|${highlighted}`;
  if (!iconCache.has(key)) iconCache.set(key, buildVehicleIcon(id, highlighted));
  return iconCache.get(key);
};

const buildVehicleIcon = (id, highlighted) => {
  const bg = highlighted ? '#E9631A' : '#ffffff';
  const fg = highlighted ? '#ffffff' : '#15803d';
  const border = highlighted ? '#c85213' : '#bbf7d0';
  const dot = highlighted ? '#ffffff' : '#22c55e';
  const ring = highlighted ? '#fbece5' : '#4ade80';
  return L.divIcon({
    className: 'mv-marker',
    html: `
      <div style="transform: translate(-50%, -50%); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; background-color: ${bg}; padding: 4px 10px 4px 8px; border-radius: 9999px; box-shadow: 0 4px 10px -2px rgba(0,0,0,0.25); border: 1px solid ${border};">
        <span style="position: relative; display: flex; height: 10px; width: 10px;">
          <span style="animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: ${ring}; opacity: 0.75;"></span>
          <span style="position: relative; display: inline-flex; border-radius: 9999px; height: 10px; width: 10px; background-color: ${dot};"></span>
        </span>
        <span style="font-size: 11px; font-weight: 800; color: ${fg}; letter-spacing: 0.04em;">${escapeHtml(id)}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Round pin used for demo/static route vehicles
const staticBusIcon = (delayed) => (delayed ? delayedBusIcon : onTimeBusIcon);
const makeStaticBusIcon = (delayed) =>
  L.divIcon({
    className: 'mv-marker',
    html: `<div style="transform: translate(-50%, -100%); display:flex; flex-direction:column; align-items:center;">
      <div style="height: 22px; width: 22px; border-radius: 9999px; background: ${delayed ? '#dc2626' : '#2563eb'}; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3);"></div>
      <div style="width: 2px; height: 8px; background: ${delayed ? '#dc2626' : '#2563eb'};"></div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

const onTimeBusIcon = makeStaticBusIcon(false);
const delayedBusIcon = makeStaticBusIcon(true);

const passengerIcon = L.divIcon({
  className: 'mv-marker',
  html: `<div style="transform: translate(-50%, -50%); height: 18px; width: 18px; background-color: #3b82f6; border: 3px solid white; border-radius: 9999px; box-shadow: 0 0 0 6px rgba(59,130,246,0.2), 0 4px 6px -1px rgba(0,0,0,0.2);"></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

const destinationIcon = L.divIcon({
  className: 'mv-marker',
  html: `<div style="transform: translate(-50%, -100%);">
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 1C7.3 1 1 7.1 1 14.7 1 25 15 39 15 39s14-14 14-24.3C29 7.1 22.7 1 15 1z" fill="#752d07" stroke="white" stroke-width="2"/>
      <circle cx="15" cy="14.5" r="5" fill="white"/>
    </svg>
  </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// Keeps the camera on what matters without fighting the user's zoom on every GPS tick.
function CameraController({ passengerLocation, trackedVehicle, trackedLocation, focusPoint, recenterTick }) {
  const map = useMap();
  const centeredOnPassenger = useRef(false);
  const lastTrackedId = useRef(null);

  // First passenger fix: center once
  useEffect(() => {
    if (!trackedVehicle && passengerLocation && !centeredOnPassenger.current) {
      centeredOnPassenger.current = true;
      map.flyTo([passengerLocation.lat, passengerLocation.lng], 14, { animate: true });
    }
  }, [passengerLocation, trackedVehicle, map]);

  // Tracked vehicle: fly in when it changes, then follow smoothly at the user's zoom
  useEffect(() => {
    if (!trackedVehicle) {
      lastTrackedId.current = null;
      return;
    }
    if (!trackedLocation?.lat) return;
    if (lastTrackedId.current !== trackedVehicle) {
      lastTrackedId.current = trackedVehicle;
      map.flyTo([trackedLocation.lat, trackedLocation.lng], 16, { animate: true });
    } else {
      map.panTo([trackedLocation.lat, trackedLocation.lng], { animate: true });
    }
  }, [trackedVehicle, trackedLocation?.lat, trackedLocation?.lng, map]);

  // Explicit focus requests (e.g. "View on map")
  useEffect(() => {
    if (focusPoint?.lat) map.flyTo([focusPoint.lat, focusPoint.lng], 16, { animate: true });
  }, [focusPoint, map]);

  // "My location" button
  useEffect(() => {
    if (recenterTick && passengerLocation) {
      map.flyTo([passengerLocation.lat, passengerLocation.lng], 15, { animate: true });
    }
  }, [recenterTick]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

const LiveMap = forwardRef(function LiveMap(
  {
    buses = [],
    activeVehicles = {},
    passengerLocation = null,
    trackedVehicle = null,
    destination = null,
    focusPoint = null,
    onTrack,
    onLocateMe,
    recenterTick = 0,
  },
  ref
) {
  const { t } = useLanguage();
  // Center roughly around VIT Bhopal
  const defaultCenter = [23.0775, 76.8513];
  const liveCount = Object.keys(activeVehicles).length;

  return (
    <div className="mt-12 scroll-mt-24" ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{t('liveMapTitle')}</h2>
          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
            {t('liveCount', { n: liveCount })}
          </span>
        </div>
        <button
          onClick={onLocateMe}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-lg shadow-sm transition-colors"
        >
          <LocateFixed className="h-4 w-4 text-blue-600" /> {t('locateMe')}
        </button>
      </div>

      <p className="-mt-3 mb-3 text-sm text-gray-500">{t('mapHint')}</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-xs font-semibold text-gray-600" aria-label={t('legendTitle')}>
        <li className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow ring-4 ring-blue-500/20" /> {t('legendYou')}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-white border border-green-200 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" /> MP04
          </span>
          {t('legendLive')}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-red-600 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white">
            <span className="h-2 w-2 rounded-full bg-white" /> MP04
          </span>
          {t('legendTracked')}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white shadow" /> {t('legendRouteBus')}
        </li>
        <li className="flex items-center gap-2">
          <svg width="12" height="16" viewBox="0 0 30 40" aria-hidden="true">
            <path d="M15 1C7.3 1 1 7.1 1 14.7 1 25 15 39 15 39s14-14 14-24.3C29 7.1 22.7 1 15 1z" fill="#752d07" />
          </svg>
          {t('destinationPin')}
        </li>
      </ul>

      <div className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden border border-gray-300 shadow-inner z-0">
        <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <CameraController
            passengerLocation={passengerLocation}
            trackedVehicle={trackedVehicle}
            trackedLocation={trackedVehicle ? activeVehicles[trackedVehicle] : null}
            focusPoint={focusPoint}
            recenterTick={recenterTick}
          />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {passengerLocation && (
            <Marker position={[passengerLocation.lat, passengerLocation.lng]} icon={passengerIcon} zIndexOffset={900}>
              <Popup>
                <div className="font-bold text-blue-700">{t('youAreHere')}</div>
              </Popup>
            </Marker>
          )}

          {destination && (
            <Marker position={[Number(destination.lat), Number(destination.lon)]} icon={destinationIcon} zIndexOffset={950}>
              <Popup>
                <div className="font-sans">
                  <div className="text-xs font-bold uppercase text-gray-500 mb-1">{t('destinationPin')}</div>
                  <div className="text-sm font-semibold text-gray-900 max-w-[220px]">{destination.name}</div>
                </div>
              </Popup>
            </Marker>
          )}

          {Object.values(activeVehicles).map((vehicle) => {
            const isTracked = vehicle.id === trackedVehicle;
            return (
              <Marker
                key={vehicle.id}
                position={[vehicle.lat, vehicle.lng]}
                icon={vehicleIcon(vehicle.id, isTracked)}
                zIndexOffset={isTracked ? 1100 : 1000}
              >
                <Popup>
                  <div className="font-sans min-w-[150px]">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase">{vehicle.id}</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded capitalize">
                      {vehicle.vehicleType || 'Vehicle'}
                    </span>
                    <div className="mt-2 text-xs text-gray-500">
                      {t('speedLabel')}: {Math.round((vehicle.speed || 0) * 3.6)} km/h
                    </div>
                    {onTrack && !isTracked && (
                      <button
                        onClick={() => onTrack(vehicle.id)}
                        className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 rounded-md"
                      >
                        {t('trackBtn')}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {buses.map((bus) => {
            const isDelayed = bus.status !== 'On Time';
            return (
              <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={staticBusIcon(isDelayed)}>
                <Popup>
                  <div className="font-sans">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{bus.route}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        !isDelayed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {!isDelayed ? t('statusOnTime') : t('statusDelayed')}
                    </span>
                    <div className="mt-2 text-xs">
                      {t('etaLabel')} <strong>{bus.eta}</strong>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
});

export default LiveMap;
