import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  NavigationTab, RewardItem, PointTransaction, TripRecord,
  VehicleProfile, EmergencyContact
} from './types';
import {
  INITIAL_POINTS, INITIAL_XP, INITIAL_TRANSACTIONS, INITIAL_TRIPS
} from './data/mockData';

// Driver App Screen Components
import { AppHeader } from './components/app/AppHeader';
import { AppBottomNav } from './components/app/AppBottomNav';
import { HomeTelematicsView } from './components/app/HomeTelematicsView';
import { SquadsView } from './components/app/SquadsView';
import { MarketplaceView } from './components/app/MarketplaceView';
import { RoadIQView } from './components/app/RoadIQView';
import { ProfileView } from './components/app/ProfileView';

// Common Modals
import { InstallAppModal } from './components/common/InstallAppModal';
import { EmergencyModal } from './components/common/EmergencyModal';
import { TripSummaryModal } from './components/common/TripSummaryModal';
import { TripsHistoryModal } from './components/common/TripsHistoryModal';
import { AuthGate } from './components/common/AuthGate';
import { accessToken } from './lib/api';

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(accessToken()));
  if (!authenticated) return <AuthGate onAuthenticated={() => setAuthenticated(true)} />;
  // Navigation
  const [appTab, setAppTab] = useState<NavigationTab>('home');

  // Modals
  const [showSOSModal, setShowSOSModal] = useState<boolean>(false);
  const [showTripSummary, setShowTripSummary] = useState<boolean>(false);
  const [completedTrip, setCompletedTrip] = useState<TripRecord | null>(null);
  const [showTripsHistory, setShowTripsHistory] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Time string for phone status bar
  const [timeStr, setTimeStr] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Capture PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // User State (Points, XP, Transactions) with local persistence
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('safepod_points');
    return saved ? parseInt(saved, 10) : INITIAL_POINTS;
  });

  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('safepod_xp');
    return saved ? parseInt(saved, 10) : INITIAL_XP;
  });

  const [transactions, setTransactions] = useState<PointTransaction[]>(() => {
    const saved = localStorage.getItem('safepod_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [trips, setTrips] = useState<TripRecord[]>(() => {
    const saved = localStorage.getItem('safepod_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [vehicle, setVehicle] = useState<VehicleProfile>(() => {
    const saved = localStorage.getItem('safepod_vehicle');
    return saved
      ? JSON.parse(saved)
      : {
          type: 'motorcycle',
          model: 'Royal Enfield Hunter 350',
          registrationNumber: 'DL 01 AB 7890',
          fuelType: 'Petrol',
        };
  });

  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>(() => {
    const saved = localStorage.getItem('safepod_ice');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Priya Sharma',
          phone: '+91 98765 43210',
          relationship: 'Spouse',
        };
  });

  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('safepod_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('safepod_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('safepod_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('safepod_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('safepod_vehicle', JSON.stringify(vehicle));
  }, [vehicle]);

  useEffect(() => {
    localStorage.setItem('safepod_ice', JSON.stringify(emergencyContact));
  }, [emergencyContact]);

  // Point earning handler
  const handleEarnPoints = (amount: number, reason: string) => {
    setPoints((prev) => prev + amount);
    setXp((prev) => prev + amount * 2);
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        title: reason,
        date: 'Just now',
        amount: amount,
        type: 'earn',
        category: 'Telematics',
      },
      ...prev,
    ]);
  };

  // Reward redemption handler
  const handleRedeemReward = (reward: RewardItem) => {
    if (points >= reward.cost) {
      setPoints((prev) => prev - reward.cost);
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          title: `Redeemed ${reward.title}`,
          date: 'Just now',
          amount: -reward.cost,
          type: 'redeem',
          category: 'Marketplace',
        },
        ...prev,
      ]);
    }
  };

  // Road IQ initiation completion
  const handleCompleteInitiation = () => {
    handleEarnPoints(250, 'Road IQ Level 0 Initiation Passed');
  };

  // Finish Trip handler
  const handleFinishTrip = (trip: TripRecord) => {
    setTrips((prev) => [trip, ...prev]);
    setCompletedTrip(trip);
    setShowTripSummary(true);
  };

  // Render Screens
  const renderAppScreen = () => {
    switch (appTab) {
      case 'home':
        return (
          <HomeTelematicsView
            onNavigateTab={(tab) => setAppTab(tab)}
            onEarnPoints={handleEarnPoints}
            onOpenSOS={() => setShowSOSModal(true)}
            onOpenTrips={() => setShowTripsHistory(true)}
            onFinishTrip={handleFinishTrip}
            vehicle={vehicle}
            points={points}
            recentTrips={trips}
            onCoordsUpdate={(coords) => setCurrentCoords(coords)}
          />
        );
      case 'leagues':
        return (
          <SquadsView
            onOpenHome={() => setAppTab('home')}
            onOpenRoadIQ={() => setAppTab('roadiq')}
          />
        );
      case 'rewards':
        return (
          <MarketplaceView
            points={points}
            xp={xp}
            transactions={transactions}
            onRedeemReward={handleRedeemReward}
          />
        );
      case 'roadiq':
        return (
          <RoadIQView
            onCompleteInitiation={handleCompleteInitiation}
            onClose={() => setAppTab('home')}
          />
        );
      case 'profile':
        return (
          <ProfileView
            points={points}
            xp={xp}
            onOpenRoadIQ={() => setAppTab('roadiq')}
            onOpenInstall={() => setShowInstallModal(true)}
            onOpenTrips={() => setShowTripsHistory(true)}
            onOpenSOS={() => setShowSOSModal(true)}
            emergencyContact={emergencyContact}
            onUpdateEmergencyContact={setEmergencyContact}
            vehicle={vehicle}
            onUpdateVehicle={setVehicle}
          />
        );
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-900 sm:bg-slate-950 flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 sm:p-4 overflow-hidden">
      {/* Phone Shell Layout */}
      <div className="w-full h-[100dvh] sm:h-[94vh] sm:max-h-[890px] sm:max-w-md bg-white sm:rounded-[40px] overflow-hidden sm:shadow-2xl sm:border-[6px] sm:border-slate-800 flex flex-col relative">
        {/* Desktop Phone Status Bar simulation */}
        <div className="hidden sm:flex items-center justify-between px-6 pt-2.5 pb-1 bg-white text-[11px] font-mono text-slate-800 select-none z-30 shrink-0">
          <span className="font-bold">{timeStr}</span>
          <div className="w-24 h-4.5 rounded-full bg-slate-900 mx-auto -mt-1 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-800" />
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[10px]">
            <span>5G</span>
            <span className="text-emerald-700">100%</span>
          </div>
        </div>

        {/* Global Application Header */}
        <AppHeader
          points={points}
          xp={xp}
          isDriving={appTab === 'home'}
          onOpenProfile={() => setAppTab('profile')}
          onOpenRewards={() => setAppTab('rewards')}
          onOpenSOS={() => setShowSOSModal(true)}
          onOpenInstall={() => setShowInstallModal(true)}
        />

        {/* Main Application Screen Viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">
          <AnimatePresence mode="wait">
            {renderAppScreen()}
          </AnimatePresence>
        </div>

        {/* Global Bottom Navigation */}
        <AppBottomNav
          currentTab={appTab}
          onSelectTab={(tab) => setAppTab(tab)}
        />
      </div>

      {/* Emergency Assistance & SOS Modal */}
      <EmergencyModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
        currentCoords={currentCoords}
        emergencyContact={emergencyContact}
      />

      {/* Trip Completion Summary Modal */}
      <TripSummaryModal
        trip={completedTrip}
        isOpen={showTripSummary}
        onClose={() => setShowTripSummary(false)}
      />

      {/* Trips History Log Modal */}
      <TripsHistoryModal
        isOpen={showTripsHistory}
        onClose={() => setShowTripsHistory(false)}
        trips={trips}
      />

      {/* Standalone Web App Download & Installation Guide Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerInstall}
      />
    </div>
  );
}
