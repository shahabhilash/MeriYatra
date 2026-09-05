import React, { useState, useRef } from 'react';
import LiveBuses from './LiveBuses';
import LiveMap from './LiveMap';
import AutocompleteInput from './AutocompleteInput';
import { Route, MapPin } from 'lucide-react';
import { useBuses } from '../hooks/useBuses';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';

export default function Dashboard() {
  const { t } = useLanguage();
  const { buses, routes, loading, error } = useBuses();
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [rtoNumber, setRtoNumber] = useState('');
  
  // Live GPS Tracking State
  const [liveLocation, setLiveLocation] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const channelRef = useRef(null);

  const [channelStatus, setChannelStatus] = useState('');

  const handleFindRide = () => {
    if (!rtoNumber.trim()) return;
    
    setIsListening(true);
    setLiveLocation(null);
    setChannelStatus('Connecting to Supabase...');

    // Clean up previous channel if searching again
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channelName = `tracking-${rtoNumber.trim().toUpperCase()}`;
    console.log("Passenger trying to subscribe to:", channelName);
    const channel = supabase.channel(channelName);
    
    channel.on('broadcast', { event: 'location' }, ({ payload }) => {
       console.log("Passenger received GPS payload:", payload);
       setLiveLocation(payload);
       setChannelStatus(`Live signal received at ${new Date().toLocaleTimeString()}`);
    }).subscribe((status, err) => {
       console.log("Passenger channel status:", status, err);
       if (status === 'SUBSCRIBED') {
         setChannelStatus('Connected! Waiting for driver GPS signal...');
       } else if (status === 'CHANNEL_ERROR') {
         setChannelStatus('Error: Could not connect to Supabase Realtime.');
       }
    });

    channelRef.current = channel;
  };

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
          {t('dashHeroTitle1')} <span className="text-red-600">{t('dashHeroTitle2')}</span> {t('dashHeroTitle3')}
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
          {t('dashHeroSubtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <input 
              type="text" 
              value={rtoNumber}
              onChange={(e) => setRtoNumber(e.target.value.toUpperCase())}
              placeholder={t('dashRtoPlaceholder')} 
              className="w-full px-6 py-3.5 rounded-xl font-medium text-lg border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all uppercase bg-white text-gray-900 shadow-sm"
            />
            {channelStatus && (
              <p className={`mt-2 text-sm font-bold ${liveLocation ? 'text-green-600' : 'text-blue-600'}`}>
                {channelStatus}
              </p>
            )}
          </div>
          <button 
            onClick={handleFindRide}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-200 shrink-0 self-start"
          >
            {isListening ? 'Listening...' : t('dashFindRideBtn')}
          </button>
        </div>

        {/* Route Selector (From/To) */}
        <div className="mt-12 max-w-3xl mx-auto glass-panel p-4 flex flex-col md:flex-row items-center gap-4">
          <AutocompleteInput 
            value={fromStop}
            onChange={setFromStop}
            placeholder={t('dashPickupPlaceholder')}
            label={t('dashFrom')}
            icon={
              <div className="bg-amber-100 p-2.5 rounded-lg">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
            }
          />
          
          <div className="hidden md:flex text-gray-300 shrink-0 px-2">
            <Route className="h-5 w-5" />
          </div>
          
          <AutocompleteInput 
            value={toStop}
            onChange={setToStop}
            placeholder={t('dashDropPlaceholder')}
            label={t('dashTo')}
            icon={
              <div className="bg-red-100 p-2.5 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
            }
          />
        </div>
      </div>

      {/* Stats/Features row removed for simplicity */}
      {/* Main Content Areas */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 font-medium">{t('dashLoadingData')}</div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-medium">{t('dashErrorData')} {error}</div>
      ) : (
        <>
          {/* Show the map first so it is immediately visible */}
          <LiveMap buses={filteredBuses} liveLocation={liveLocation} />
          
          {/* Hide mock buses if we are actively tracking a real driver */}
          {!isListening && (
            <div className="mt-12">
              <LiveBuses buses={filteredBuses} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
