import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';

// Fix for default Leaflet icon paths in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on status
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const iconGreen = createIcon('green');
const iconRed = createIcon('red');
const iconBlue = createIcon('blue');

// Helper component to auto-pan the map to the live GPS location
function AutoCenter({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location && location.lat && location.lng) {
      map.flyTo([location.lat, location.lng], 16, { animate: true });
    }
  }, [location, map]);
  return null;
}

export default function LiveMap({ buses = [], liveLocation = null }) {
  const { t } = useLanguage();
  // Center roughly around VIT Bhopal
  const defaultCenter = [23.0775, 76.8513];
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('liveMapTitle')}</h2>
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-gray-300 shadow-inner z-0">
        <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <AutoCenter location={liveLocation} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {buses.map(bus => {
            const isDelayed = bus.status !== 'On Time';
            return (
              <Marker 
                key={bus.id} 
                position={[bus.lat, bus.lng]} 
                icon={isDelayed ? iconRed : iconBlue}
              >
                <Popup>
                  <div className="font-sans">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{bus.route}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      !isDelayed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
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

          {/* Realtime GPS Broadcast Marker */}
          {liveLocation && (
            <Marker 
              position={[liveLocation.lat, liveLocation.lng]} 
              icon={iconGreen}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Live Driver!</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 animate-pulse">
                    Broadcasting GPS
                  </span>
                  <div className="mt-2 text-xs text-gray-500">
                    Just updated.
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
