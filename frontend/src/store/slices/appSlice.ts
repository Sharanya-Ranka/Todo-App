import type { StateCreator } from "zustand";
import type { RootStore, AppSlice } from "../../types/store";

export const createAppSlice: StateCreator<
  RootStore,
  [],
  [],
  AppSlice
> = (set) => ({
  schema: 3,
  isHydrated: false,

  setHydrated: (state: boolean) => {
    set({ isHydrated: state });
  },

  resetAllData: () => {
    set({
      taskMap: {},
      rewardsMap: {},
      currentCoins: 0,
      displayState: {
        theme: "light",
        activePageType: "ALL_TASKS",
        activePageId: null,
        expandedTasks: [],
      },
      isHydrated: true,
    });
  },
});