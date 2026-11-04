
export interface Reward {
  id: string;
  description: string;
  coinCost: number;
  timesUsed: number;
}
export type RewardMap = Record<string, Reward>;
export type RewardUpdates = Partial<Omit<Reward, "id">>;