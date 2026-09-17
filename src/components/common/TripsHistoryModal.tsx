import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Clock, Gauge, Award, Trophy, ChevronRight, Calendar } from 'lucide-react';
import { TripRecord } from '../../types';

interface TripsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripRecord[];
}

export const TripsHistoryModal: React.FC<TripsHistoryModalProps> = ({
  isOpen,
  onClose,
  trips,
}) => {
  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full border border-slate-200 p-5 max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">Trip History Log</h3>
                <span className="text-[10px] font-mono text-slate-500">{trips.length} Trips Recorded</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 py-2 space-y-2 flex-1 my-2">
            {trips.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No trips recorded yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Tap &quot;Start Trip&quot; on Home to log your first ride!</p>
              </div>
            ) : (
              trips.map((t) => (
                <div key={t.id} className="pt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-mono text-slate-500">{t.dateStr}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold">
                      Score: {t.score} ★
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-slate-900 font-mono">
                      {t.distanceKm.toFixed(1)} KM • {formatDuration(t.durationSec)}
                    </div>
                    <div className="font-mono font-bold text-amber-600">
                      +{t.pointsEarned} ✪
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Avg {t.avgSpeedKmH} km/h • Max {t.maxSpeedKmH} km/h</span>
                    <span className="text-emerald-600 font-medium">{t.phoneFocusPct}% Phone Focus</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider cursor-pointer mt-2 border border-slate-200"
          >
            Close Trip Log
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
