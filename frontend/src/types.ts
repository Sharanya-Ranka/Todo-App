// --- 1. TASK & PROJECT TYPES ---

export type TaskType = "ONCE" | "RECURRING";

export interface TaskV1 {
  id: string;
  parentId: string | null; // null indicates this Task IS a top-level Project!
  description: string;
  isCompleted: boolean;
  subTaskIds: string[]; // Child tasks
  baseCoinValue: number; // Only used if subTaskIds.length === 0 (leaf task)
}

export interface TaskV2 {
  id: string;
  parentId: string | null; // null indicates this Task IS a top-level Project!
  description: string;
  notes?: string;
  taskType: TaskType;
  countCompleted: number;
  subTaskIds: string[]; // Child tasks
  baseCoinValue: number; // Only used if subTaskIds.length === 0 (leaf task)
}

export type TaskMapV2 = Record<string, TaskV2>;
export type TaskMapV1 = Record<string, TaskV1>;

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


export type AppState = AppStateV2;
export type Task = TaskV2;
export type TaskMap = TaskMapV2;