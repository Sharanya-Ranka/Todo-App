import type { TaskMap, AppState} from "../types";
import { INITIAL_APP_STATE } from "../initialData";

/**
 * Calculates total coin value recursively.
 * If a task has no subtasks, return its baseCoinValue.
 * Otherwise, return the sum of all its children's calculated values.
 */
export const calculateTaskCoins = (taskId: string, tasks: TaskMap): number => {
  const task = tasks[taskId];
  if (!task) return 0;
  if (task.subTaskIds.length === 0) return task.baseCoinValue || 0;

  return task.subTaskIds.reduce(
    (acc, childId) => acc + calculateTaskCoins(childId, tasks),
    0
  );
};


// storage.ts
const LOCAL_STORAGE_KEY = 'coindo_app_state_v1';
export const loadAppState = (): AppState => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_APP_STATE;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return INITIAL_APP_STATE;
  }
};

export const saveAppState = (state: AppState) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
};