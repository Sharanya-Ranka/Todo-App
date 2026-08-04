import type { TaskMap, AppState, AppStateV1} from "../types";
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
     const processed_state =  saved ? JSON.parse(saved) : INITIAL_APP_STATE;
     if (!processed_state.schema || processed_state.schema === 1) {
    return convertSchemav1ToSchemav2(processed_state as AppStateV1);
  }
      return processed_state;
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


const convertSchemav1ToSchemav2 = (oldState: AppStateV1): AppState => {
  const newState: AppState = {
    schema: 2,
    displayState: oldState.displayState,
    currentCoins: oldState.currentCoins,
    projectIds: oldState.projectIds,
    rewards: oldState.rewards,
    tasks: Object.fromEntries(
      Object.entries(oldState.tasks).map(([taskId, task]) => {
        const newTask = {
          baseCoinValue: task.baseCoinValue,
          countCompleted: task.isCompleted ? 1 : 0,
          description: task.description,
          id: task.id,
          parentId: task.parentId,
          subTaskIds: task.subTaskIds,
          taskType: "ONCE" as const, // Defaulting to "ONCE" for all tasks in schema v1
        };
        return [taskId, newTask];
      })
    ),
  };
  return newState;
};