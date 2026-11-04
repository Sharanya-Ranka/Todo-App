import type { TaskMap, AppState, AppStateV1, AppStateV2} from "../types";
import { INITIAL_APP_STATE } from "../initialData";
import type { AppStateV3 } from "../types/state";
import type { TaskV3 } from "../types/task";

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


const convertSchemav1ToSchemav2 = (oldState: AppStateV1): AppStateV2 => {
  const newState: AppStateV2 = {
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

const convertSchemav2ToSchemav3 = (oldState: AppStateV2): AppStateV3 => {
  const newState: AppStateV3 = {
    schema: 3,
    rewardsMap: oldState.rewards,
    currentCoins: oldState.currentCoins,
    displayState: oldState.displayState,
    taskMap: Object.fromEntries(
      Object.entries(oldState.tasks).map(([taskId, task]) => {
        const newTask: TaskV3 = {
          id: task.id,
          coinValue: task.baseCoinValue,
          countCompleted: task.countCompleted,
          parentId: task.parentId,
          taskType: task.taskType,
          description: task.description,
          hasArchivedDependants: false,
          isArchived: false,
          subTaskIds: task.subTaskIds,
          notes: task.notes ?? "",
        };

        return [taskId, newTask]
      })
    ),
  }

  console.log("Returning", newState);

  return newState;
}

export const migrateToLatest = (stateString: string): string | null => {
  try{
    let jsonState = JSON.parse(stateString);
    console.log(jsonState);
    console.log(jsonState.schema);
    if( jsonState.schema !== undefined && jsonState.schema === 1){
      jsonState = convertSchemav1ToSchemav2(jsonState as AppStateV1);
    }
    if( jsonState.schema !== undefined && jsonState.schema === 2){
      jsonState = convertSchemav2ToSchemav3(jsonState as AppStateV2);
    }

    // console.log("State is", jsonState);

    return JSON.stringify(jsonState);
  } catch (err) {
    console.error("Failed to convert state to latest version", err);
    return null
  }

}

export const ensureConsistency = (state: AppStateV3): AppStateV3 => {
  const { taskMap } = state;
  if (!taskMap || Object.keys(taskMap).length === 0) {
    return state;
  }

  // 1. Shallow copy the taskMap for immutable updates
  const nextTaskMap: Record<string, TaskV3> = {};
  for (const [id, task] of Object.entries(taskMap)) {
    nextTaskMap[id] = { ...task };
  }

  // 2. Compute depth from the top (roots = 0) to sort bottom-up
  const depthMemo = new Map<string, number>();

  const getDepth = (taskId: string, visited = new Set<string>()): number => {
    if (depthMemo.has(taskId)) {
      return depthMemo.get(taskId)!;
    }
    // Prevent infinite loops if circular references exist
    if (visited.has(taskId)) {
      return 0;
    }
    visited.add(taskId);

    const task = nextTaskMap[taskId];
    if (!task || task.parentId === null) {
      depthMemo.set(taskId, 0);
      return 0;
    }

    const depth = 1 + getDepth(task.parentId, visited);
    depthMemo.set(taskId, depth);
    return depth;
  };

  // 3. Sort all task IDs by depth descending (deepest leaves first)
  const taskIdsSorted = Object.keys(nextTaskMap).sort(
    (a, b) => getDepth(b) - getDepth(a)
  );

  // 4. Traverse from leaves to root, aggregating metrics onto parents
  for (const taskId of taskIdsSorted) {
    const task = nextTaskMap[taskId];
    if (!task) continue;

    // Filter valid direct children present in the taskMap
    const validChildren = (task.subTaskIds || [])
      .map((childId) => nextTaskMap[childId])
      .filter((child): child is TaskV3 => child !== undefined);

    // If it's a leaf node, preserve its own base values (subject to ONCE bounds)
    if (validChildren.length === 0) {
      const boundedCompleted =
        task.taskType === "ONCE"
          ? Math.min(1, Math.max(0, task.countCompleted))
          : Math.max(0, task.countCompleted);

      nextTaskMap[taskId] = {
        ...task,
        countCompleted: boundedCompleted,
        hasArchivedDependants: false,
      };
      continue;
    }

    // --- AGGREGATIONS FOR PARENT NODES ---

    // coinValue: Sum of children's coin values
    const aggregatedCoinValue = validChildren.reduce(
      (sum, child) => sum + (child.coinValue || 0),
      0
    );

    // countCompleted: Minimum of children's completion counts (bounded to 1 if ONCE)
    const minChildCompleted = Math.min(
      ...validChildren.map((child) => child.countCompleted)
    );
    const aggregatedCountCompleted =
      task.taskType === "ONCE"
        ? Math.min(1, Math.max(0, minChildCompleted))
        : Math.max(0, minChildCompleted);

    // hasArchivedDependants: True if any child is archived OR has archived dependants
    const aggregatedHasArchivedDependants = validChildren.some(
      (child) => child.isArchived || child.hasArchivedDependants
    );

    nextTaskMap[taskId] = {
      ...task,
      coinValue: aggregatedCoinValue,
      countCompleted: aggregatedCountCompleted,
      hasArchivedDependants: aggregatedHasArchivedDependants,
    };
  }

  return {
    ...state,
    taskMap: nextTaskMap,
  };
};