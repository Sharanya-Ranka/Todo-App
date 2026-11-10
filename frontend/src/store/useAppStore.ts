import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RootStore } from "../types/store";
import { indexedDbStorage } from "../scripts/indexedDbStorage";
import { createTaskSlice } from "./slices/taskSlice";
import { createRewardSlice } from "./slices/rewardSlice";
import { createDisplaySlice } from "./slices/displaySlice";
import { createAppSlice } from "./slices/appSlice.ts";
import { createTodaySlice } from "./slices/todaySlice.ts";

export const useAppStore = create<RootStore>()(
  persist(
    (...args) => ({
      ...createTaskSlice(...args),
      ...createRewardSlice(...args),
      ...createDisplaySlice(...args),
      ...createAppSlice(...args),
      ...createTodaySlice(...args)
    }),
    {
      name: "coindo-app-root-state",
      storage: createJSONStorage(() => indexedDbStorage),
      // Select keys to persist in IndexedDB
      partialize: (state) => ({
        schema: state.schema,
        taskMap: state.taskMap,
        rewardsMap: state.rewardsMap,
        currentCoins: state.currentCoins,
        displayState: state.displayState,
        todaySchedule: state.todaySchedule,
      }),
      onRehydrateStorage: () => (state) => {
        // console.log("Rehydrated state is", state);
        if (state) {
          state.setHydrated(true);

          // Synchronize DOM with the rehydrated theme
          if (typeof document !== "undefined") {
            if (state.displayState.theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        }
      },
    }
  )
);