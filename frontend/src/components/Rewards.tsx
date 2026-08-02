// RewardsPage.tsx
import React, { useState } from 'react';
import type { Reward, RewardMap } from '../types';

interface RewardsPageProps {
  rewards: RewardMap;
  currentCoins: number;
  onClaimReward: (rewardId: string) => void;
  onAddReward: (description: string, cost: number) => void;
  onUpdateReward: (rewardId: string, updates: Partial<Omit<Reward, 'id'>>) => void;
  onDeleteReward: (rewardId: string) => void;
}

export const Rewards: React.FC<RewardsPageProps> = ({
  rewards,
  currentCoins,
  onClaimReward,
  onAddReward,
  onUpdateReward,
  onDeleteReward,
}) => {
  const [desc, setDesc] = useState('');
  const [cost, setCost] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    onAddReward(desc.trim(), Number(cost));
    setDesc('');
    setCost(5);
  };

  return (
  <div className="max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
    {/* Header */}
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">🎁 Rewards Store</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm">Spend your hard-earned task coins here!</p>
    </div>

    {/* Add New Reward Form */}
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <input
        type="text"
        placeholder="New reward name..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="flex-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="flex items-center gap-1">
        <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">🪙</span>
        <input
          type="number"
          min="1"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          className="w-20 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-indigo-600 dark:bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
      >
        Add Reward
      </button>
    </form>

    {/* Reward Grid */}
    {Object.keys(rewards).length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(rewards).map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            currentCoins={currentCoins}
            onClaimReward={onClaimReward}
            onUpdateReward={onUpdateReward}
            onDeleteReward={onDeleteReward}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        No rewards created yet. Add one above to motivate your progress! 🎯
      </div>
    )}
  </div>
);
};

// --- Sub-component for Individual Reward Item ---

interface RewardCardProps {
  reward: Reward;
  currentCoins: number;
  onClaimReward: (rewardId: string) => void;
  onUpdateReward: (rewardId: string, updates: Partial<Omit<Reward, 'id'>>) => void;
  onDeleteReward: (rewardId: string) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  currentCoins,
  onClaimReward,
  onUpdateReward,
  onDeleteReward,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(reward.description);
  const [editCost, setEditCost] = useState(reward.coinCost);

  const canAfford = currentCoins >= reward.coinCost;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDesc.trim()) return;

    onUpdateReward(reward.id, {
      description: editDesc.trim(),
      coinCost: Number(editCost),
    });
    setIsEditing(false);
  };

  return (
  <div className="flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600">
    {isEditing ? (
      /* Edit Mode Form */
      <form onSubmit={handleSave} className="space-y-3">
        <input
          type="text"
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          autoFocus
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">🪙</span>
            <input
              type="number"
              min="1"
              value={editCost}
              onChange={(e) => setEditCost(Number(e.target.value))}
              className="w-20 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    ) : (
      /* Display Mode */
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{reward.description}</h3>
            {reward.timesUsed > 0 && (
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700">
                Used {reward.timesUsed}x
              </span>
            )}
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
            🪙 {reward.coinCost} Coins
          </span>
        </div>

        {/* Controls & Action Button */}
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <button
            onClick={() => {
              setEditDesc(reward.description);
              setEditCost(reward.coinCost);
              setIsEditing(true);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 text-xs dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
            title="Edit Reward"
          >
            ✏️
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDeleteReward(reward.id)}
            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 text-xs dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40"
            title="Delete Reward"
          >
            ✕
          </button>

          {/* Redeem / Borrow Button */}
          <button
            onClick={() => onClaimReward(reward.id)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 ${
              canAfford
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm dark:bg-amber-600 dark:hover:bg-amber-500'
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm dark:bg-rose-600 dark:hover:bg-rose-500'
            }`}
          >
            {canAfford ? 'Redeem 🎁' : 'Borrow 💳'}
          </button>
        </div>
      </div>
    )}
  </div>
);
};