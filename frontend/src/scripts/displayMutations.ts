// mutations.ts
import type { AppState, ThemeMode } from '../types';

export const toggleTheme = (state: AppState): AppState => {
  const currentTheme = state.displayState.theme || 'light';
  const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';

  // Sync DOM root class for Tailwind
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Persist preference independently for immediate FOUC script access
  localStorage.setItem('coindo_theme', newTheme);

  return {
    ...state,
    displayState: {
      ...state.displayState,
      theme: newTheme,
    },
  };
};