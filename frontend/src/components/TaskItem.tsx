import React, { useState } from 'react';
import type { Task, TaskMap } from '../types';
import { calculateTaskCoins } from '../scripts/utils';

interface TaskItemProps {
  taskId: string;
  tasks: TaskMap;
  depth?: number;
  expandedTasks: string[]; // List of expanded task IDs
  onAddTask: (parentId: string, description: string, coinValue: number) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string, isCompleted: boolean) => void;
  onToggleExpand: (taskId: string) => void; // Callback for toggling task expansion
}

export const TaskItem: React.FC<TaskItemProps> = ({
  taskId,
  tasks,
  depth = 0,
  expandedTasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onToggleExpand,
}) => {
  const task = tasks[taskId];
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // Edit form state
  const [editDescription, setEditDescription] = useState(task?.description || '');
  const [editNotes, setEditNotes] = useState(task?.notes || '');
  const [editCoins, setEditCoins] = useState(task?.baseCoinValue || 0);

  // New Subtask form state
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('');
  const [newSubtaskCoins, setNewSubtaskCoins] = useState(5);

  if (!task) return null;

  const isLeaf = task.subTaskIds.length === 0;
  const isExpanded = expandedTasks.includes(taskId);
  const totalCoins = calculateTaskCoins(taskId, tasks);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDescription.trim()) return;
    onUpdateTask(taskId, {
      description: editDescription.trim(),
      notes: editNotes.trim(),
      baseCoinValue: isLeaf ? Number(editCoins) : task.baseCoinValue,
    });
    setIsEditing(false);
  };

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskDesc.trim()) return;
    onAddTask(taskId, newSubtaskDesc.trim(), Number(newSubtaskCoins));
    setNewSubtaskDesc('');
    setNewSubtaskCoins(5);
    setIsAddingSubtask(false);
  };

  const handleSubtaskClick = () => {
    if (!isAddingSubtask && !isExpanded) {
      onToggleExpand(taskId);
    }
    setIsAddingSubtask(!isAddingSubtask);
  };

  return (
    <div className="mt-3 text-slate-800 dark:text-slate-200">
      {/* Main Task Card */}
      <div className="group flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
        <div className="flex items-start justify-between p-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Completion Checkbox */}
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={(e) => onToggleComplete(taskId, e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-indigo-500"
            />

            {/* Task Description & Notes */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Task description..."
                    autoFocus
                  />
                  {isLeaf && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">🪙</span>
                      <input
                        type="number"
                        min="0"
                        value={editCoins}
                        onChange={(e) => setEditCoins(Number(e.target.value))}
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>

                {/* User-resizable Notes Textarea */}
                <div className="flex flex-col gap-1">
                  <label htmlFor={`editNotes-${taskId}`} className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Notes
                  </label>
                  <textarea
                    id={`editNotes-${taskId}`}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Add details, links, or sub-notes here..."
                    className="w-full resize-y rounded border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 min-h-[60px]"
                  />
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={`text-sm font-medium wrap-break-words ${
                    task.isCompleted
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {task.description}
                </span>

                {/* Task Notes View (2-line clamp + click expand) */}
                {task.notes && task.notes.trim() !== '' && (
                  <div
                    onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                    className="mt-1 cursor-pointer rounded bg-slate-50/80 p-2 text-xs text-slate-600 transition hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-900"
                  >
                    <p className={`whitespace-pre-wrap wrap-break-words ${!isNotesExpanded ? 'line-clamp-1' : ''}`}>
                      {task.notes}
                    </p>
                    <span className="mt-1 inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {isNotesExpanded ? 'Show less ︿' : 'Show more ﹀'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Task Coin Badge & Action Buttons */}
          {!isEditing && (
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {/* Coin Value Badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isLeaf
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60'
                }`}
                title={isLeaf ? 'Leaf Task Value' : 'Calculated Sum of Subtasks'}
              >
                🪙 {totalCoins}
              </span>

              {/* Edit Button */}
              <button
                onClick={() => {
                  setEditDescription(task.description);
                  setEditNotes(task.notes || '');
                  setEditCoins(task.baseCoinValue);
                  setIsEditing(true);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                title="Edit Task"
              >
                ✏️
              </button>

              {/* Add Subtask Button */}
              <button
                onClick={handleSubtaskClick}
                className="px-2 py-0.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950/50"
                title="Add Subtask"
              >
                + Subtask
              </button>

              {/* Delete Task Button */}
              <button
                onClick={() => onDeleteTask(taskId)}
                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40"
                title="Delete Task"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Subtask Collapse/Expand Bar */}
        {!isLeaf && (
          <button
            type="button"
            onClick={() => onToggleExpand(taskId)}
            className="w-full bg-slate-50 hover:bg-slate-100 border-t border-slate-100 py-0.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition flex items-center justify-center tracking-widest dark:bg-slate-900/40 dark:hover:bg-slate-900 dark:border-slate-700/60 dark:text-slate-500 dark:hover:text-slate-300"
            title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {isExpanded ? '︿' : '﹀'}
          </button>
        )}
      </div>

      {/* Subtask Form */}
      {isAddingSubtask && (
        <form
          onSubmit={handleCreateSubtask}
          className="ml-6 mt-2 flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-2 dark:border-indigo-900/60 dark:bg-indigo-950/30"
        >
          <input
            type="text"
            placeholder="Subtask description..."
            value={newSubtaskDesc}
            onChange={(e) => setNewSubtaskDesc(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            autoFocus
          />
          <div className="flex items-center gap-1">
            <span className="text-xs text-amber-600 dark:text-amber-400">🪙</span>
            <input
              type="number"
              min="0"
              value={newSubtaskCoins}
              onChange={(e) => setNewSubtaskCoins(Number(e.target.value))}
              className="w-16 rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
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
        </form>
      )}

      {/* Recursive Subtask Tree */}
      {isExpanded && task.subTaskIds.length > 0 && (
        <div className="ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-2">
          {task.subTaskIds.map((subtaskId: string) => (
            <TaskItem
              key={subtaskId}
              taskId={subtaskId}
              tasks={tasks}
              depth={depth + 1}
              expandedTasks={expandedTasks}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onToggleComplete={onToggleComplete}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};