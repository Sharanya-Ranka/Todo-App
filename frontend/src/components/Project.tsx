import React, { useState } from 'react';
import type { DisplayState, Task, TaskMap } from '../types';
import { calculateTaskCoins } from '../scripts/utils';
import { TaskItem } from './TaskItem';

interface ProjectProps {
  projectTask: Task; // The root Task object representing the project
  tasks: TaskMap;     // Dictionary containing all tasks in the app
  displayState: DisplayState; // Current display state of the app
  onAddTask: (parentId: string, description: string, coinValue: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string, isCompleted: boolean) => void;
  onToggleExpand: (taskId: string) => void; // New prop for toggling task expansion
}

export const Project: React.FC<ProjectProps> = ({
  projectTask,
  tasks,
  displayState,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onToggleExpand,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(projectTask.description);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCoins, setNewTaskCoins] = useState(10);

  const totalProjectCoins = calculateTaskCoins(projectTask.id, tasks);

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;
    onUpdateTask(projectTask.id, { description: projectTitle.trim() });
    setIsEditingTitle(false);
  };

  const handleCreateRootTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;
    onAddTask(projectTask.id, newTaskDesc.trim(), Number(newTaskCoins));
    setNewTaskDesc('');
    setNewTaskCoins(10);
    setIsAddingTask(false);
  };

  return (
  <div className="max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
    {/* Project Header */}
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-2xl font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                autoFocus
              />
              <button
                type="submit"
                className="rounded bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{projectTask.description}</h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
                title="Edit Project Title"
              >
                ✏️
              </button>
            </div>
          )}
        </div>

        {/* Project Total Coin Value */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm">
          <span>🪙 Total Earnable:</span>
          <span>{totalProjectCoins} Coins</span>
        </div>
      </div>

      {/* Action: Add Top-Level Task */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
          Project Tasks
        </span>
        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
        >
          + Add Root Task
        </button>
      </div>

      {/* Add Top-Level Task Form */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateRootTask}
          className="mt-3 flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/30"
        >
          <input
            type="text"
            placeholder="Task description..."
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            className="flex-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <div className="flex items-center gap-1">
            <span className="text-xs text-amber-600 dark:text-amber-400">🪙</span>
            <input
              type="number"
              min="0"
              value={newTaskCoins}
              onChange={(e) => setNewTaskCoins(Number(e.target.value))}
              className="w-20 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Add Task
          </button>
          <button
            type="button"
            onClick={() => setIsAddingTask(false)}
            className="rounded bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </form>
      )}
    </div>

    {/* Task Tree List */}
    <div>
      {projectTask.subTaskIds.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500">
          No tasks in this project yet. Click "+ Add Root Task" to get started!
        </div>
      ) : (
        projectTask.subTaskIds.map((taskId: string) => (
          <TaskItem
            key={taskId}
            taskId={taskId}
            tasks={tasks}
            expandedTasks={displayState.expandedTasks}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onToggleComplete={onToggleComplete}
            onToggleExpand={onToggleExpand}
          />
        ))
      )}
    </div>
  </div>
);
};