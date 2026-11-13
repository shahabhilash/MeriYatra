import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import LiveBuses from './LiveBuses';
import LiveMap from './LiveMap';
import NearbyVehicles from './NearbyVehicles';
import GettingStarted from './GettingStarted';
import AutocompleteInput from './AutocompleteInput';
import { Route, MapPin, Navigation, Clock, Share2, X, History, Check, Gauge, HelpCircle, Info } from 'lucide-react';
import { useBuses } from '../hooks/useBuses';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import { readStore, writeStore } from '../utils/geo';

const RECENT_KEY = 'meriyatra_recent';
const GUIDE_HIDDEN_KEY = 'meriyatra_hide_guide';
const MAX_RECENT = 5;
const ETA_REFRESH_MS = 15000; // OSRM is a shared public server - don't hit it on every 2s GPS tick
const STALE_VEHICLE_MS = 120000;

const normalizeId = (id) => (id || '').trim().toUpperCase();

export default function Dashboard() {
  const { t } = useLanguage();
  const { buses, routes, loading, error } = useBuses();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [rtoNumber, setRtoNumber] = useState(() => normalizeId(searchParams.get('track')));

  // Real Scheduled Rides State
  const [scheduledRides, setScheduledRides] = useState([]);

  // Global Tracking State
  const [activeVehicles, setActiveVehicles] = useState({});
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [trackedVehicle, setTrackedVehicle] = useState(() => normalizeId(searchParams.get('track')) || null);
  const [locationError, setLocationError] = useState(false);
  const [now, setNow] = useState(Date.now());

  // UI helpers
  const [recentSearches, setRecentSearches] = useState(() => readStore(RECENT_KEY, []));
  const [shareCopied, setShareCopied] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);
  const [recenterTick, setRecenterTick] = useState(0);
  const mapSectionRef = useRef(null);
  const nearbyRef = useRef(null);
  const rtoInputRef = useRef(null);
  const heroRef = useRef(null);
  const [showGuide, setShowGuide] = useState(() => !readStore(GUIDE_HIDDEN_KEY, false));

  // ETA State
  const [etaDestinationName, setEtaDestinationName] = useState('');
  const [etaDestinationCoords, setEtaDestinationCoords] = useState(null);
  const [liveEtaSeconds, setLiveEtaSeconds] = useState(null);
  const [isCalculatingEta, setIsCalculatingEta] = useState(false);
  const lastEtaRef = useRef({ key: null, at: 0 });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPassengerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(false);
      },
      (err) => {
        console.warn('Passenger location disabled:', err);
        setLocationError(true);
      }
    );
  }, []);

  useEffect(() => {
    fetchScheduledRides();

    // 1. Get passenger's location
    requestLocation();

    // 2. Subscribe to Global GPS Channel
    const channel = supabase.channel('tracking-global');
    channel
      .on('broadcast', { event: 'location' }, ({ payload }) => {
        if (!payload?.id) return;
        const id = normalizeId(payload.id);
        setActiveVehicles((prev) => ({
          ...prev,
          [id]: {
            ...payload,
            id,
            localTimestamp: Date.now(), // Stamp with the passenger's clock to avoid device clock drift
          },
        }));
      })
      .subscribe();

    // 3. Remove vehicles with no signal for 2 minutes (background tabs get throttled, so be tolerant)
    const cleanupInterval = setInterval(() => {
      setActiveVehicles((prev) => {
        const ts = Date.now();
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((id) => {
          if (ts - next[id].localTimestamp > STALE_VEHICLE_MS) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 10000);

    // 4. Clock for "updated Xs ago" labels
    const clock = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      channel.unsubscribe();
      clearInterval(cleanupInterval);
      clearInterval(clock);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // OSRM Routing Effect (throttled)
  const trackedData = trackedVehicle ? activeVehicles[trackedVehicle] : null;
  useEffect(() => {
    if (!trackedData || !etaDestinationCoords) return;

    const key = `${trackedVehicle}|${etaDestinationCoords.lat},${etaDestinationCoords.lon}`;
    const ts = Date.now();
    if (lastEtaRef.current.key === key && ts - lastEtaRef.current.at < ETA_REFRESH_MS) return;
    lastEtaRef.current = { key, at: ts };

    const controller = new AbortController();
    (async () => {
      setIsCalculatingEta(true);
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${trackedData.lng},${trackedData.lat};${etaDestinationCoords.lon},${etaDestinationCoords.lat}?overview=false`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          setLiveEtaSeconds(data.routes[0].duration);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('OSRM Routing Error:', err);
      } finally {
        setIsCalculatingEta(false);
      }
    })();
    return () => controller.abort();
  }, [trackedVehicle, trackedData?.localTimestamp, etaDestinationCoords]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchScheduledRides = async () => {
    try {
      // 1. Fetch scheduled rides
      const { data: rides, error: ridesError } = await supabase
        .from('scheduled_rides')
        .select('*')
        .in('status', ['scheduled', 'active'])
        .order('start_time', { ascending: true });

      if (ridesError) throw ridesError;

      if (rides && rides.length > 0) {
        // 2. Fetch corresponding driver details (RTO & Vehicle Type)
        const driverIds = rides.map((r) => r.driver_id);
        const { data: details } = await supabase
          .from('driver_details')
          .select('id, rto_number, vehicle_type')
          .in('id', driverIds);

        // 3. Combine the data
        const formattedRides = rides.map((ride) => {
          const detail = details?.find((d) => d.id === ride.driver_id);
          return {
            id: detail?.rto_number || 'DRIVER-' + ride.id.substring(0, 4).toUpperCase(),
            vehicleType: detail?.vehicle_type || 'bus',
            isReal: true,
            routeId: ride.id,
            route: `${ride.from_location} - ${ride.to_location}`,
            nextStop: ride.to_location,
            status: 'Scheduled',
            eta: new Date(ride.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            occupancy: 'N/A',
            rawTime: ride.start_time,
          };
        });
        setScheduledRides(formattedRides);
      } else {
        setScheduledRides([]);
      }
    } catch (err) {
      console.error('Error fetching rides:', err);
    }
  };

  const rememberSearch = (id) => {
    setRecentSearches((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENT);
      writeStore(RECENT_KEY, next);
      return next;
    });
  };

  const clearRecent = () => {
    setRecentSearches([]);
    writeStore(RECENT_KEY, []);
  };

  const resetEta = () => {
    setEtaDestinationCoords(null);
    setEtaDestinationName('');
    setLiveEtaSeconds(null);
    lastEtaRef.current = { key: null, at: 0 };
  };

  const trackVehicle = (rawId, { scroll = false } = {}) => {
    const id = normalizeId(rawId);
    if (!id) {
      clearTracking();
      return;
    }
    if (id !== trackedVehicle) setLiveEtaSeconds(null);
    setRtoNumber(id);
    setTrackedVehicle(id);
    rememberSearch(id);
    setSearchParams({ track: id }, { replace: true });
    if (scroll) mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearTracking = () => {
    setTrackedVehicle(null);
    setRtoNumber('');
    resetEta();
    setSearchParams({}, { replace: true });
  };

  const handleFindRide = () => trackVehicle(rtoNumber);

  const handleShare = async () => {
    if (!trackedVehicle) return;
    const url = new URL(window.location.href);
    url.search = `?track=${encodeURIComponent(trackedVehicle)}`;
    const shareUrl = url.toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'मेरी yatra', text: t('driverTrackingLive', { id: trackedVehicle }), url: shareUrl });
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error('Could not copy link:', err);
    }
  };

  const handleViewOnMap = (bus) => {
    const liveId = normalizeId(bus.id);
    if (bus.isReal && activeVehicles[liveId]) {
      trackVehicle(liveId, { scroll: true });
      return;
    }
    if (bus.lat != null && bus.lng != null) {
      setFocusPoint({ lat: bus.lat, lng: bus.lng, at: Date.now() });
    }
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hideGuide = () => {
    setShowGuide(false);
    writeStore(GUIDE_HIDDEN_KEY, true);
  };

  const openGuide = () => {
    setShowGuide(true);
    writeStore(GUIDE_HIDDEN_KEY, false);
    setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const smoothScroll = (el, block = 'start') => el?.scrollIntoView({ behavior: 'smooth', block });

  const focusTrackInput = () => {
    smoothScroll(heroRef.current, 'start');
    setTimeout(() => rtoInputRef.current?.focus({ preventScroll: true }), 400);
  };

  const focusRouteInput = () => {
    const input = document.getElementById('from-stop-input');
    smoothScroll(input, 'center');
    setTimeout(() => input?.focus({ preventScroll: true }), 400);
  };

  const handleLocateMe = () => {
    if (!passengerLocation) requestLocation();
    setRecenterTick((n) => n + 1);
  };

  const matchingRouteIds = routes
    .filter((route) => {
      if (!fromStop && !toStop) return true;
      const hasFrom = fromStop ? route.stops.includes(fromStop) : true;
      const hasTo = toStop ? route.stops.includes(toStop) : true;
      // Ensure 'from' comes before 'to' if both are selected
      if (fromStop && toStop && hasFrom && hasTo) {
        return route.stops.indexOf(fromStop) < route.stops.indexOf(toStop);
      }
      return hasFrom && hasTo;
    })
    .map((r) => r.id);

  const filteredBuses = buses.filter((bus) => matchingRouteIds.includes(bus.routeId));

  // Filter Real Scheduled Rides based on the from/to search text
  const filteredScheduled = scheduledRides.filter((ride) => {
    if (!fromStop && !toStop) return true;
    const hasFrom = fromStop ? ride.route.toLowerCase().includes(fromStop.toLowerCase()) : true;
    const hasTo = toStop ? ride.route.toLowerCase().includes(toStop.toLowerCase()) : true;
    return hasFrom && hasTo;
  });

  // Combine them, putting real scheduled rides at the top
  const combinedRides = [...filteredScheduled, ...filteredBuses];

  const isLive = Boolean(trackedVehicle && trackedData);
  const lastSeenSeconds = isLive ? Math.max(0, Math.round((now - trackedData.localTimestamp) / 1000)) : null;
  const arrivalTime =
    liveEtaSeconds != null
      ? new Date(Date.now() + liveEtaSeconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center py-10 lg:py-16 scroll-mt-24" ref={heroRef}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          {t('dashHeroTitle1')} <span className="text-red-600">{t('dashHeroTitle2')}</span> {t('dashHeroTitle3')}
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">{t('dashHeroSubtitle')}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFindRide();
          }}
          className="flex flex-col sm:flex-row justify-center items-stretch sm:items-start gap-3 max-w-2xl mx-auto"
        >
          <div className="w-full sm:flex-1 text-center sm:text-left">
            <div className="relative">
              <input
                ref={rtoInputRef}
                type="text"
                value={rtoNumber}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setRtoNumber(value);
                  if (value === '') clearTracking();
                }}
                placeholder={t('dashRtoPlaceholder')}
                aria-label={t('dashRtoPlaceholder')}
                className="w-full pl-6 pr-12 py-3.5 rounded-xl font-medium text-lg border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all uppercase bg-white text-gray-900 shadow-sm"
              />
              {rtoNumber && (
                <button
                  type="button"
                  onClick={clearTracking}
                  aria-label={t('stopFollowing')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {trackedVehicle && !isLive && (
              <p className="mt-2 text-sm font-bold text-red-600">{t('driverNotBroadcasting', { id: trackedVehicle })}</p>
            )}
            {isLive && <p className="mt-2 text-sm font-bold text-green-600">{t('driverTrackingLive', { id: trackedVehicle })}</p>}
            {!trackedVehicle && (
              <p className="mt-2 text-xs sm:text-sm text-gray-500 flex items-start justify-center sm:justify-start gap-1.5">
                <Info className="h-4 w-4 shrink-0 mt-px text-gray-400" /> {t('rtoHint')}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-200 shrink-0"
          >
            {t('dashFindRideBtn')}
          </button>
        </form>

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="mt-4 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-gray-500 font-medium">
              <History className="h-4 w-4" /> {t('recentSearches')}
            </span>
            {recentSearches.map((id) => (
              <button
                key={id}
                onClick={() => trackVehicle(id)}
                className={`px-3 py-1 rounded-full font-bold border transition-colors ${
                  id === trackedVehicle
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600'
                }`}
              >
                {id}
              </button>
            ))}
            <button onClick={clearRecent} className="text-gray-400 hover:text-gray-700 font-medium underline-offset-2 hover:underline">
              {t('clearLabel')}
            </button>
          </div>
        )}

        {/* Dynamic ETA Router */}
        {trackedVehicle && (
          <div className="mt-8 max-w-4xl mx-auto bg-red-50 border border-red-100 rounded-2xl p-5 md:p-6 text-left shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <Navigation className="h-5 w-5" /> {t('calcLiveEta', { id: trackedVehicle })}
              </h3>
              <div className="flex items-center gap-2">
                {isLive && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-red-100 px-2.5 py-1.5 rounded-lg">
                    <Gauge className="h-3.5 w-3.5 text-red-600" />
                    {Math.round((trackedData.speed || 0) * 3.6)} km/h &middot; {t('updatedAgo', { s: lastSeenSeconds })}
                  </span>
                )}
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 bg-white hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {shareCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {shareCopied ? t('linkCopied') : t('shareLive')}
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex-1 bg-white rounded-xl border border-red-100 px-4 py-3">
                <AutocompleteInput
                  value={etaDestinationName}
                  onChange={(val) => {
                    setEtaDestinationName(val);
                    if (!val) resetEta();
                  }}
                  onSelectLocation={(loc) => setEtaDestinationCoords(loc)}
                  placeholder={t('whereToGo')}
                  label={t('dashTo')}
                  icon={
                    <div className="bg-red-100 p-2.5 rounded-lg">
                      <MapPin className="h-5 w-5 text-red-600" />
                    </div>
                  }
                />
              </div>

              {(liveEtaSeconds !== null || isCalculatingEta) && (
                <div className="bg-white px-8 py-4 rounded-xl shadow-sm text-center md:min-w-[220px] border border-red-200">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" /> {t('estimatedTime')}
                  </p>
                  {liveEtaSeconds !== null ? (
                    <>
                      <div className="text-4xl font-black text-red-600">
                        {Math.ceil(liveEtaSeconds / 60)} <span className="text-xl">{t('minLabel')}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-500 mt-1">{t('arrivesAt', { time: arrivalTime })}</p>
                    </>
                  ) : (
                    <div className="h-10 w-24 mx-auto bg-red-50 rounded-lg animate-pulse" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Route Selector (From/To) */}
        <p className="mt-12 mb-3 text-sm font-semibold text-gray-600">{t('routeSelectorHint')}</p>
        <div className="max-w-3xl mx-auto glass-panel p-4 flex flex-col md:flex-row items-center gap-4">
          <AutocompleteInput
            inputId="from-stop-input"
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
          <div className="md:hidden w-full border-t border-gray-100" />

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

      {/* First-visit guide */}
      {showGuide ? (
        <GettingStarted
          onTrackFocus={focusTrackInput}
          onRouteFocus={focusRouteInput}
          onShowNearby={() => smoothScroll(nearbyRef.current)}
          onShowMap={() => smoothScroll(mapSectionRef.current)}
          onHide={hideGuide}
        />
      ) : (
        <div className="-mt-6 mb-10 text-center">
          <button
            onClick={openGuide}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 bg-white/70 hover:bg-white border border-red-100 px-3.5 py-1.5 rounded-full transition-colors"
          >
            <HelpCircle className="h-4 w-4" /> {t('showGuide')}
          </button>
        </div>
      )}

      {/* Main Content Areas */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 font-medium">{t('dashLoadingData')}</div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-medium">
          {t('dashErrorData')} {error}
        </div>
      ) : (
        <>
          {/* Show Live Rides (Scheduled + Mock) at the top */}
          {!trackedVehicle && (
            <div className="mb-12">
              <LiveBuses buses={combinedRides} onViewOnMap={handleViewOnMap} />
            </div>
          )}

          {/* Live vehicles around the passenger */}
          <div ref={nearbyRef} className="scroll-mt-24">
          <NearbyVehicles
            activeVehicles={activeVehicles}
            passengerLocation={passengerLocation}
            trackedVehicle={trackedVehicle}
            onTrack={(id) => trackVehicle(id, { scroll: true })}
            now={now}
          />
          </div>

          {/* Location Retry Prompt */}
          {locationError && !passengerLocation && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <MapPin className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{t('locAccessDisabled')}</h4>
                  <p className="text-sm text-gray-600">{t('locAccessDesc')}</p>
                </div>
              </div>
              <button
                onClick={requestLocation}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold whitespace-nowrap transition-colors shadow-sm"
              >
                {t('retryAccess')}
              </button>
            </div>
          )}

          {/* Map */}
          <LiveMap
            ref={mapSectionRef}
            buses={filteredBuses}
            activeVehicles={activeVehicles}
            passengerLocation={passengerLocation}
            trackedVehicle={trackedVehicle}
            destination={trackedVehicle && etaDestinationCoords ? etaDestinationCoords : null}
            focusPoint={focusPoint}
            onTrack={(id) => trackVehicle(id)}
            onLocateMe={handleLocateMe}
            recenterTick={recenterTick}
          />
        </>
      )}
    </div>
  );
}
