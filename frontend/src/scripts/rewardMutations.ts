import type { AppState, Reward } from "../types";

/**
 * Claims a reward if the user has enough coins.
 * Decrements user coins by coinCost and increments the reward's timesUsed counter.
 */
export const claimRewardMutation = (
  state: AppState,
  rewardId: string,
): AppState => {
  const reward = state.rewards[rewardId];
  if (!reward) return state;

  // Guard clause: check if user has enough coins
  if (state.currentCoins < reward.coinCost) return state;

  return {
    ...state,
    currentCoins: state.currentCoins - reward.coinCost,
    rewards: {
      ...state.rewards,
      [rewardId]: {
        ...reward,
        timesUsed: (reward.timesUsed || 0) + 1,
      },
    },
  };
};

/**
 * Adds a new custom reward to the store with timesUsed initialized to 0.
 */
export const addRewardMutation = (
  state: AppState,
  description: string,
  coinCost: number,
): AppState => {
  if (!description.trim()) return state;

  const newReward: Reward = {
    id: `rew-${Date.now()}`,
    description: description.trim(),
    coinCost: Math.max(0, coinCost),
    timesUsed: 0,
  };

  return {
    ...state,
    rewards: { ...state.rewards, [newReward.id]: newReward },
  };
};

/**
 * Updates an existing reward's description, coinCost, or timesUsed.
 */
export const updateRewardMutation = (
  state: AppState,
  rewardId: string,
  updates: Partial<Omit<Reward, "id">>,
): AppState => {
  return {
    ...state,
    rewards: {
      ...state.rewards,
      [rewardId]: {
        ...state.rewards[rewardId],
        ...updates,
      },
    },
  };
};

/**
 * Deletes a reward by its ID.
 */
export const deleteRewardMutation = (
  state: AppState,
  rewardId: string,
): AppState => {
  const validRewards = state.rewards;
  delete validRewards[rewardId];
  return {
    ...state,
    rewards: validRewards,
  };
};

/**
 * Resets the `timesUsed` counter back to 0 for all rewards in the store.
 */
export const zeroOutRewardsMutation = (state: AppState): AppState => {
  const updatedRewards = Object.fromEntries(
    Object.entries(state.rewards).map(([rewId, reward]) => [
      rewId,
      { ...reward, timesUsed: 0 },
    ]),
  );
  return {
    ...state,
    rewards: updatedRewards,
  };
};
