import type { AppState, Task } from '../types';

export const addTaskMutation = (
  state: AppState,
  parentId: string,
  description: string,
  coinValue: number
): AppState => {
  const newTaskId = `task-${Date.now()}`;
  const newTask: Task = {
    id: newTaskId,
    parentId,
    description,
    isCompleted: false,
    subTaskIds: [],
    baseCoinValue: coinValue,
  };

  return {
    ...state,
    tasks: {
      ...state.tasks,
      [newTaskId]: newTask,
      [parentId]: {
        ...state.tasks[parentId],
        subTaskIds: [...state.tasks[parentId].subTaskIds, newTaskId],
      },
    },
  };
};

export const deleteTaskMutation = (state: AppState, taskId: string): AppState => {
  const targetTask = state.tasks[taskId];
  if (!targetTask) return state;

  const collectIdsToDelete = (id: string): string[] => {
    const item = state.tasks[id];
    if (!item) return [];
    return [id, ...item.subTaskIds.flatMap(collectIdsToDelete)];
  };

  const idsToDelete = new Set(collectIdsToDelete(taskId));
  const nextTasks = { ...state.tasks };

  const parentId = targetTask.parentId;
  if (parentId && nextTasks[parentId]) {
    nextTasks[parentId] = {
      ...nextTasks[parentId],
      subTaskIds: nextTasks[parentId].subTaskIds.filter((id) => id !== taskId),
    };
  }

  idsToDelete.forEach((id) => delete nextTasks[id]);

  const isRootProject = targetTask.parentId === null;
  const nextProjectIds = isRootProject
    ? state.projectIds.filter((id) => id !== taskId)
    : state.projectIds;

    if( state.displayState.activePageType === "PROJECT" &&
    state.displayState.activePageId === taskId ){
        const nextActivePageId = nextProjectIds[0];
        return {
            ...state,
            tasks: nextTasks,
            projectIds: nextProjectIds,
            displayState: {...state.displayState, activePageId: nextActivePageId},
        };

    }

  return {
    ...state,
    tasks: nextTasks,
    projectIds: nextProjectIds,
  };
};


/**
 * Creates a new top-level project (which is a Task with parentId === null)
 * and sets it as the currently active project.
 */
export const createProjectMutation = (
  state: AppState,
  title: string
): AppState => {
  if (!title.trim()) return state;

  const newProjId = `proj-${Date.now()}`;
  const newProjectTask: Task = {
    id: newProjId,
    parentId: null,
    description: title.trim(),
    isCompleted: false,
    subTaskIds: [],
    baseCoinValue: 0,
  };

  return {
    ...state,
    tasks: {
      ...state.tasks,
      [newProjId]: newProjectTask,
    },
    projectIds: [...state.projectIds, newProjId],
    displayState: {...state.displayState, activePageId: newProjId},
  };
};

/**
 * Updates a task's description, baseCoinValue, or any partial properties.
 */
export const updateTaskMutation = (
  state: AppState,
  taskId: string,
  updates: Partial<Task>
): AppState => {
  const targetTask = state.tasks[taskId];
  if (!targetTask) return state;

  let coinDelta = 0;

  if (targetTask.subTaskIds.length === 0 && "baseCoinValue" in updates) {
      const newBaseCoinValue = updates.baseCoinValue || 0;
      coinDelta = targetTask.isCompleted
      ? newBaseCoinValue - targetTask.baseCoinValue
      : 0; // Allow negative balances
    }
    

  return {
    ...state,
    tasks: {
      ...state.tasks,
      [taskId]: {
        ...targetTask,
        ...updates,
      },
    },
    currentCoins: state.currentCoins + coinDelta,
  };
};

/**
 * Toggles a task's completion status.
 * If the task is a leaf node (has 0 subtasks), auto-adjusts the user's current coin balance.
 */
export const toggleCompleteMutation = (
  state: AppState,
  taskId: string,
  isCompleted: boolean
): AppState => {
  const task = state.tasks[taskId];
  if (!task) return state;

  let newCoins = state.currentCoins;

  // Award or deduct coins ONLY if it's a leaf task (subTaskIds.length === 0)
  if (task.subTaskIds.length === 0) {
    const coinDelta = task.baseCoinValue || 0;
    newCoins = isCompleted
      ? state.currentCoins + coinDelta
      : state.currentCoins - coinDelta; // Allow negative balances
  }

  return {
    ...state,
    currentCoins: newCoins,
    tasks: {
      ...state.tasks,
      [taskId]: {
        ...task,
        isCompleted,
      },
    },
  };
};