import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck, Award, Leaf, Zap, Trophy, CheckCircle,
  ChevronRight, Download, Bike, Car, PhoneCall, Volume2,
  VolumeX, Clock, MapPin, HeartHandshake, User
} from 'lucide-react';
import { EmergencyContact, VehicleProfile } from '../../types';

interface ProfileViewProps {
  points: number;
  xp: number;
  onOpenRoadIQ: () => void;
  onOpenInstall: () => void;
  onOpenTrips: () => void;
  onOpenSOS: () => void;
  emergencyContact: EmergencyContact;
  onUpdateEmergencyContact: (contact: EmergencyContact) => void;
  vehicle: VehicleProfile;
  onUpdateVehicle: (vehicle: VehicleProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  points,
  xp,
  onOpenRoadIQ,
  onOpenInstall,
  onOpenTrips,
  onOpenSOS,
  emergencyContact,
  onUpdateEmergencyContact,
  vehicle,
  onUpdateVehicle,
}) => {
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  const vehicleOptions: VehicleProfile[] = [
    { type: 'motorcycle', model: 'Royal Enfield Hunter 350', registrationNumber: 'DL 01 AB 7890', fuelType: 'Petrol' },
    { type: 'scooter', model: 'Ather 450X Gen 3', registrationNumber: 'KA 03 EV 2049', fuelType: 'EV' },
    { type: 'motorcycle', model: 'Hero Splendor Plus', registrationNumber: 'UP 16 Z 4412', fuelType: 'Petrol' },
    { type: 'car', model: 'Tata Nexon EV Max', registrationNumber: 'MH 02 EV 9110', fuelType: 'EV' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col min-h-full pb-8 px-4 sm:px-5 pt-3 bg-white text-slate-900 max-w-md mx-auto space-y-3.5"
    >
      {/* Profile Header Card */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div className="relative shrink-0">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            alt="Profile Avatar"
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
            ★
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-slate-900 font-['Outfit'] truncate">Arjun Sharma</h1>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium truncate">Verified Safe Driver • Diamond Tier</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-mono font-bold">
              {xp.toLocaleString()} XP
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-mono font-bold">
              {points.toLocaleString()} ✪ Points
            </span>
          </div>
        </div>
      </div>

      {/* Lifetime Impact Statistics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-black text-slate-900 font-mono">1,840</div>
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Clean KMs</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1">
            <Leaf className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-black text-amber-700 font-mono">14</div>
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Trees Planted</span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-center">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-black text-emerald-700 font-mono">88</div>
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">DriveScore</span>
        </div>
      </div>

      {/* Vehicle Garage Card */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              {vehicle.type === 'car' ? <Car className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                ACTIVE VEHICLE
              </span>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                {vehicle.model}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowVehiclePicker(!showVehiclePicker)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors"
          >
            {showVehiclePicker ? 'Close' : 'Switch'}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200">
          <span>Plate: <strong className="text-slate-700 font-bold">{vehicle.registrationNumber}</strong></span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">{vehicle.fuelType}</span>
        </div>

        {showVehiclePicker && (
          <div className="pt-2 space-y-1.5 border-t border-slate-200">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Select Vehicle from Garage:
            </span>
            {vehicleOptions.map((v) => (
              <button
                key={v.registrationNumber}
                onClick={() => {
                  onUpdateVehicle(v);
                  setShowVehiclePicker(false);
                }}
                className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  vehicle.registrationNumber === v.registrationNumber
                    ? 'bg-emerald-100/70 border border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div>{v.model}</div>
                  <span className="text-[10px] font-mono text-slate-500">{v.registrationNumber} • {v.fuelType}</span>
                </div>
                {vehicle.registrationNumber === v.registrationNumber && (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contact Card */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              ICE Emergency Contact
            </span>
            <h4 className="text-xs font-bold text-slate-900">{emergencyContact.name} ({emergencyContact.relationship})</h4>
            <span className="text-[10px] font-mono text-slate-500">{emergencyContact.phone}</span>
          </div>
        </div>

        <button
          onClick={onOpenSOS}
          className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
        >
          SOS Tool
        </button>
      </div>

      {/* Trip History Log Shortcut */}
      <div
        onClick={onOpenTrips}
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-500 transition-colors group"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700">
              TRIP LEDGER
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </div>
        <h3 className="text-xs font-bold text-slate-900 font-['Outfit']">
          View Past Trip Logs &amp; Commute Scores
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Review your distance, safe braking accuracy, and points credited.
        </p>
      </div>

      {/* Voice Alerts Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            {voiceAlertsEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Audio Telematics Alerts</h4>
            <p className="text-[11px] text-slate-500">Speed warnings and safe distance cues</p>
          </div>
        </div>

        <button
          onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            voiceAlertsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              voiceAlertsEnabled ? 'right-1' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Road IQ Certification Card */}
      <div
        onClick={onOpenRoadIQ}
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-500 transition-colors group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700">
            ROAD IQ MASTERY
          </span>
          <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </div>
        <h3 className="text-xs font-bold text-slate-900 font-['Outfit']">
          Initiation &amp; 3 Pillars Certification
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">
          Re-test your Road IQ and practice kinetic distance buffer simulations.
        </p>
      </div>

      {/* Download Web App (Standalone PWA) Card */}
      <div
        onClick={onOpenInstall}
        className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-xs cursor-pointer hover:border-emerald-500 transition-colors group"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800">
              DOWNLOAD WEB APP (PWA)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </div>
        <h3 className="text-xs font-bold text-slate-900 font-['Outfit']">
          Install SafePod on Home Screen
        </h3>
        <p className="text-[11px] text-slate-600 mt-1">
          Run in standalone fullscreen mode without browser URL address bars or preview headers.
        </p>
      </div>
    </motion.div>
  );
};
