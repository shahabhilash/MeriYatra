import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { MapPin, Navigation, SignalHigh, AlertTriangle, CalendarClock, Clock, CheckCircle2, Timer, Route as RouteIcon, Gauge, Sun, XCircle, Loader2 } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { useLanguage } from '../context/LanguageContext';
import { distanceKm, formatDuration } from '../utils/geo';

// Ignore GPS jitter smaller than this when adding up trip distance
const MIN_SEGMENT_KM = 0.008;

// Value for <input type="datetime-local" min=...> in the user's local time
const localNowForInput = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function DriverDashboard() {
  const { profile, driverDetails } = useAuth();
  const { t } = useLanguage();
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  // Trip stats
  const [tripStart, setTripStart] = useState(null);
  const [tripKm, setTripKm] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Scheduling State
  const [scheduledRides, setScheduledRides] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ from: '', to: '', time: '' });
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState(null); // { type: 'ok' | 'error', text }
  const [cancellingId, setCancellingId] = useState(null);

  const watchId = useRef(null);
  const channelRef = useRef(null);
  const broadcastIntervalRef = useRef(null);
  const locationRef = useRef(null);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (profile?.id) fetchScheduledRides();
    return () => {
      stopTracking();
    };
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick the trip timer while broadcasting
  useEffect(() => {
    if (!isTracking) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isTracking]);

  // Re-acquire the wake lock when the tab becomes visible again (browsers drop it when hidden)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isTracking && !wakeLockRef.current) requestWakeLock();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isTracking]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
          setWakeLockActive(false);
        });
      }
    } catch (err) {
      console.warn('Wake lock unavailable:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    setWakeLockActive(false);
  };

  const fetchScheduledRides = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_rides')
        .select('*')
        .eq('driver_id', profile.id)
        .order('start_time', { ascending: true });
      if (error) throw error;
      if (data) setScheduledRides(data);
    } catch (err) {
      console.error('Error fetching rides:', err);
    }
  };

  const flashMessage = (type, text) => {
    setScheduleMsg({ type, text });
    setTimeout(() => setScheduleMsg(null), 3000);
  };

  const handleScheduleRide = async (e) => {
    e.preventDefault();
    if (!scheduleForm.from || !scheduleForm.to || !scheduleForm.time) {
      flashMessage('error', t('fillAllFields'));
      return;
    }

    setIsScheduling(true);
    try {
      const { error } = await supabase.from('scheduled_rides').insert([
        {
          driver_id: profile.id,
          from_location: scheduleForm.from,
          to_location: scheduleForm.to,
          start_time: new Date(scheduleForm.time).toISOString(),
        },
      ]);

      if (error) throw error;
      setScheduleForm({ from: '', to: '', time: '' });
      flashMessage('ok', t('rideScheduled'));
      fetchScheduledRides();
    } catch (err) {
      console.error(err);
      flashMessage('error', t('rideScheduleError'));
    } finally {
      setIsScheduling(false);
    }
  };

  // Soft-cancel: passengers only see rides with status scheduled/active
  const handleCancelRide = async (rideId) => {
    setCancellingId(rideId);
    try {
      const { error } = await supabase
        .from('scheduled_rides')
        .update({ status: 'cancelled' })
        .eq('id', rideId)
        .eq('driver_id', profile.id);
      if (error) throw error;
      setScheduledRides((prev) => prev.map((r) => (r.id === rideId ? { ...r, status: 'cancelled' } : r)));
    } catch (err) {
      console.error('Cancel failed:', err);
      flashMessage('error', t('rideCancelError'));
    } finally {
      setCancellingId(null);
    }
  };

  const startTracking = async () => {
    if (!driverDetails?.rto_number) {
      setError('RTO Number not found. Please re-register your vehicle.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);
    setIsTracking(true);
    setTripStart(Date.now());
    setNow(Date.now());
    setTripKm(0);
    requestWakeLock();

    // 1. Initialize Global Supabase Channel
    const channelName = 'tracking-global';
    const channel = supabase.channel(channelName);

    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${channelName} for broadcasting`);
      } else if (err) {
        console.warn('Driver channel status:', status, err);
      }
    });

    channelRef.current = channel;

    // 2. Start watching GPS position
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const newLocation = { lat: latitude, lng: longitude, speed: speed || 0 };

        const prev = locationRef.current;
        if (prev) {
          const seg = distanceKm(prev, newLocation);
          if (seg > MIN_SEGMENT_KM) setTripKm((km) => km + seg);
        }

        locationRef.current = newLocation;
        setLocation(newLocation);
      },
      (err) => {
        // A timeout just means no fresh fix yet - keep watching and broadcasting the last one
        if (err.code === err.TIMEOUT) {
          console.warn('GPS timeout, waiting for next fix');
          return;
        }
        console.error('GPS Error:', err);
        setError(`Location Error: ${err.message}`);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    // 3. Force High-Frequency Broadcasting (Every 2 seconds)
    // Laptops rarely trigger watchPosition if they aren't physically moving.
    // This interval forces the broadcast so passengers get instant data!
    broadcastIntervalRef.current = setInterval(() => {
      if (locationRef.current && channelRef.current) {
        channelRef.current
          .send({
            type: 'broadcast',
            event: 'location',
            payload: {
              ...locationRef.current,
              id: driverDetails.rto_number.trim().toUpperCase(),
              vehicleType: driverDetails.vehicle_type,
              timestamp: Date.now(),
            },
          })
          .catch((err) => console.error('Broadcast failed:', err));
      }
    }, 2000);
  };

  const stopTracking = () => {
    setIsTracking(false);

    if (broadcastIntervalRef.current) {
      clearInterval(broadcastIntervalRef.current);
      broadcastIntervalRef.current = null;
    }

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    releaseWakeLock();
    locationRef.current = null;
    setLocation(null);
  };

  if (!profile || !driverDetails) {
    return (
      <div className="py-20 flex items-center justify-center gap-2 text-gray-500 font-medium">
        <Loader2 className="h-5 w-5 animate-spin text-red-600" /> {t('loadingDriverProfile')}
      </div>
    );
  }

  const nowTs = Date.now();
  const rideState = (ride) => {
    if (ride.status === 'cancelled') return 'cancelled';
    if (new Date(ride.start_time).getTime() < nowTs - 60 * 60 * 1000) return 'past';
    return 'upcoming';
  };

  const stats = [
    { icon: Timer, label: t('tripTime'), value: tripStart ? formatDuration((now - tripStart) / 1000) : '00:00' },
    { icon: RouteIcon, label: t('tripDistance'), value: `${tripKm.toFixed(2)} km` },
    { icon: Gauge, label: t('speedLabel'), value: `${Math.round((location?.speed || 0) * 3.6)} km/h` },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('driverDashTitle')}</h1>
        <p className="text-gray-500">{t('driverDashSub')}</p>
      </div>

      {/* Quick guide for drivers */}
      <ol className="grid gap-3 sm:grid-cols-3 mb-8">
        {[1, 2, 3].map((n) => (
          <li key={n} className="glass-panel p-4 flex gap-3 items-start">
            <span className="h-8 w-8 shrink-0 rounded-full bg-red-600 text-white font-extrabold flex items-center justify-center text-sm">{n}</span>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">{t(`driverStep${n}Title`)}</h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                {t(`driverStep${n}Desc`, { rto: driverDetails.rto_number })}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('vehRto')}</p>
            <p className="text-2xl font-bold text-gray-900 uppercase">{driverDetails.rto_number}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('vehType')}</p>
            <p className="text-lg font-medium text-gray-800 capitalize">{driverDetails.vehicle_type}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 text-center">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <div
            className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all ${
              isTracking ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {isTracking ? <SignalHigh className="h-16 w-16" /> : <Navigation className="h-16 w-16" />}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{isTracking ? t('broadcastingLive') : t('readyToStart')}</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">{isTracking ? t('passengersCanSee') : t('clickStartToBegin')}</p>

          {isTracking ? (
            <button
              onClick={stopTracking}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-8 py-4 rounded-xl font-bold text-lg transition-colors w-full sm:w-auto"
            >
              {t('stopTrackingBtn')}
            </button>
          ) : (
            <button
              onClick={startTracking}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-green-200 w-full sm:w-auto"
            >
              {t('startTripBtn')}
            </button>
          )}

          {isTracking && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                {stats.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl px-2 py-3">
                    <Icon className="h-5 w-5 text-red-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-extrabold text-gray-900 tabular-nums">{value}</div>
                    <div className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>

              {location && (
                <div className="mt-5 flex justify-center gap-6 text-sm text-gray-600">
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

              {wakeLockActive && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> {t('screenAwake')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Schedule a Ride Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200">
        <div className="bg-gray-50 border-b border-gray-100 p-6 rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-red-600" />
            {t('scheduleUpcomingRide')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('scheduleDesc')}</p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleScheduleRide} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end mb-6">
            <div className="w-full border border-gray-300 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
              <AutocompleteInput
                value={scheduleForm.from}
                onChange={(val) => setScheduleForm((f) => ({ ...f, from: val }))}
                placeholder={t('whereFrom')}
                label={t('pickup')}
              />
            </div>
            <div className="w-full border border-gray-300 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
              <AutocompleteInput
                value={scheduleForm.to}
                onChange={(val) => setScheduleForm((f) => ({ ...f, to: val }))}
                placeholder={t('whereTo')}
                label={t('dropoff')}
              />
            </div>
            <div className="w-full border border-gray-300 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('dateTime')}</label>
              <input
                type="datetime-local"
                value={scheduleForm.time}
                min={localNowForInput()}
                onChange={(e) => setScheduleForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full bg-transparent font-bold text-gray-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isScheduling}
              className="w-full md:w-auto h-full min-h-[52px] bg-red-600 hover:bg-red-700 text-white font-bold px-8 rounded-xl shrink-0 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isScheduling && <Loader2 className="h-4 w-4 animate-spin" />}
              {isScheduling ? t('savingBtn') : t('scheduleBtn')}
            </button>
          </form>

          {scheduleMsg && (
            <div
              className={`mb-6 text-center text-sm font-bold py-3 rounded-lg ${
                scheduleMsg.type === 'ok' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
              }`}
            >
              {scheduleMsg.text}
            </div>
          )}

          {/* List of scheduled rides */}
          <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">{t('upcomingRides')}</h3>
          {scheduledRides.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">{t('noUpcomingRides')}</p>
          ) : (
            <div className="space-y-3">
              {scheduledRides.map((ride) => {
                const state = rideState(ride);
                const muted = state !== 'upcoming';
                return (
                  <div
                    key={ride.id}
                    className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border gap-3 ${
                      muted ? 'bg-gray-50/60 border-gray-100 opacity-70' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="bg-red-100 p-3 rounded-full text-red-600 shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-gray-900 break-words ${state === 'cancelled' ? 'line-through' : ''}`}>
                          {ride.from_location} &rarr; {ride.to_location}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4" />
                          {new Date(ride.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {state === 'cancelled' ? (
                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{t('cancelledLabel')}</span>
                      ) : state === 'past' ? (
                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{t('pastLabel')}</span>
                      ) : (
                        <>
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> {(ride.status || 'scheduled').toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleCancelRide(ride.id)}
                            disabled={cancellingId === ride.id}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-white hover:bg-red-50 border border-red-200 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                          >
                            {cancellingId === ride.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                            {t('cancelRide')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
