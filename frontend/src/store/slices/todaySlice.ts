// todaySlice.ts
import type { StateCreator } from "zustand";
import type { RootStore, TodaySlice} from "../../types/store";



export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const createTodaySlice: StateCreator<
  RootStore,
  [],
  [],
  TodaySlice
> = (set, get) => ({
  todaySchedule: {
    date: getTodayDateString(),
    blocks: [],
  },

  checkAndResetDaySchedule: () => {
    const today = getTodayDateString();
    const currentSchedule = get().todaySchedule;

    // If day changed (current day is strictly post the stored date)
    if (currentSchedule.date < today) {
      set({
        todaySchedule: {
          date: today,
          blocks: [],
        },
      });
    }
  },

  addScheduleBlock: (timeBegin, timeEnd, taskIds) => {
    set((state) => {
      const newBlock = {
        id: `block-${Date.now()}`,
        timeBegin,
        timeEnd,
        taskIds,
      };

      // Keep blocks strictly sorted by start time
      const nextBlocks = [...state.todaySchedule.blocks, newBlock].sort((a, b) =>
        a.timeBegin.localeCompare(b.timeBegin)
      );

      return {
        todaySchedule: {
          ...state.todaySchedule,
          blocks: nextBlocks,
        },
      };
    });
  },

  updateScheduleBlock: (blockId, timeBegin, timeEnd, taskIds) => {
  set((state) => {
    const updatedBlocks = state.todaySchedule.blocks
      .map((block) =>
        block.id === blockId
          ? { ...block, timeBegin, timeEnd, taskIds }
          : block
      )
      .sort((a, b) => a.timeBegin.localeCompare(b.timeBegin));

    return {
      todaySchedule: {
        ...state.todaySchedule,
        blocks: updatedBlocks,
      },
    };
  });
},

  deleteScheduleBlock: (blockId) => {
    set((state) => ({
      todaySchedule: {
        ...state.todaySchedule,
        blocks: state.todaySchedule.blocks.filter((b) => b.id !== blockId),
      },
    }));
  },

  addTaskToBlock: (blockId, taskId) => {
    set((state) => ({
      todaySchedule: {
        ...state.todaySchedule,
        blocks: state.todaySchedule.blocks.map((block) =>
          block.id === blockId && !block.taskIds.includes(taskId)
            ? { ...block, taskIds: [...block.taskIds, taskId] }
            : block
        ),
      },
    }));
  },

  removeTaskFromBlock: (blockId, taskId) => {
    set((state) => ({
      todaySchedule: {
        ...state.todaySchedule,
        blocks: state.todaySchedule.blocks.map((block) =>
          block.id === blockId
            ? { ...block, taskIds: block.taskIds.filter((id) => id !== taskId) }
            : block
        ),
      },
    }));
  },
});