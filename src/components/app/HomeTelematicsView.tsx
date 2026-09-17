import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gauge, Shield, Zap, AlertTriangle, Play, Pause, Square,
  Sparkles, Trophy, Compass, Activity, Smartphone, CheckCircle,
  ArrowRight, MapPin, Clock, Leaf, AlertCircle, Radio, Volume2,
  ChevronRight, Bike, Car
} from 'lucide-react';
import { TelemetryState, NavigationTab, TripRecord, VehicleProfile } from '../../types';
import { tripsApi } from '../../lib/api';
import { enqueue, flush } from '../../lib/telemetryQueue';

interface HomeTelematicsViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onEarnPoints: (amount: number, reason: string) => void;
  onOpenSOS: () => void;
  onOpenTrips: () => void;
  onFinishTrip: (trip: TripRecord) => void;
  vehicle: VehicleProfile;
  points: number;
  recentTrips: TripRecord[];
  onCoordsUpdate: (coords: { latitude: number; longitude: number; accuracy: number }) => void;
}

export const HomeTelematicsView: React.FC<HomeTelematicsViewProps> = ({
  onNavigateTab,
  onEarnPoints,
  onOpenSOS,
  onOpenTrips,
  onFinishTrip,
  vehicle,
  points,
  recentTrips,
  onCoordsUpdate,
}) => {
  // Driving trip state: 'idle' | 'active' | 'paused'
  const [tripState, setTripState] = useState<'idle' | 'active' | 'paused'>('idle');
  const [speed, setSpeed] = useState<number>(0);
  const [speedLimit, setSpeedLimit] = useState<number>(50);
  const [tripDurationSec, setTripDurationSec] = useState<number>(0);
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(0);
  const [driveScore, setDriveScore] = useState<number>(95);
  const [brakingG, setBrakingG] = useState<number>(0.12);
  const [bufferSeconds, setBufferSeconds] = useState<number>(2.4);
  const [phoneDistractions, setPhoneDistractions] = useState<number>(0);
  const [harshBrakeCount, setHarshBrakeCount] = useState<number>(0);
  const [recentEvent, setRecentEvent] = useState<string>('Sensors initialized. Ready to ride.');
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [speedSum, setSpeedSum] = useState<number>(0);
  const [speedReadingsCount, setSpeedReadingsCount] = useState<number>(0);

  // References for tracking GPS deltas and timer
  const lastCoordsRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const tripStartTimeRef = useRef<number>(Date.now());
  const serverTripIdRef = useRef<string | null>(null);

  // Haversine distance formula (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Start Live Trip
  const handleStartTrip = async () => {
    if (!navigator.geolocation) {
      setRecentEvent('GPS is unavailable on this device. A trip cannot be recorded.');
      return;
    }
    try {
      const trip = await tripsApi.start();
      serverTripIdRef.current = trip.id;
    } catch {
      setRecentEvent('Sign in and connect to SafeDrive before starting a recorded trip.');
      return;
    }
    tripStartTimeRef.current = Date.now();
    setTripState('active');
    setTripDurationSec(0);
    setTripDistanceKm(0);
    setDriveScore(96);
    setSpeed(0);
    setMaxSpeed(0);
    setSpeedSum(0);
    setSpeedReadingsCount(0);
    setPhoneDistractions(0);
    setHarshBrakeCount(0);
    setRecentEvent('Trip started. Monitoring GPS speed & safe kinetic buffer.');

    // Real GPS geolocation tracking
    if ('geolocation' in navigator) {
      try {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            setGpsActive(true);
            const { latitude, longitude, speed: rawGpsSpeed, accuracy } = pos.coords;
            onCoordsUpdate({ latitude, longitude, accuracy });

            // Calculate speed
            let currentKmH = 0;
            if (rawGpsSpeed !== null && rawGpsSpeed !== undefined && rawGpsSpeed >= 0) {
              currentKmH = Math.round(rawGpsSpeed * 3.6);
            } else if (lastCoordsRef.current) {
              const dtHours = (pos.timestamp - lastCoordsRef.current.time) / 3600000;
              if (dtHours > 0.0001) {
                const dist = calculateDistance(
                  lastCoordsRef.current.lat,
                  lastCoordsRef.current.lng,
                  latitude,
                  longitude
                );
                currentKmH = Math.round(dist / dtHours);
              }
            }

            // Never manufacture movement: low-speed GPS noise is stationary.
            if (currentKmH < 2) currentKmH = 0;

            setSpeed(currentKmH);
            setMaxSpeed((prev) => Math.max(prev, currentKmH));
            setSpeedSum((prev) => prev + currentKmH);
            setSpeedReadingsCount((prev) => prev + 1);

            // Accumulate distance
            if (lastCoordsRef.current) {
              const deltaKm = calculateDistance(
                lastCoordsRef.current.lat,
                lastCoordsRef.current.lng,
                latitude,
                longitude
              );
              // Filter out GPS teleport noise (> 150 km/h jump)
              if (deltaKm > 0 && deltaKm < 0.5) {
                setTripDistanceKm((prev) => Math.round((prev + deltaKm) * 100) / 100);
              }
            }

            lastCoordsRef.current = {
              lat: latitude,
              lng: longitude,
              time: pos.timestamp,
            };
            if (serverTripIdRef.current) {
              void enqueue({ client_event_id: crypto.randomUUID(), occurred_at: new Date(pos.timestamp).toISOString(), latitude, longitude, speed_mps: currentKmH / 3.6, accuracy_m: accuracy }).then(() => flush(serverTripIdRef.current!)).catch(() => undefined);
            }
          },
          (err) => {
            console.warn('Geolocation error:', err.message);
            setGpsActive(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
        watchIdRef.current = id;
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Pause / Resume Trip
  const handleTogglePause = () => {
    if (tripState === 'active') {
      setTripState('paused');
      setSpeed(0);
      setRecentEvent('Trip paused at stoplight/rest.');
    } else if (tripState === 'paused') {
      setTripState('active');
      setRecentEvent('Trip resumed. Telematics active.');
    }
  };

  // Finish Trip
  const handleFinishTrip = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const duration = tripDurationSec;
    const distance = tripDistanceKm;
    const avgSpeed = speedReadingsCount > 0 ? Math.round(speedSum / speedReadingsCount) : 0;
    const peakSpeed = maxSpeed;
    const co2Saved = Math.round(distance * 0.11 * 100) / 100;
    let finalScore = driveScore;
    let pointsEarned = 0;
    if (serverTripIdRef.current) {
      try { await flush(serverTripIdRef.current); const result = await tripsApi.finish(serverTripIdRef.current); finalScore = result.score; pointsEarned = result.points_awarded; }
      catch { setRecentEvent('Trip saved locally; it will be finalized after a secure sync.'); return; }
    }
    const xpEarned = pointsEarned * 2;

    const completedTrip: TripRecord = {
      id: `trip-${Date.now()}`,
      startTime: tripStartTimeRef.current,
      endTime: Date.now(),
      dateStr: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: distance,
      durationSec: duration,
      avgSpeedKmH: avgSpeed,
      maxSpeedKmH: peakSpeed,
      score: finalScore,
      smoothBrakingPct: Math.max(75, 100 - harshBrakeCount * 8),
      phoneFocusPct: Math.max(60, 100 - phoneDistractions * 15),
      co2SavedKg: co2Saved,
      pointsEarned,
      xpEarned,
      origin: 'Current Location',
      destination: 'Arrival Stop',
    };

    onEarnPoints(pointsEarned, `Completed ${distance.toFixed(1)} KM Safe Commute`);
    onFinishTrip(completedTrip);
    setTripState('idle');
    setSpeed(0);
    setTripDurationSec(0);
    setTripDistanceKm(0);
    lastCoordsRef.current = null;
    serverTripIdRef.current = null;
  };

  // Device motion listener for real accelerometer G-force detection
  useEffect(() => {
    if (tripState !== 'active') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        const gMag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z) / 9.81;
        const normalizedG = Math.round(gMag * 100) / 100;
        setBrakingG(normalizedG);

        // Harsh deceleration detection (> 1.4G sudden jolt)
        if (normalizedG > 1.35) {
          setHarshBrakeCount((prev) => prev + 1);
          setDriveScore((prev) => Math.max(65, prev - 2));
          setRecentEvent('Harsh deceleration registered. Safe buffer cushioned response.');
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [tripState]);

  // Anti-distraction / Phone Focus detection (detects tab switching while riding)
  useEffect(() => {
    if (tripState !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden && speed > 10) {
        setPhoneDistractions((prev) => prev + 1);
        setDriveScore((prev) => Math.max(60, prev - 3));
        setRecentEvent('⚠️ Phone screen switch detected while riding. Keep focus on the road!');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tripState, speed]);

  // The timer is presentation-only; all movement values come from device sensors.
  useEffect(() => {
    if (tripState !== 'active') return;

    const interval = setInterval(() => {
      setTripDurationSec((prev) => prev + 1);

    }, 1000);

    return () => clearInterval(interval);
  }, [tripState]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isSpeeding = speed > speedLimit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col min-h-full pb-8 px-4 sm:px-5 pt-3 bg-white text-slate-900 max-w-md mx-auto space-y-4"
    >
      {/* Hero Live Telematics Dashboard Card */}
      <div className={`rounded-3xl p-5 text-white transition-all duration-300 relative overflow-hidden border shadow-xl ${
        isSpeeding
          ? 'bg-gradient-to-br from-rose-900 via-rose-950 to-slate-950 border-rose-600 animate-pulse'
          : 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 border-emerald-800'
      }`}>
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        {/* Status Bar */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              tripState === 'active' ? 'bg-emerald-400 animate-ping' : tripState === 'paused' ? 'bg-amber-400' : 'bg-slate-400'
            }`} />
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-200 font-bold">
              {tripState === 'active'
                ? (gpsActive ? 'GPS HIGH-ACCURACY • LIVE TRIP' : 'TELEMATICS ENGINE • ACTIVE')
                : tripState === 'paused'
                ? 'TRIP PAUSED'
                : 'STANDBY • READY TO RIDE'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
            {vehicle.type === 'car' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
            <span className="font-bold truncate max-w-[100px]">{vehicle.model.split(' ')[0]}</span>
          </div>
        </div>

        {/* Speedometer & Live DriveScore */}
        <div className="grid grid-cols-2 gap-3 items-center py-2 relative z-10">
          {/* Speed Box */}
          <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border backdrop-blur-xs transition-colors ${
            isSpeeding
              ? 'bg-rose-950/60 border-rose-500/80 text-rose-100'
              : 'bg-black/40 border-white/10'
          }`}>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-200/70">
              Current Speed
            </span>
            <div className="text-4xl font-black font-mono my-0.5 tracking-tight">
              {tripState === 'idle' ? '00' : speed}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
              <span className="text-emerald-300">KM/H</span>
              <span className="text-emerald-400/50">•</span>
              <button
                onClick={() => setSpeedLimit((prev) => (prev === 40 ? 50 : prev === 50 ? 60 : prev === 60 ? 80 : 40))}
                className="text-emerald-200/90 underline cursor-pointer"
                title="Click to toggle road speed limit"
              >
                Limit {speedLimit}
              </button>
            </div>
          </div>

          {/* DriveScore Box */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-800/40 border border-emerald-400/30 backdrop-blur-xs">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-200">
              Live DriveScore
            </span>
            <div className="text-4xl font-black text-emerald-300 font-mono my-0.5 tracking-tight">
              {tripState === 'idle' ? '96' : driveScore}
            </div>
            <div className="text-[9px] font-mono font-bold text-emerald-200 uppercase tracking-tight">
              {driveScore >= 90 ? '★ Diamond Tier' : driveScore >= 80 ? '★ Gold Tier' : '★ Silver Tier'}
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/10 text-center relative z-10">
          <div>
            <span className="text-[8.5px] text-emerald-200/70 uppercase font-mono font-bold block">Distance</span>
            <span className="text-xs font-black text-white font-mono">
              {tripDistanceKm.toFixed(1)} km
            </span>
          </div>

          <div>
            <span className="text-[8.5px] text-emerald-200/70 uppercase font-mono font-bold block">Duration</span>
            <span className="text-xs font-black text-white font-mono">
              {formatTimer(tripDurationSec)}
            </span>
          </div>

          <div>
            <span className="text-[8.5px] text-emerald-200/70 uppercase font-mono font-bold block">Buffer</span>
            <span className="text-xs font-black text-emerald-300 font-mono">
              {tripState === 'idle' ? '2.4s' : `${bufferSeconds}s`}
            </span>
          </div>

          <div>
            <span className="text-[8.5px] text-emerald-200/70 uppercase font-mono font-bold block">Phone Focus</span>
            <span className="text-xs font-black text-emerald-300 font-mono flex items-center justify-center gap-0.5">
              <Smartphone className="w-2.5 h-2.5" />
              {phoneDistractions === 0 ? '100%' : `${Math.max(60, 100 - phoneDistractions * 15)}%`}
            </span>
          </div>
        </div>

        {/* Real-time Live Event Ticker */}
        <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/10 text-emerald-100 text-[11px] flex items-center gap-2 font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{recentEvent}</span>
        </div>
      </div>

      {/* Primary Trip Action Buttons */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs">
        {tripState === 'idle' ? (
          <div className="space-y-2">
            <button
              onClick={handleStartTrip}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm uppercase font-['Outfit'] tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Commute &amp; Record Trip</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Uses phone GPS &amp; accelerometer to track safe buffer, speed compliance, and reward points.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleTogglePause}
              className={`py-3 px-3 rounded-xl font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                tripState === 'paused'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              {tripState === 'paused' ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Ride</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Ride</span>
                </>
              )}
            </button>

            <button
              onClick={handleFinishTrip}
              className="py-3 px-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Finish &amp; Claim</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Navigation Cards: Squad & Rewards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Squad Card */}
        <div
          onClick={() => onNavigateTab('leagues')}
          className="bg-white text-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                SQUAD LEADERBOARD
              </span>
              <Trophy className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
              The Urban Guardians
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Rank #1 • 88 Team Score</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 mt-3 group-hover:translate-x-0.5 transition-transform uppercase tracking-wider">
            <span>View Squad</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Marketplace Card */}
        <div
          onClick={() => onNavigateTab('rewards')}
          className="bg-white text-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-500 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-600">
                WALLET REWARDS
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-amber-700 transition-colors">
              {points.toLocaleString()} ✪ Points
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">Fuel &amp; Helmet credits</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 mt-3 group-hover:translate-x-0.5 transition-transform uppercase tracking-wider">
            <span>Redeem Shop</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Emergency SOS & Trip Ledger Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        {/* SOS Button */}
        <button
          onClick={onOpenSOS}
          className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-slate-900 text-left transition-colors cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs font-['Outfit']">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS Toolkit</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">GPS Location &amp; 112 Dial</p>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Trips History Button */}
        <button
          onClick={onOpenTrips}
          className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-left transition-colors cursor-pointer flex items-center justify-between group"
        >
          <div>
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs font-['Outfit']">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trip Log</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{recentTrips.length} Recorded Rides</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
