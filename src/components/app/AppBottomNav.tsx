import React from 'react';
import { LayoutGrid, Trophy, Gift, User, ShieldCheck } from 'lucide-react';
import { NavigationTab } from '../../types';

interface AppBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const AppBottomNav: React.FC<AppBottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'leagues', label: 'Squads', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'roadiq', label: 'Road IQ', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-2 sm:px-3 pt-2 pb-2.5 pb-safe shadow-lg max-w-md mx-auto w-full">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer min-w-[54px] min-h-[44px] ${
                isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive ? (
                <div className="w-11 sm:w-12 h-6 sm:h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 mb-0.5 sm:mb-1">
                  <Icon className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-6 sm:h-7 flex items-center justify-center mb-0.5 sm:mb-1">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              )}
              <span className={`text-[9.5px] sm:text-[10px] uppercase font-mono tracking-wider ${isActive ? 'font-bold text-emerald-800' : 'font-medium text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

