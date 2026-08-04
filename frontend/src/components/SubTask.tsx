import React, { useState } from 'react';
import type {  TaskType } from '../types';
// import { calculateTaskCoins } from '../scripts/utils';
// import { TaskItem } from './TaskItem';


interface SubTaskProps {
    parentTaskId: string;
    onAddTask: (parentId: string, description: string, coinValue: number, taskType: TaskType) => void;
    setIsAddingSubtask: (isAdding: boolean) => void;
}


export const SubTask: React.FC<SubTaskProps> = ({
    parentTaskId,
    onAddTask,
    setIsAddingSubtask,
}) => {
    
  
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('');
  const [newSubtaskCoins, setNewSubtaskCoins] = useState(10);
  const [newSubtaskType, setNewSubtaskType] = useState<TaskType>("ONCE");

    const handleCreateSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskDesc.trim()) return;
        onAddTask(
          parentTaskId,
          newSubtaskDesc.trim(),
          Number(newSubtaskCoins),
          newSubtaskType,
        );
        setNewSubtaskDesc("");
        setNewSubtaskCoins(5);
        setNewSubtaskType("ONCE");
        setIsAddingSubtask(false);
      };
    return (
<form
            aria-label="New Subtask Form"
          onSubmit={handleCreateSubtask}
          className="ml-6 mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-2 dark:border-indigo-900/60 dark:bg-indigo-950/30"
        >
          <input
            type="text"
            placeholder="Subtask description..."
            value={newSubtaskDesc}
            onChange={(e) => setNewSubtaskDesc(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            autoFocus
          />

          <div className="flex items-center gap-2 justify-between">
            {/* Task Type Switch for New Subtask */}
            <div className="inline-flex rounded-md shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setNewSubtaskType("ONCE")}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                  newSubtaskType === "ONCE"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Once
              </button>
              <button
                type="button"
                onClick={() => setNewSubtaskType("RECURRING")}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                  newSubtaskType === "RECURRING"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Recurring
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-amber-600 dark:text-amber-400">
                🪙
              </span>
              <input
                type="number"
                min="0"
                value={newSubtaskCoins}
                onChange={(e) => setNewSubtaskCoins(Number(e.target.value))}
                className="w-14 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="submit"
                className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubtask(false)}
                className="rounded bg-white px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
    );
}