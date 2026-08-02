// --- 1. TASK & PROJECT TYPES ---

export interface Task {
  id: string;
  parentId: string | null; // null indicates this Task IS a top-level Project!
  description: string;
  isCompleted: boolean;
  subTaskIds: string[]; // Child tasks
  baseCoinValue: number; // Only used if subTaskIds.length === 0 (leaf task)
}

export type TaskMap = Record<string, Task>;

// --- 2. REWARD TYPES ---

export interface Reward {
  id: string;
  description: string;
  coinCost: number;
  timesUsed: number;
}
export type RewardMap = Record<string, Reward>;

export type PageType = "PROJECT" | "REWARDS";

export type ThemeMode = 'light' | 'dark';

export interface DisplayState {
  activePageType: PageType
  activePageId: string
  expandedTasks: string[]
  theme: ThemeMode
}

// --- 3. GLOBAL APP STATE ---

export interface AppState {
  tasks: TaskMap;
  projectIds: string[];
  rewards: RewardMap;
  currentCoins: number;
  displayState: DisplayState;
  // activeProjectId: string | null; // null can represent the Rewards Store view
}