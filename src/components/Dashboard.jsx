import React, { useState } from 'react';
import LiveBuses from './LiveBuses';
import LiveMap from './LiveMap';
import { Route, MapPin } from 'lucide-react';
import { useBuses } from '../hooks/useBuses';

export default function Dashboard() {
  const { buses, routes, loading, error } = useBuses();
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');

  const allStops = [...new Set(routes.flatMap(route => route.stops))].sort();

  const matchingRouteIds = routes.filter(route => {
    if (!fromStop && !toStop) return true;
    
    const hasFrom = fromStop ? route.stops.includes(fromStop) : true;
    const hasTo = toStop ? route.stops.includes(toStop) : true;
    
    // Ensure 'from' comes before 'to' if both are selected
    if (fromStop && toStop && hasFrom && hasTo) {
      return route.stops.indexOf(fromStop) < route.stops.indexOf(toStop);
    }
    
    return hasFrom && hasTo;
  }).map(r => r.id);

  const filteredBuses = buses.filter(bus => matchingRouteIds.includes(bus.routeId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center py-12 lg:py-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Find Your <span className="text-red-600">Ride</span> Easily
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
          Live tracking for buses, autos, and cabs on your daily commute. Simple, reliable, and free to use.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-200">
            Find My Ride
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-3.5 rounded-xl font-bold text-lg transition-all border border-gray-200 shadow-sm">
            View Schedules
          </button>
        </div>

        {/* Route Selector (From/To) */}
        <div className="mt-12 max-w-3xl mx-auto glass-panel p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-grow w-full text-left flex items-center gap-3">
            <div className="bg-amber-100 p-2.5 rounded-lg">
              <MapPin className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">From</label>
              <select 
                value={fromStop}
                onChange={(e) => setFromStop(e.target.value)}
                className="w-full bg-transparent text-gray-900 font-bold focus:outline-none cursor-pointer truncate"
              >
                <option value="">Select Pickup Location</option>
                {allStops.map(stop => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="hidden md:flex text-gray-300">
            <Route className="h-5 w-5" />
          </div>
          
          <div className="flex-grow w-full text-left flex items-center gap-3">
            <div className="bg-red-100 p-2.5 rounded-lg">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">To</label>
              <select 
                value={toStop}
                onChange={(e) => setToStop(e.target.value)}
                className="w-full bg-transparent text-gray-900 font-bold focus:outline-none cursor-pointer truncate"
              >
                <option value="">Select Drop Location</option>
                {allStops.map(stop => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>
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
