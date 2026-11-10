import type { ActivePageType, DisplayState } from "./display";
import type { RewardMap, RewardUpdates } from "./reward";
import type { TaskMapV3, TaskType, TaskV3 } from "./task";
import type { TodaySchedule } from "./todaytodo";

export type LocalTaskKey = "description" | "notes" | "taskType";


export interface TaskSlice {
  taskMap: TaskMapV3;
  /**
   * Creates a subtask under a given parent task or project,
   * links it into parent's subTaskIds, and bubbles up coinValue.
   */
  onAddSubtask: (
    parentId: string,
    description: string,
    coinValue: number,
    taskType: TaskType
  ) => void;

  /**
   * Updates fields that do not bubble up or affect tree metrics.
   */
  onUpdateTaskLocally: <K extends LocalTaskKey>(
    id: string,
    key: K,
    value: TaskV3[K]
  ) => void;

  /**
   * Adjusts the coin value of a task and recalculates the difference
   * across all its ancestors up to the root project.
   */
  modifyTaskCoins: (taskId: string, newCoins: number) => void;

  /**
   * Increments (+1) or decrements (-1) countCompleted with type bounds,
   * and recalculates completion counts for all parents up the hierarchy.
   */
  modifyCountCompleted: (taskId: string, delta: 1 | -1) => void;

  /**
   * Toggles the task's archived status and bubbles changes
   * to recalculate `hasArchivedDependants` across all ancestors.
   */
  toggleArchived: (taskId: string) => void;

  /**
   * Recursively removes a task and all its descendants from taskMap,
   * unlinks it from the parent, and updates ancestor coins, completion counts,
   * and archived dependant indicators.
   */
  deleteTask: (taskId: string) => void;
}

export interface RewardSlice {
  rewardsMap: RewardMap;
  currentCoins: number;

  claimReward: (rewardId: string) => void;
  addReward: (description: string, coinCost: number) => void;
  updateReward: (rewardId: string, updates: RewardUpdates) => void;
  deleteReward: (rewardId: string) => void;
  zeroOutRewards: () => void;
}


export interface DisplaySlice {
  displayState: DisplayState;
  toggleTheme: () => void;
  toggleExpandTask: (taskId: string) => void;
  handleChangeActivePage: (pageType: ActivePageType, pageId: string | null) => void;
}

export interface TodaySlice {
  todaySchedule: TodaySchedule;
  checkAndResetDaySchedule: () => void;
  addScheduleBlock: (timeBegin: string, timeEnd: string, taskIds: string[]) => void;
  updateScheduleBlock: (blockId: string, timeBegin: string, timeEnd: string, taskIds: string[]) => void;
  deleteScheduleBlock: (blockId: string) => void;
  addTaskToBlock: (blockId: string, taskId: string) => void;
  removeTaskFromBlock: (blockId: string, taskId: string) => void;
}

export interface AppSlice {
  schema: number;
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
  resetAllData: () => void;
}

export type RootStore = TaskSlice & RewardSlice & DisplaySlice & TodaySlice & AppSlice;