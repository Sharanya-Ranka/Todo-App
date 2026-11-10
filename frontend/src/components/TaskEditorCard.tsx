import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import type { TaskType } from "../types";

interface TaskEditorCardProps {
  mode: "add" | "edit";
  /** In "edit" mode: ID of the task to update. In "add" mode: ID of the parent task. */
  taskId: string;
  onClose: () => void;
}

export const TaskEditorCard: React.FC<TaskEditorCardProps> = ({
  mode,
  taskId,
  onClose,
}) => {
  const isEdit = mode === "edit";

  // Select only the target task (if editing) and the required mutators
  const task = useAppStore((state) => (isEdit ? state.taskMap[taskId] : null));
  const onAddSubtask = useAppStore((state) => state.onAddSubtask);
  const onUpdateTaskLocally = useAppStore((state) => state.onUpdateTaskLocally);
  const modifyTaskCoins = useAppStore((state) => state.modifyTaskCoins);

  const isLeaf = task ? task.subTaskIds.length === 0 : true;

  // Local form state
  const [description, setDescription] = useState(task?.description || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [coins, setCoins] = useState(task?.coinValue || 10);
  const [taskType, setTaskType] = useState<TaskType>(task?.taskType || "ONCE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDesc = description.trim();
    const trimedNotes = notes.trim();
    if (!trimmedDesc) return;

    if (isEdit && task) {
      if (task.description !== trimmedDesc) {
        onUpdateTaskLocally(taskId, "description", trimmedDesc);
      }
      if ((task.notes || "") !== notes.trim()) {
        onUpdateTaskLocally(taskId, "notes", notes.trim());
      }
      if (task.taskType !== taskType) {
        onUpdateTaskLocally(taskId, "taskType", taskType);
      }
      if (isLeaf && task.coinValue !== coins) {
        modifyTaskCoins(taskId, coins);
      }
    } else {
      // Adding a subtask under `taskId` (as parentId)
      onAddSubtask(taskId, trimmedDesc, trimedNotes, coins, taskType);
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 flex-1 min-w-0 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 rounded border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          placeholder={isEdit ? "Task description..." : "New subtask description..."}
          autoFocus
        />

        {/* Coin input enabled for new tasks or leaf tasks */}
        {(!isEdit || isLeaf) && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold select-none">
              🪙
            </span>
            <input
              type="number"
              min="0"
              value={coins}
              onChange={(e) => setCoins(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        )}
      </div>

      {/* Task Type Switch */}
      <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>Task Type:</span>
        <div className="inline-flex rounded-md shadow-sm border border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-900 p-0.5">
          <button
            type="button"
            onClick={() => setTaskType("ONCE")}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
              taskType === "ONCE"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            One-time
          </button>
          <button
            type="button"
            onClick={() => setTaskType("RECURRING")}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
              taskType === "RECURRING"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Recurring
          </button>
        </div>
      </div>

      {/* Notes Textarea */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`notes-${taskId}`}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          Notes
        </label>
        <textarea
          id={`notes-${taskId}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Add details, links, or notes..."
          className="w-full resize-y rounded border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 min-h-[60px]"
        />
      </div>

      <div className="flex items-center gap-2 justify-end mt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition"
        >
          {isEdit ? "Save Changes" : "Add Subtask"}
        </button>
      </div>
    </form>
  );
};