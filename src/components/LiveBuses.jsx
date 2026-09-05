import React from 'react';
import { Bus, MapPin, Clock } from 'lucide-react';

export default function LiveBuses({ buses = [] }) {
  if (!buses || buses.length === 0) {
    return <div className="text-gray-500 py-8 text-center glass-panel">No active rides on this route currently.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Live Rides</h2>
        <span className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Tracking Active
        </span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {buses.map((bus) => (
          <div key={bus.id} className="glass-panel p-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2.5 rounded-lg">
                  <Bus className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">{bus.id}</h3>
                  <p className="text-sm text-gray-600 font-medium">{bus.route}</p>
                </div>
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                bus.status === 'On Time' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {bus.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-lg text-gray-800">
                <Clock className="h-5 w-5 mr-2 text-red-600" />
                <span>ETA: <strong className="text-red-700 text-xl">{bus.eta}</strong></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>Next Stop: <strong className="text-gray-900">Main St. Station</strong></span>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-xs font-medium text-gray-500">
                Occupancy: <span className={`
                  ${bus.occupancy === 'Low' ? 'text-green-600' : ''}
                  ${bus.occupancy === 'Medium' ? 'text-yellow-600' : ''}
                  ${bus.occupancy === 'High' ? 'text-red-600' : ''}
                `}>{bus.occupancy}</span>
              </div>
              <button className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                View on map &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
