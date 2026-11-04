import type { DisplayState } from './display';
import type { RewardMap } from './reward';
import type {TaskMapV3} from './task';
import type { TaskMapV1, TaskMapV2 } from '../types';


// --- 3. GLOBAL APP STATE ---
export interface AppStateV1 {
  schema: number; // For future-proofing state migrations
  tasks: TaskMapV1;
  projectIds: string[];
  rewards: RewardMap;
  currentCoins: number;
  displayState: DisplayState;
}

export interface AppStateV2 {
  schema: number; // For future-proofing state migrations
  tasks: TaskMapV2;
  projectIds: string[];
  rewards: RewardMap;
  currentCoins: number;
  displayState: DisplayState;
  // activeProjectId: string | null; // null can represent the Rewards Store view
}

export interface AppStateV3 {
  schema: number; // For future-proofing state migrations
  taskMap: TaskMapV3;
  rewardsMap: RewardMap;
  currentCoins: number;
  displayState: DisplayState;
}