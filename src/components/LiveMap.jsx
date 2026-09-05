import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon paths in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons based on status
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

export default function LiveMap({ buses = [] }) {
  // Center roughly around LA based on mock coordinates
  const defaultCenter = [34.053, -118.243];
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Route Map</h2>
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-gray-300 shadow-inner z-0">
        <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {buses.map((bus) => {
            let markerIcon = iconBlue;
            if (bus.status === 'On Time') markerIcon = iconGreen;
            if (bus.status === 'Delayed') markerIcon = iconRed;
            
            return (
              <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={markerIcon}>
                <Popup>
                  <div className="font-sans">
                    <strong className="text-gray-900 block text-base">{bus.id}</strong>
                    <span className="text-sm text-gray-600 block mb-1">{bus.route}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      bus.status === 'On Time' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {bus.status}
                    </span>
                    <div className="mt-2 text-xs">
                      ETA: <strong>{bus.eta}</strong>
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
}
