import React from 'react';
import { Zap, Radio, AlertTriangle, ShieldAlert, Download, Sparkles } from 'lucide-react';

interface AppHeaderProps {
  points: number;
  xp: number;
  isDriving?: boolean;
  onOpenProfile: () => void;
  onOpenRewards: () => void;
  onOpenSOS: () => void;
  onOpenInstall?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  points,
  xp,
  isDriving = false,
  onOpenProfile,
  onOpenRewards,
  onOpenSOS,
  onOpenInstall,
}) => {
  return (
    <header className="flex items-center justify-between px-4 pt-3.5 pb-2.5 bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 max-w-md mx-auto w-full">
      {/* Brand & Avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenProfile}
          className="relative rounded-full ring-2 ring-emerald-500/40 overflow-hidden cursor-pointer hover:ring-emerald-600 transition-all shrink-0"
          title="Open Driver Profile"
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
            alt="Driver Avatar"
            className="w-8 h-8 object-cover"
          />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1.5 ring-white" />
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-5.5 h-5.5 rounded bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            <span className="transform rotate-45 block w-2 h-2 bg-white rounded-xs"></span>
          </div>
          <span className="text-base font-black text-slate-900 tracking-tight font-['Outfit']">
            SafePod
          </span>
          {isDriving && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[8.5px] font-mono font-bold animate-pulse">
              <Radio className="w-2.5 h-2.5" />
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: Points Badge + Quick SOS Action */}
      <div className="flex items-center gap-1.5">
        {/* Points Chip */}
        <button
          onClick={onOpenRewards}
          title="View Points & Rewards"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <span className="text-amber-600">✪</span>
          <span>{points.toLocaleString()}</span>
        </button>

        {/* SOS Emergency Trigger */}
        <button
          onClick={onOpenSOS}
          title="Emergency Assistance & SOS"
          className="px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[10px] font-mono font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <AlertTriangle className="w-3 h-3 text-white" />
          <span>SOS</span>
        </button>

        {/* PWA Install button */}
        {onOpenInstall && (
          <button
            onClick={onOpenInstall}
            title="Download App to Home Screen"
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};


