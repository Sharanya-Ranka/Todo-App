import type { StateCreator } from "zustand";
import type { RootStore, RewardSlice} from "../../types/store";
import type { Reward } from "../../types/reward";

export const createRewardSlice: StateCreator<
  RootStore,
  [],
  [],
  RewardSlice
> = (set) => ({
  rewardsMap: {},
  currentCoins: 0,

  /**
   * Claims a reward. Allows negative coin balance, decrements currentCoins,
   * and increments the reward's timesUsed counter.
   */
  claimReward: (rewardId: string) => {
    set((state) => {
      const reward = state.rewardsMap[rewardId];
      if (!reward) return state;

      return {
        currentCoins: state.currentCoins - reward.coinCost,
        rewardsMap: {
          ...state.rewardsMap,
          [rewardId]: {
            ...reward,
            timesUsed: (reward.timesUsed || 0) + 1,
          },
        },
      };
    });
  },

  /**
   * Adds a new custom reward with timesUsed set to 0.
   */
  addReward: (description: string, coinCost: number) => {
    const trimmedDesc = description.trim();
    if (!trimmedDesc) return;

    const newReward: Reward = {
      id: `rew-${Date.now()}`,
      description: trimmedDesc,
      coinCost: Math.max(0, coinCost),
      timesUsed: 0,
    };

    set((state) => ({
      rewardsMap: {
        ...state.rewardsMap,
        [newReward.id]: newReward,
      },
    }));
  },

  /**
   * Modifies description, coinCost, or timesUsed for an existing reward.
   */
  updateReward: (rewardId: string, updates) => {
    set((state) => {
      const existing = state.rewardsMap[rewardId];
      if (!existing) return state;

      return {
        rewardsMap: {
          ...state.rewardsMap,
          [rewardId]: {
            ...existing,
            ...updates,
          },
        },
      };
    });
  },

  /**
   * Removes a reward from the rewardsMap immutably.
   */
  deleteReward: (rewardId: string) => {
    set((state) => {
      if (!state.rewardsMap[rewardId]) return state;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [rewardId]: _ , ...remainingRewards } = state.rewardsMap;

      return {
        rewardsMap: remainingRewards,
      };
    });
  },

  /**
   * Resets `timesUsed` to 0 for all items in rewardsMap.
   */
  zeroOutRewards: () => {
    set((state) => {
      const updatedRewards = Object.fromEntries(
        Object.entries(state.rewardsMap).map(([id, reward]) => [
          id,
          { ...reward, timesUsed: 0 },
        ])
      );

      return {
        rewardsMap: updatedRewards,
      };
    });
  },
});