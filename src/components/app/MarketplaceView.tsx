import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, History as HistoryIcon, ShieldAlert, Check } from 'lucide-react';
import { RewardItem, PointTransaction } from '../../types';
import { REWARDS } from '../../data/mockData';
import { RedeemModal } from '../common/RedeemModal';
import { HistoryModal } from '../common/HistoryModal';

interface MarketplaceViewProps {
  points: number;
  xp: number;
  transactions: PointTransaction[];
  onRedeemReward: (reward: RewardItem) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  points,
  xp,
  transactions,
  onRedeemReward,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalReward, setActiveModalReward] = useState<RewardItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const categories = [
    { id: 'all', label: 'All Rewards' },
    { id: 'fuel', label: 'Fuel' },
    { id: 'insurance', label: 'Auto Insurance' },
    { id: 'trees', label: 'Green Impact' },
    { id: 'ev', label: 'EV Credits' }
  ];

  const filteredRewards = selectedCategory === 'all'
    ? REWARDS
    : REWARDS.filter(r => r.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col min-h-full pb-6 px-5 pt-3 bg-white text-slate-900 max-w-md mx-auto"
    >
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight font-['Outfit']">
          Marketplace: Points for Impact
        </h1>

        {/* Available Points & History */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-0.5">Available Points</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                {points.toLocaleString()}
              </span>
              <span className="w-5 h-5 rounded-full border border-emerald-600 text-emerald-600 flex items-center justify-center text-[10px] font-bold font-mono">
                ✪
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
          >
            HISTORY
          </button>
        </div>
      </div>

      {/* Goal Reachable Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-950 rounded-2xl p-5 text-white shadow-md mb-4 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-amber-300" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300">
            GOAL REACHABLE
          </span>
        </div>

        <h2 className="text-sm font-bold text-white leading-snug tracking-tight mb-3 font-['Outfit']">
          Earn 500 more points this week to unlock Gold Rewards!
        </h2>

        {/* Orange Progress Bar */}
        <div className="relative w-full h-2 bg-black/30 rounded-full overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
            style={{ width: '65%' }}
          />
        </div>

        <span className="text-[10px] font-mono text-emerald-100">
          65% of weekly goal achieved
        </span>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Reward Cards List */}
      <div className="space-y-3.5">
        {filteredRewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-emerald-500 transition-all"
          >
            {/* Image Header with Badge */}
            <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
              <img
                src={reward.image}
                alt={reward.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-white/90 border border-slate-200 text-slate-800 text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs">
                  {reward.badge}
                </span>
              </div>
            </div>

            {/* Content & Price */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    {reward.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {reward.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {reward.cost}
                  </span>
                  <span className="w-3.5 h-3.5 rounded-full border border-emerald-600 text-emerald-600 flex items-center justify-center text-[8px] font-bold font-mono">
                    ✪
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setActiveModalReward(reward)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs uppercase font-['Outfit'] tracking-wider transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <RedeemModal
        reward={activeModalReward}
        userPoints={points}
        onClose={() => setActiveModalReward(null)}
        onConfirmRedeem={(reward) => {
          onRedeemReward(reward);
        }}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        transactions={transactions}
      />
    </motion.div>
  );
};

