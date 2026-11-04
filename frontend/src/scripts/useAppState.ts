import { useState, useEffect } from 'react';
import { loadAppState, saveAppState } from './utils';
import type { AppState, PageType, Reward, Task, TaskType, ThemeMode } from '../types';

import {
  addTaskMutation,
  deleteTaskMutation,
  createProjectMutation,
  updateTaskMutation,
} from './taskMutations';

import { addRewardMutation, updateRewardMutation, deleteRewardMutation, claimRewardMutation } from './rewardMutations';



export const useAppState = () => {
    
      // 1. Single state initialized safely from storage
      const [state, setState] = useState<AppState>(loadAppState);
    
      useEffect(() => {
          saveAppState(state);
        }, [state]);
    
    
    const handleChangeActivePage = (pageId: string, pageType:PageType) => {
        setState((prev) => {
            return {
                ...prev,
                displayState: {
                    ...prev.displayState,
                    activePageType: pageType,
                    activePageId: pageId
                }
            }
        })
    }
    
      // --- Handlers ---
    
      // Create subtask under parentId
      const handleAddTask = (parentId: string, description: string, coinValue: number, taskType:TaskType) => {
        setState((prev) => addTaskMutation(prev, parentId, description, coinValue, taskType));
      };
    
      // Create a brand new top-level Project
      const handleCreateProject = () => {
        const title = prompt('Enter project title:');
        if (!title) return;
        setState((prev) => createProjectMutation(prev, title));
      };
    
      // Update description or coin value
      const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
        setState((prev) => updateTaskMutation(prev, taskId, updates));
      };
    
      // // Toggle completion & auto-award coins for leaf tasks
      // const handleToggleComplete = (taskId: string, isCompleted: boolean) => {
      //   setState((prev) => toggleCompleteMutation(prev, taskId, isCompleted));
      // };

      const handleToggleExpand = (taskId: string) => {
        const isExpanded = state.displayState.expandedTasks.includes(taskId);
        const nextExpandedTasks = isExpanded
          ? state.displayState.expandedTasks.filter((id) => id !== taskId)
          : [...state.displayState.expandedTasks, taskId];

        setState((prev) => ({
          ...prev,
          displayState: {
            ...prev.displayState,
            expandedTasks: nextExpandedTasks,
          },
        }));
      }
    
      const handleDeleteTask = (taskId: string) => {
      setState(prev => deleteTaskMutation(prev, taskId));
    };
    
    const handleClaimReward = (rewardId: string) => {
    //   if (state.currentCoins < state.rewards[rewardId].coinCost) {
    //     alert('⚠️ Not enough coins to redeem this reward!');
    //     return;
    //   }
      setState((prev) => claimRewardMutation(prev, rewardId))
    
      // alert('🎁 Reward claimed successfully!');
    };
    
    const handleAddReward = (description: string, coinCost: number) => {
      setState((prev) => addRewardMutation(prev, description, coinCost))
    };
    
    const handleUpdateReward = (rewardId: string, updates: Partial<Omit<Reward, "id">>) => {
      setState((prev) => updateRewardMutation(prev, rewardId, updates))
    }
    
    const handleDeleteReward = (rewardId: string) => {
      setState((prev) => deleteRewardMutation(prev, rewardId))
    }

    useEffect(() => {
        const root = document.documentElement; // <html> element

        if (state.displayState.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // console.log('Theme updated to:', state.displayState.theme);

        // Optional: Persist user choice separately if index.html reads from localStorage
        localStorage.setItem('theme', state.displayState.theme);
        }, [state.displayState.theme]);

    const handleToggleTheme = () => {
        console.log('Toggling theme...');
        const newTheme: ThemeMode = state.displayState.theme === 'light' ? 'dark' : 'light';
      setState((prev) => ({
        ...prev,
        displayState: {
          ...prev.displayState,
          theme: newTheme,
        },
      }));
    }



    return {
        state,
        handleChangeActivePage,

        handleAddTask,
        handleCreateProject,
        handleUpdateTask,
        handleDeleteTask,

        // handleToggleComplete,
        handleToggleExpand,
        handleAddReward,
        handleUpdateReward,
        handleClaimReward,
        handleDeleteReward,
        handleToggleTheme,
    }
}