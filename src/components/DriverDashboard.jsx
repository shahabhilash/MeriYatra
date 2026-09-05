import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { MapPin, Navigation, SignalHigh, AlertTriangle } from 'lucide-react';

export default function DriverDashboard() {
  const { profile, driverDetails } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  
  const watchId = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const startTracking = async () => {
    if (!driverDetails?.rto_number) {
      setError("RTO Number not found. Please re-register your vehicle.");
      return;
    }
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setError(null);
    setIsTracking(true);

    // 1. Initialize Supabase Channel
    const channelName = `tracking-${driverDetails.rto_number}`;
    console.log("Driver trying to create channel:", channelName);
    const channel = supabase.channel(channelName);
    
    channel.subscribe((status, err) => {
      console.log("Driver channel status:", status, err);
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to ${channelName} for broadcasting`);
      }
    });
    
    channelRef.current = channel;

    // 2. Start watching GPS position
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const newLocation = { lat: latitude, lng: longitude, speed: speed || 0 };
        
        setLocation(newLocation);
        console.log("Driver GPS Update:", newLocation);

        // 3. Broadcast to Supabase instantly
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'location',
            payload: newLocation
          }).then((res) => {
             console.log("Broadcast success:", res);
          }).catch((err) => {
             console.error("Broadcast failed:", err);
          });
        }
      },
      (err) => {
        console.error("GPS Error:", err);
        setError(`Location Error: ${err.message}`);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    setLocation(null);
  };

  if (!profile || !driverDetails) {
    return <div className="py-20 text-center">Loading driver profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Driver Dashboard</h1>
        <p className="text-gray-500">Broadcast your live location to passengers</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Vehicle RTO</p>
            <p className="text-2xl font-bold text-gray-900 uppercase">{driverDetails.rto_number}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</p>
            <p className="text-lg font-medium text-gray-800 capitalize">{driverDetails.vehicle_type}</p>
          </div>
        </div>

        <div className="p-8 text-center">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all ${isTracking ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
            {isTracking ? <SignalHigh className="h-16 w-16" /> : <Navigation className="h-16 w-16" />}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isTracking ? 'Broadcasting Live Location...' : 'Ready to Start Trip?'}
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {isTracking 
              ? 'Passengers searching for your RTO number can now see you moving on their map in real-time.' 
              : 'Click start to begin broadcasting your GPS coordinates to waiting passengers.'}
          </p>

          {isTracking ? (
            <button 
              onClick={stopTracking}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-8 py-4 rounded-xl font-bold text-lg transition-colors w-full sm:w-auto"
            >
              Stop Tracking
            </button>
          ) : (
            <button 
              onClick={startTracking}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-green-200 w-full sm:w-auto"
            >
              Start Trip
            </button>
          )}

          {isTracking && location && (
            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                Lat: {location.lat.toFixed(4)}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                Lng: {location.lng.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
