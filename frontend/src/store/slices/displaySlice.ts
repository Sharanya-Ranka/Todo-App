import type { StateCreator } from 'zustand';
import type { RootStore, DisplaySlice } from '../../types/store';
import type { ThemeMode, ActivePageType } from '../../types/display';

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('coindo_theme', theme);
  }
};

const getInitialTheme = (): ThemeMode => {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('coindo_theme') as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      applyThemeToDOM(stored);
      return stored;
    }
  }
  return 'light';
};

export const createDisplaySlice: StateCreator<
  RootStore,
  [],
  [],
  DisplaySlice
> = (set) => ({
  displayState: {
    theme: getInitialTheme(),
    activePageType: 'ALL_TASKS',
    activePageId: null,
    expandedTasks: [],
  },

  toggleTheme: () => {
    set((state) => {
      const currentTheme = state.displayState.theme || 'light';
      const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';

      applyThemeToDOM(newTheme);

      return {
        displayState: {
          ...state.displayState,
          theme: newTheme,
        },
      };
    });
  },

  toggleExpandTask: (taskId: string) => {
    set((state) => {
      const currentExpanded = state.displayState.expandedTasks;
      const isAlreadyExpanded = currentExpanded.includes(taskId);

      const nextExpanded = isAlreadyExpanded
        ? currentExpanded.filter((id) => id !== taskId)
        : [...currentExpanded, taskId];

      return {
        displayState: {
          ...state.displayState,
          expandedTasks: nextExpanded,
        },
      };
    });
  },

  handleChangeActivePage: (pageType: ActivePageType, pageId: string | null) => {
    set((state) => ({
      displayState: {
        ...state.displayState,
        activePageType: pageType,
        activePageId: pageId,
      },
    }));
  },
});