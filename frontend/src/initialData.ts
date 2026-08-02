// initialData.ts
import type { Task, RewardMap, AppState } from './types';

// export const INITIAL_TASKS: Record<string, Task> = {
//   // --- PROJECT 1: Launch Website ---
//   'proj-1': {
//     id: 'proj-1',
//     parentId: null,
//     description: '🚀 Launch Portfolio Website',
//     isCompleted: false,
//     subTaskIds: ['task-1', 'task-2'],
//     baseCoinValue: 0,
//   },
//   'task-1': {
//     id: 'task-1',
//     parentId: 'proj-1',
//     description: 'Design UI in Figma',
//     isCompleted: false,
//     subTaskIds: ['task-1-1', 'task-1-2'],
//     baseCoinValue: 0,
//   },
//   'task-1-1': {
//     id: 'task-1-1',
//     parentId: 'task-1',
//     description: 'Create Dark Mode palette',
//     isCompleted: true,
//     subTaskIds: [],
//     baseCoinValue: 15,
//   },
//   'task-1-2': {
//     id: 'task-1-2',
//     parentId: 'task-1',
//     description: 'Design Mobile Layouts',
//     isCompleted: false,
//     subTaskIds: [],
//     baseCoinValue: 25,
//   },
//   'task-2': {
//     id: 'task-2',
//     parentId: 'proj-1',
//     description: 'Frontend Development',
//     isCompleted: false,
//     subTaskIds: ['task-2-1'],
//     baseCoinValue: 0,
//   },
//   'task-2-1': {
//     id: 'task-2-1',
//     parentId: 'task-2',
//     description: 'Setup React + Tailwind CSS',
//     isCompleted: true,
//     subTaskIds: [],
//     baseCoinValue: 20,
//   },

//   // --- PROJECT 2: Health & Fitness ---
//   'proj-2': {
//     id: 'proj-2',
//     parentId: null,
//     description: '💪 Health & Fitness Goal',
//     isCompleted: false,
//     subTaskIds: ['task-3'],
//     baseCoinValue: 0,
//   },
//   'task-3': {
//     id: 'task-3',
//     parentId: 'proj-2',
//     description: 'Weekly Workout Routine',
//     isCompleted: false,
//     subTaskIds: ['task-3-1', 'task-3-2'],
//     baseCoinValue: 0,
//   },
//   'task-3-1': {
//     id: 'task-3-1',
//     parentId: 'task-3',
//     description: 'Run 5km on Tuesday',
//     isCompleted: false,
//     subTaskIds: [],
//     baseCoinValue: 30,
//   },
//   'task-3-2': {
//     id: 'task-3-2',
//     parentId: 'task-3',
//     description: '30 min Strength Training',
//     isCompleted: false,
//     subTaskIds: [],
//     baseCoinValue: 20,
//   },
// };

// export const INITIAL_REWARDS: RewardMap = [
//   { id: 'rew-1', description: '🎮 1 Hour Gaming Session', coinCost: 30 },
//   { id: 'rew-2', description: '☕ Specialty Coffee Treat', coinCost: 50 },
//   { id: 'rew-3', description: '🎬 Watch a Movie', coinCost: 80 },
// ];


export const SEED_TASKS: Record<string, Task> = {
  // --- PROJECT 1: Launch Website ---
  'proj-1': {
    id: 'proj-1',
    parentId: null,
    description: 'Project1',
    isCompleted: false,
    subTaskIds: [],
    baseCoinValue: 0,
  }
};

export const SEED_REWARDS: RewardMap = {
  'rew-1' : { id: 'rew-1', description: 'Reward1', coinCost: 30, timesUsed: 0 },
};

export const INITIAL_APP_STATE : AppState = {
    tasks: SEED_TASKS,
    rewards: SEED_REWARDS,
    projectIds: ['proj-1'],
    currentCoins: 0,
    displayState: {
        activePageType: "PROJECT",
        activePageId: 'proj-1',
        expandedTasks: [],
        theme: 'dark',
    },
};