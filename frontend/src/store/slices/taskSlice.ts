import type { StateCreator } from "zustand";
import type { RootStore, TaskSlice } from "../../types/store";
import type { TaskMapV3, TaskV3 } from "../../types/task";

export const createTaskSlice: StateCreator<RootStore, [], [], TaskSlice> = (
  set,
  get,
) => ({
  taskMap: {},

  onAddSubtask: (parentId, description, notes, coinValue, taskType) => {
    set((state) => {
      const parentTask = state.taskMap[parentId];
      if (!parentTask) {
        console.warn(`Parent task with ID ${parentId} not found.`);
        return state;
      }

      const newId = `task-${Date.now()}`;
      const newTask: TaskV3 = {
        id: newId,
        parentId,
        description,
        notes,
        taskType,
        coinValue,
        countCompleted: 0,
        subTaskIds: [],
        isArchived: false,
        hasArchivedDependants: false,
      };

      // Shallow copy the map for immutable updates
      const updatedTaskMap: TaskMapV3 = {
        ...state.taskMap,
        [newId]: newTask,
      };

      // 1. Update the immediate parent: register child ID and increment coins
      const parent = updatedTaskMap[parentId];
      const coinValues = parent.subTaskIds.map((id) => {
          const sub = updatedTaskMap[id];
          return sub ? sub.coinValue : 0;
        });

      updatedTaskMap[parentId] = {
        ...parentTask,
        subTaskIds: [...parentTask.subTaskIds, newId],
        coinValue: coinValues.reduce((acc, val) => acc + val, coinValue), // Sum of all subtask coins including the new one
        countCompleted: 0,
      };

      // 2. Traverse up the ancestor chain to update coin values to the root
      let currentAncestorId = parentTask.parentId;

      while (currentAncestorId !== null) {
        const ancestor = updatedTaskMap[currentAncestorId];
        const coinValues = ancestor.subTaskIds.map((id) => {
          const sub = updatedTaskMap[id];
          return sub ? sub.coinValue : 0;
        });
        if (!ancestor) break;

        updatedTaskMap[currentAncestorId] = {
          ...ancestor,
          coinValue: coinValues.reduce((acc, val) => acc + val, 0),
          countCompleted: 0, // Reset countCompleted for ancestors since a new subtask is added
        };

        currentAncestorId = ancestor.parentId;
      }

      return { taskMap: updatedTaskMap };
    });
  },
  onUpdateTaskLocally: (id, key, value) => {
    set((state) => {
      const existingTask = state.taskMap[id];
      if (!existingTask) {
        console.warn(`Task with ID ${id} not found.`);
        return state;
      }

      // No-op if value is identical
      if (existingTask[key] === value) {
        return state;
      }

      return {
        taskMap: {
          ...state.taskMap,
          [id]: {
            ...existingTask,
            [key]: value,
          },
        },
      };
    });
  },
  modifyTaskCoins: (taskId: string, newCoins: number) => {
    set((state) => {
      const target = state.taskMap[taskId];
      if (!target) return state;

      const diff = newCoins - target.coinValue;
      if (diff === 0) return state;

      const updatedTaskMap = { ...state.taskMap };

      // 1. Update target task
      updatedTaskMap[taskId] = {
        ...target,
        coinValue: newCoins,
      };

      // 2. Bubble coin difference up to all ancestors
      let currentAncestorId = target.parentId;
      while (currentAncestorId !== null) {
        const ancestor = updatedTaskMap[currentAncestorId];
        if (!ancestor) break;

        updatedTaskMap[currentAncestorId] = {
          ...ancestor,
          coinValue: ancestor.coinValue + diff,
        };

        currentAncestorId = ancestor.parentId;
      }

      return { taskMap: updatedTaskMap };
    });
  },

  modifyCountCompleted: (taskId: string, delta: 1 | -1) => {
    set((state) => {
      const target = state.taskMap[taskId];
      if (!target) return state;

      // Guard: calculate new count for the target task
      const nextCount = target.countCompleted + delta;
      if (nextCount < 0) return state;
      if (target.taskType === "ONCE" && nextCount > 1) return state;
      if (nextCount === target.countCompleted) return state;

      // Reject updates to non-leaf tasks
      if (target.subTaskIds.length > 0) return state;

      const updatedTaskMap = { ...state.taskMap };
      // Update total coins when task is completed / completion was reversed
      // Only leaf tasks can contribute to currentCoins (else this will result in multiple counting when compleing
      // a parent adds further to the total)
      const deltaCoins =
        target.subTaskIds.length === 0 ? delta * target.coinValue : 0;

      // 1. Update target task
      updatedTaskMap[taskId] = {
        ...target,
        countCompleted: nextCount,
      };

      // 2. Bubble up completion changes through the ancestor tree
      let currentAncestorId = target.parentId;

      while (currentAncestorId !== null) {
        const ancestor = updatedTaskMap[currentAncestorId];
        if (!ancestor) break;

        // Calculate new countCompleted based on minimum of all direct subtasks
        let calculatedCount = 0;

        if (ancestor.subTaskIds.length > 0) {
          const subCounts = ancestor.subTaskIds.map((id) => {
            const sub = updatedTaskMap[id];
            return sub ? sub.countCompleted : 0;
          });

          const minSubCount = Math.min(...subCounts);
          calculatedCount =
            ancestor.taskType === "ONCE"
              ? Math.min(1, Math.max(0, minSubCount))
              : Math.max(0, minSubCount);
        }

        // If the ancestor's count doesn't change, ancestors above it won't change either
        if (ancestor.countCompleted === calculatedCount) {
          break;
        }

        updatedTaskMap[currentAncestorId] = {
          ...ancestor,
          countCompleted: calculatedCount,
        };

        currentAncestorId = ancestor.parentId;
      }

      return {
        taskMap: updatedTaskMap,
        currentCoins: get().currentCoins + deltaCoins,
      };
    });
  },
  toggleArchived: (taskId: string) => {
    set((state) => {
      const target = state.taskMap[taskId];
      if (!target) return state;

      const nextArchived = !target.isArchived;
      const updatedTaskMap = { ...state.taskMap };

      const targetHasArchivedDependants = nextArchived
        ? target.subTaskIds.length > 0
        : false;

      // 1. Update the target task
      updatedTaskMap[taskId] = {
        ...target,
        isArchived: nextArchived,
        hasArchivedDependants: targetHasArchivedDependants,
      };

      
      // 2. Bubble down to set all descendants' isArchived to nextArchived
      // Do this only for non-project tasks (tasks that have a parent)
      // It "feels right" for projects to not have this feature, but for any descendants to have this feature.

      if(target.parentId !== null){

        const queue = [...target.subTaskIds];
        
        while (queue.length > 0) {
          const childId = queue.shift()!;
          const child = updatedTaskMap[childId];
          if (!child) continue;
          
          const hasChildren = child.subTaskIds.length > 0;
          
          updatedTaskMap[childId] = {
            ...child,
            isArchived: nextArchived,
            // When archiving, any non-leaf node's dependants are archived.
            // When unarchiving, all descendents are cleared.
            hasArchivedDependants: nextArchived ? hasChildren : false,
          };
          
          if (hasChildren) {
            queue.push(...child.subTaskIds);
          }
        }
      }
      
      // 3. Bubble up to recalculate hasArchivedDependants on all ancestors
      let currentAncestorId = target.parentId;
      while (currentAncestorId !== null) {
        const ancestor = updatedTaskMap[currentAncestorId];
        if (!ancestor) break;

        // Ancestor has archived dependants if ANY direct subtask is archived
        // OR has archived dependants of its own
        const hasArchivedChild = ancestor.subTaskIds.some((childId) => {
          const child = updatedTaskMap[childId];
          return child
            ? child.isArchived || child.hasArchivedDependants
            : false;
        });

        if (ancestor.hasArchivedDependants === hasArchivedChild) {
          break; // No state change; further ancestor values remain identical
        }

        updatedTaskMap[currentAncestorId] = {
          ...ancestor,
          hasArchivedDependants: hasArchivedChild,
        };

        currentAncestorId = ancestor.parentId;
      }

      return { taskMap: updatedTaskMap };
    });
  },

  deleteTask: (taskId: string) => {
    set((state) => {
      const target = state.taskMap[taskId];
      if (!target) return state;

      const updatedTaskMap = { ...state.taskMap };
      const removedCoinValue = target.coinValue;
      const parentId = target.parentId;

      // 1. Collect all descendant IDs (BFS/DFS) for deletion
      const idsToDelete: string[] = [];
      const queue = [taskId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        idsToDelete.push(currentId);
        const node = updatedTaskMap[currentId];
        if (node && node.subTaskIds.length > 0) {
          queue.push(...node.subTaskIds);
        }
      }

      // 2. Delete all collected nodes from the map
      idsToDelete.forEach((id) => {
        delete updatedTaskMap[id];
      });

      // 3. If target has a parent, clean reference and recalculate metrics
      if (parentId !== null && updatedTaskMap[parentId]) {
        const parent = updatedTaskMap[parentId];

        // Remove deleted task id from parent's subTaskIds
        const nextSubTaskIds = parent.subTaskIds.filter((id) => id !== taskId);

        // Recalculate parent's countCompleted
        let nextParentCount = 0;
        if (nextSubTaskIds.length > 0) {
          const subCounts = nextSubTaskIds.map((id) => {
            const sub = updatedTaskMap[id];
            return sub ? sub.countCompleted : 0;
          });
          const minCount = Math.min(...subCounts);
          nextParentCount =
            parent.taskType === "ONCE"
              ? Math.min(1, Math.max(0, minCount))
              : Math.max(0, minCount);
        }

        // Recalculate parent's hasArchivedDependants
        const nextParentHasArchived = nextSubTaskIds.some((id) => {
          const child = updatedTaskMap[id];
          return child
            ? child.isArchived || child.hasArchivedDependants
            : false;
        });

        // Update immediate parent
        updatedTaskMap[parentId] = {
          ...parent,
          subTaskIds: nextSubTaskIds,
          coinValue: parent.coinValue - removedCoinValue,
          countCompleted: nextParentCount,
          hasArchivedDependants: nextParentHasArchived,
        };

        // 4. Bubble changes (coins, countCompleted, hasArchivedDependants) to ancestors above parent
        let currentAncestorId = parent.parentId;
        let prevCountCompletedChanged =
          parent.countCompleted !== nextParentCount;

        while (currentAncestorId !== null) {
          const ancestor = updatedTaskMap[currentAncestorId];
          if (!ancestor) break;

          // Subtract coins removed from the sub-tree
          const nextCoins = ancestor.coinValue - removedCoinValue;

          // Recalculate countCompleted if child's count shifted
          let nextCount = ancestor.countCompleted;
          if (prevCountCompletedChanged && ancestor.subTaskIds.length > 0) {
            const subCounts = ancestor.subTaskIds.map((id) => {
              const sub = updatedTaskMap[id];
              return sub ? sub.countCompleted : 0;
            });
            const minCount = Math.min(...subCounts);
            nextCount =
              ancestor.taskType === "ONCE"
                ? Math.min(1, Math.max(0, minCount))
                : Math.max(0, minCount);
          }

          prevCountCompletedChanged = ancestor.countCompleted !== nextCount;

          // Recalculate hasArchivedDependants
          const nextHasArchived = ancestor.subTaskIds.some((id) => {
            const child = updatedTaskMap[id];
            return child
              ? child.isArchived || child.hasArchivedDependants
              : false;
          });

          updatedTaskMap[currentAncestorId] = {
            ...ancestor,
            coinValue: nextCoins,
            countCompleted: nextCount,
            hasArchivedDependants: nextHasArchived,
          };

          currentAncestorId = ancestor.parentId;
        }
      }

      return { taskMap: updatedTaskMap };
    });
  },
});
