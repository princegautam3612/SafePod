export type NavigationTab = 'home' | 'leagues' | 'rewards' | 'profile' | 'roadiq';

export interface TripRecord {
  id: string;
  startTime: number;
  endTime: number;
  dateStr: string;
  distanceKm: number;
  durationSec: number;
  avgSpeedKmH: number;
  maxSpeedKmH: number;
  score: number;
  smoothBrakingPct: number;
  phoneFocusPct: number;
  co2SavedKg: number;
  pointsEarned: number;
  xpEarned: number;
  origin?: string;
  destination?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface VehicleProfile {
  type: 'motorcycle' | 'scooter' | 'car' | 'ev';
  model: string;
  registrationNumber: string;
  fuelType: 'Petrol' | 'EV' | 'Diesel' | 'CNG';
}

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  status: string;
  score: number;
  isCurrentUser?: boolean;
  trend: 'up' | 'down' | 'same';
  streakDays: number;
  highlightBadge?: string;
}

export interface ActiveChallenge {
  id: string;
  title: string;
  iconType: 'speed' | 'moon' | 'leaf' | 'shield';
  currentValue: number;
  targetValue: number;
  unit: string;
  rewardXp: number;
  rewardPoints: number;
  description: string;
  completed?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  subtitle: string;
  cost: number;
  badge: 'POPULAR' | 'PREMIUM' | 'IMPACT' | 'GREEN' | 'EXCLUSIVE';
  category: 'fuel' | 'insurance' | 'trees' | 'ev' | 'all';
  image: string;
  terms: string;
  partner: string;
  expiryDays: number;
}

export interface PointTransaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'earn' | 'redeem';
  category: string;
}

export interface QuizQuestion {
  id: string;
  level: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TelemetryState {
  isDriving: boolean;
  speed: number;
  speedLimit: number;
  bufferSeconds: number;
  driveScore: number;
  brakingG: number;
  corneringG: number;
  phoneDistraction: boolean;
  tripDistanceKm: number;
  tripDurationSec: number;
  co2SavedKg: number;
  pointsEarned: number;
  recentEvent?: string;
}
