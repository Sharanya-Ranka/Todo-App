export type ThemeMode = 'light' | 'dark';

export type ActivePageType = 'PROJECT' | 'REWARDS' | 'ALL_TASKS' | string;

export interface DisplayState {
  activePageType: ActivePageType
  activePageId: string | null
  expandedTasks: string[]
  theme: ThemeMode
}