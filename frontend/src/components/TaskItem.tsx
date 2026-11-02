import React, { useState } from "react";
import type { Task, TaskMap, TaskType } from "../types";
import { calculateTaskCoins } from "../scripts/utils";
import { SubTask } from "./SubTask";

interface TaskItemProps {
  taskId: string;
  tasks: TaskMap;
  depth?: number;
  expandedTasks: string[]; // List of expanded task IDs
  onAddTask: (
    parentId: string,
    description: string,
    coinValue: number,
    taskType: TaskType,
  ) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  // onToggleComplete: (taskId: string, isCompleted: boolean) => void;
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
  // onToggleComplete,
  onToggleExpand,
}) => {
  const task = tasks[taskId];
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // Edit form state
  const [editDescription, setEditDescription] = useState(
    task?.description || "",
  );
  const [editNotes, setEditNotes] = useState(task?.notes || "");
  const [editCoins, setEditCoins] = useState(task?.baseCoinValue || 0);
  const [editTaskType, setEditTaskType] = useState<TaskType>(
    task?.taskType || "ONCE",
  );
  if (!task) return null;

  const isLeaf = task.subTaskIds.length === 0;
  const isExpanded = expandedTasks.includes(taskId);
  const totalCoins = calculateTaskCoins(taskId, tasks);
  // const taskType = task.taskType ?? "ONCE";

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDescription.trim()) return;
    onUpdateTask(taskId, {
      description: editDescription.trim(),
      notes: editNotes.trim(),
      taskType: editTaskType,
      baseCoinValue: isLeaf ? Number(editCoins) : task.baseCoinValue,
    });
    setIsEditing(false);
  };

  const handleSubtaskClick = () => {
    if (!isAddingSubtask && !isExpanded) {
      onToggleExpand(taskId);
    }
    setIsAddingSubtask(!isAddingSubtask);
  };


  const handleUpdateTaskCompletion = (taskId: string, delta: number) => {
    const currentCount = task.countCompleted || 0;
    const newCount = Math.max(0, currentCount + delta);
    onUpdateTask(taskId, {
      countCompleted: newCount,
    });
  };

  return (
    <div className="mt-3 text-slate-800 dark:text-slate-200">
      {/* Main Task Card */}
      {<MainTaskCard 
      task={task}
handleUpdateTaskCompletion={handleUpdateTaskCompletion}
isEditing={isEditing}
isLeaf={isLeaf}
handleSaveEdit={handleSaveEdit}
editDescription={editDescription}
setEditDescription={setEditDescription}
editCoins={editCoins}
setEditCoins={setEditCoins}
editTaskType={editTaskType}
setEditTaskType={setEditTaskType}
editNotes={editNotes}
setEditNotes={setEditNotes}
setIsEditing={setIsEditing}
isNotesExpanded={isNotesExpanded}
setIsNotesExpanded={setIsNotesExpanded}
onDeleteTask={onDeleteTask}
handleSubtaskClick={handleSubtaskClick}
totalCoins={totalCoins}
isExpanded={isExpanded}
onToggleExpand={onToggleExpand}
      />}

      {/* Subtask Form with Task Type Selector */}
      {isAddingSubtask && (
        <SubTask
          parentTaskId={taskId}
          onAddTask={onAddTask}
          setIsAddingSubtask={setIsAddingSubtask} 
        />
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
              // onToggleComplete={onToggleComplete}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};


// Props Interfaces for Sub-components
interface MainTaskCardProps {
  task: Task;
  handleUpdateTaskCompletion: (taskId: string, delta: number) => void;
  isEditing: boolean;
  isLeaf: boolean;
  handleSaveEdit: (e: React.FormEvent) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  editCoins: number;
  setEditCoins: (val: number) => void;
  editTaskType: TaskType;
  setEditTaskType: (val: TaskType) => void;
  editNotes: string;
  setEditNotes: (val: string) => void;
  setIsEditing: (val: boolean) => void;
  isNotesExpanded: boolean;
  setIsNotesExpanded: (val: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  handleSubtaskClick: () => void;
  totalCoins: number;
  isExpanded: boolean;
  onToggleExpand: (taskId: string) => void;
}

export const MainTaskCard: React.FC<MainTaskCardProps> = ({
  task,
  handleUpdateTaskCompletion,
  isEditing,
  isLeaf,
  handleSaveEdit,
  editDescription,
  setEditDescription,
  editCoins,
  setEditCoins,
  editTaskType,
  setEditTaskType,
  editNotes,
  setEditNotes,
  setIsEditing,
  isNotesExpanded,
  setIsNotesExpanded,
  onDeleteTask,
  handleSubtaskClick,
  totalCoins,
  isExpanded,
  onToggleExpand,
}) => {
  // const taskType = task.taskType ?? 'ONCE';
  const taskId = task.id;

  return (
    <div className="group flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600">
      <div className="flex items-start justify-between p-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          

          {/* Task Description & Notes */}
          {isEditing ? (
            <EditingMainTaskCard
              task={task}
              handleSaveEdit={handleSaveEdit}
              editDescription={editDescription}
              setEditDescription={setEditDescription}
              isLeaf={isLeaf}
              editCoins={editCoins}
              setEditCoins={setEditCoins}
              editTaskType={editTaskType}
              setEditTaskType={setEditTaskType}
              editNotes={editNotes}
              setEditNotes={setEditNotes}
              setIsEditing={setIsEditing}
            />
          ) : (
            <ViewingMainTaskCard
              task={task}
              isNotesExpanded={isNotesExpanded}
              setIsNotesExpanded={setIsNotesExpanded}
              onDeleteTask={onDeleteTask}
              handleSubtaskClick={handleSubtaskClick}
              handleUpdateTaskCompletion={handleUpdateTaskCompletion}
              isLeaf={isLeaf}
              totalCoins={totalCoins}
              setEditDescription={setEditDescription}
              setEditNotes={setEditNotes}
              setEditCoins={setEditCoins}
              setEditTaskType={setEditTaskType}
              setIsEditing={setIsEditing}
            />
          )}
        </div>

        </div>
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
  );
};

interface EditingMainTaskCardProps {
  task: Task;
  handleSaveEdit: (e: React.FormEvent) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  isLeaf: boolean;
  editCoins: number;
  setEditCoins: (val: number) => void;
  editTaskType: TaskType;
  setEditTaskType: (val: TaskType) => void;
  editNotes: string;
  setEditNotes: (val: string) => void;
  setIsEditing: (val: boolean) => void;
}

const EditingMainTaskCard: React.FC<EditingMainTaskCardProps> = ({
  task,
  handleSaveEdit,
  editDescription,
  setEditDescription,
  isLeaf,
  editCoins,
  setEditCoins,
  editTaskType,
  setEditTaskType,
  editNotes,
  setEditNotes,
  setIsEditing,
}) => {
  const taskId = task.id;
  return (
    <form
      onSubmit={handleSaveEdit}
      className="flex flex-col gap-3 flex-1 min-w-0"
    >
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
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              🪙
            </span>
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

      {/* Task Type Switch Toggle */}
      <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>Task Type:</span>
        <div className="inline-flex rounded-md shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-0.5">
          <button
            type="button"
            onClick={() => setEditTaskType('ONCE')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              editTaskType === 'ONCE'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            One-time
          </button>
          <button
            type="button"
            onClick={() => setEditTaskType('RECURRING')}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${
              editTaskType === 'RECURRING'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Recurring
          </button>
        </div>
      </div>

      {/* User-resizable Notes Textarea */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`editNotes-${taskId}`}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
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
  );
};

interface ViewingMainTaskCardProps {
  task: Task;
  isNotesExpanded: boolean;
  setIsNotesExpanded: (val: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  handleSubtaskClick: () => void;
  handleUpdateTaskCompletion: (taskId: string, delta: number) => void;
  isLeaf: boolean;
  totalCoins: number;
  setEditDescription: (val: string) => void;
  setEditNotes: (val: string) => void;
  setEditCoins: (val: number) => void;
  setEditTaskType: (val: TaskType) => void;
  setIsEditing: (val: boolean) => void;
}

const ViewingMainTaskCard: React.FC<ViewingMainTaskCardProps> = ({
  task,
  isNotesExpanded,
  setIsNotesExpanded,
  onDeleteTask,
  handleSubtaskClick,
  handleUpdateTaskCompletion,
  isLeaf,
  totalCoins,
  setEditDescription,
  setEditNotes,
  setEditCoins,
  setEditTaskType,
  setIsEditing,
}) => {
  const taskId = task.id;
  const taskType = task.taskType ?? 'ONCE';
  return (
    <>
    {/* Completion Control: Checkbox for ONCE vs Counter for RECURRING */}
          {taskType === 'ONCE' ? (
            <input
              type="checkbox"
              checked={task.countCompleted > 0}
              onChange={(e) =>
                handleUpdateTaskCompletion(taskId, e.target.checked ? 1 : -1)
              }
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-indigo-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center bg-slate-100 rounded p-0.5 dark:bg-slate-700/60 shrink-0 select-none">
              <button
                type="button"
                onClick={() => handleUpdateTaskCompletion(taskId, 1)}
                className="p-0.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                title="Increase completion count"
              >
                ︿
              </button>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-1">
                {task.countCompleted || 0}
              </span>
              <button
                type="button"
                onClick={() => handleUpdateTaskCompletion(taskId, -1)}
                disabled={(task.countCompleted || 0) <= 0}
                className="p-0.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 disabled:opacity-30 dark:text-slate-300 dark:hover:text-indigo-400"
                title="Decrease completion count"
              >
                ﹀
              </button>
            </div>
          )}
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium wrap-break-words ${
              taskType === 'ONCE' && task.countCompleted > 0
              ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-700 dark:text-slate-200'
              }`}
              >
            {task.description}
          </span>

          {/* Recurring Task Indicator Badge */}
          {taskType === 'RECURRING' && (
            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60">
              🔁 Recurring
            </span>
          )}
        </div>

        {/* Task Notes View */}
        {task.notes && task.notes.trim() !== '' && (
          <div
          onClick={() => setIsNotesExpanded(!isNotesExpanded)}
          className="mt-1 cursor-pointer rounded bg-slate-50/80 p-2 text-xs text-slate-600 transition hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            <p
              className={`whitespace-pre-wrap wrap-break-words ${
                !isNotesExpanded ? 'line-clamp-1' : ''
              }`}
              >
              {task.notes}
            </p>
            <span className="mt-1 inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
              {isNotesExpanded ? 'Show less ︿' : 'Show more ﹀'}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4 shrink-0">
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

        <button
          onClick={() => {
            setEditDescription(task.description);
            setEditNotes(task.notes || '');
            setEditCoins(task.baseCoinValue);
            setEditTaskType(task.taskType || 'ONCE');
            setIsEditing(true);
          }}
          className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
          title="Edit Task"
          >
          ✏️
        </button>

        <button
          onClick={handleSubtaskClick}
          className="px-2 py-0.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950/50"
          title="Add Subtask"
          >
          + Subtask
        </button>

        <button
          onClick={() => onDeleteTask(taskId)}
          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40"
          title="Delete Task"
          >
          ✕
        </button>
      </div>
    </div>
    </>
  );
};
