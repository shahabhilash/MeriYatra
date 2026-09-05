import React, { useState } from 'react';
import LiveBuses from './LiveBuses';
import LiveMap from './LiveMap';
import { Activity, ShieldCheck, Zap, Route } from 'lucide-react';
import { useBuses } from '../hooks/useBuses';

export default function Dashboard() {
  const { buses, routes, loading, error } = useBuses();
  const [selectedRouteId, setSelectedRouteId] = useState('ALL');

  const filteredBuses = selectedRouteId === 'ALL' 
    ? buses 
    : buses.filter(bus => bus.routeId === selectedRouteId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center py-12 lg:py-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Find Your <span className="text-red-600">Bus</span> Easily
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
          Live bus tracking for your daily commute. Simple, reliable, and free to use.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-200">
            Find My Bus
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-3.5 rounded-xl font-bold text-lg transition-all border border-gray-200 shadow-sm">
            View Schedules
          </button>
        </div>

        {/* Route Selector */}
        <div className="mt-12 max-w-md mx-auto glass-panel p-4 flex items-center gap-4">
          <Route className="h-6 w-6 text-amber-500" />
          <div className="flex-grow text-left">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter by Route</label>
            <select 
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full bg-transparent text-gray-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Routes</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats/Features row removed for simplicity */}
      {/* Main Content Areas */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 font-medium">Loading live data...</div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-medium">Error loading data: {error}</div>
      ) : (
        <>
          <LiveBuses buses={filteredBuses} />
          <LiveMap buses={filteredBuses} />
        </>
      )}
    </div>
  );
}
