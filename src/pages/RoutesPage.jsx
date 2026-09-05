import React from 'react';
import { useBuses } from '../hooks/useBuses';
import { Map, MapPin } from 'lucide-react';

export default function RoutesPage() {
  const { routes, loading, error } = useBuses();

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500 font-medium">Loading routes...</div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-red-500 font-medium">Error loading routes: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">City Transit Routes</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Explore all active bus routes and their designated stops.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routes.map(route => (
          <div key={route.id} className="glass-panel p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Map className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{route.name}</h2>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {route.id}
                </span>
              </div>
            </div>

            <div className="flex-grow">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Stops</h3>
              <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {route.stops.map((stop, idx) => (
                  <li key={idx} className="relative flex items-center gap-3">
                    <div className="bg-white p-1 rounded-full border-2 border-indigo-200 z-10 shadow-sm">
                      <MapPin className="h-3 w-3 text-indigo-500" />
                    </div>
                    <span className="text-base text-gray-800 font-medium">{stop}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium">
                Assigned Buses: <strong className="text-gray-900">{route.busesAssigned.join(', ')}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
