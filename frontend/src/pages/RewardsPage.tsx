import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";

export const RewardsPage: React.FC = () => {
  // Store subscriptions
  const rewardsMap = useAppStore((state) => state.rewardsMap);
  const currentCoins = useAppStore((state) => state.currentCoins);
  const addReward = useAppStore((state) => state.addReward);
  const zeroOutRewards = useAppStore((state) => state.zeroOutRewards);

  // Local form state for new reward
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState(5);

  const rewardIds = Object.keys(rewardsMap);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;

    addReward(desc.trim(), Number(cost));
    setDesc("");
    setCost(5);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            🎁 Rewards Store
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Spend your hard-earned task coins or claim rewards!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Balance:
            </span>
            <span
              className={`text-sm font-extrabold ${
                currentCoins >= 0
                  ? "text-amber-500 dark:text-amber-400"
                  : "text-rose-500"
              }`}
            >
              🪙 {currentCoins}
            </span>
          </div>

          {rewardIds.length > 0 && (
            <button
              type="button"
              onClick={zeroOutRewards}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-2 rounded transition"
              title="Reset all reward usage counters to 0"
            >
              Reset Counts
            </button>
          )}
        </div>
      </div>

      {/* Add New Reward Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap sm:flex-nowrap gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <input
          type="text"
          placeholder="New reward name (e.g. 1 hour gaming, coffee break)..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="flex-1 min-w-[200px] rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex items-center gap-1">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold select-none">
            🪙
          </span>
          <input
            type="number"
            min="0"
            value={cost}
            onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
            className="w-20 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-indigo-600 dark:bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-sm"
        >
          Add Reward
        </button>
      </form>

      {/* Reward Grid */}
      {rewardIds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewardIds.map((id) => (
            <RewardCard key={id} rewardId={id} />
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

// Sub-component for individual reward items
interface RewardCardProps {
  rewardId: string;
}

const RewardCard: React.FC<RewardCardProps> = ({ rewardId }) => {
  // Store subscriptions
  const reward = useAppStore((state) => state.rewardsMap[rewardId]);
  const currentCoins = useAppStore((state) => state.currentCoins);
  const claimReward = useAppStore((state) => state.claimReward);
  const updateReward = useAppStore((state) => state.updateReward);
  const deleteReward = useAppStore((state) => state.deleteReward);

  // Local editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(reward?.description || "");
  const [editCost, setEditCost] = useState(reward?.coinCost || 0);

  if (!reward) return null;

  const canAfford = currentCoins >= reward.coinCost;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editDesc.trim();
    if (!trimmed) return;

    updateReward(reward.id, {
      description: trimmed,
      coinCost: Math.max(0, Number(editCost)),
    });
    setIsEditing(false);
  };

  return (
    <div className="group flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600">
      {isEditing ? (
        /* Edit Mode Form */
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full rounded border border-slate-300 px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold select-none">
                🪙
              </span>
              <input
                type="number"
                min="0"
                value={editCost}
                onChange={(e) =>
                  setEditCost(Math.max(0, Number(e.target.value)))
                }
                className="w-20 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditDesc(reward.description);
                  setEditCost(reward.coinCost);
                  setIsEditing(false);
                }}
                className="rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Display Mode */
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                {reward.description}
              </h3>
              {reward.timesUsed > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 select-none"></span>
              )}
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              🪙 {reward.coinCost} Coins
            </span>
          </div>

          {/* Controls & Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Edit Button (visible on group hover) */}
            <button
              type="button"
              onClick={() => {
                setEditDesc(reward.description);
                setEditCost(reward.coinCost);
                setIsEditing(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 text-xs dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition"
              title="Edit Reward"
            >
              ✏️
            </button>

            {/* Delete Button (visible on group hover) */}
            <button
              type="button"
              onClick={() => deleteReward(reward.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 text-xs dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition"
              title="Delete Reward"
            >
              ✕
            </button>

            {/* Redeem / Borrow Action */}
            <button
              type="button"
              onClick={() => claimReward(reward.id)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex flex-col items-center gap-1 shadow-sm ${
                canAfford
                  ? "bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-500"
                  : "bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-500"
              }`}
              title={
                canAfford
                  ? "Redeem reward"
                  : "Claim reward on credit (negative balance allowed)"
              }
            >
              <span className="flex items-center gap-1 text-xs font-bold leading-tight">
                <span>{canAfford ? "Redeem" : "Borrow"}</span>
                <span className="text-xs">{canAfford ? "🎁" : "💳"}</span>
              </span>

              <span
                className={`text-[10px] font-medium leading-tight mt-0.5 tabular-nums ${
                  reward.timesUsed > 0 ? "opacity-90" : "opacity-0 select-none"
                }`}
              >
                {reward.timesUsed > 0 ? `Used ${reward.timesUsed}×` : "—"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export alias to support both `<RewardsPage />` and `<Rewards />` imports
export const Rewards = RewardsPage;
