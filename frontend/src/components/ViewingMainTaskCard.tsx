import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";

interface ViewingMainTaskCardProps {
  taskId: string;
  onOpenEdit: () => void;
  onOpenAddSubtask: () => void;
}

export const ViewingMainTaskCard: React.FC<ViewingMainTaskCardProps> = ({
  taskId,
  onOpenEdit,
  onOpenAddSubtask,
}) => {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  const task = useAppStore((state) => state.taskMap[taskId]);
  const modifyCountCompleted = useAppStore((state) => state.modifyCountCompleted);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const toggleArchived = useAppStore((state) => state.toggleArchived);

  if (!task) return null;

  const isLeaf = task.subTaskIds.length === 0;
  const isOnce = task.taskType === "ONCE";
  const isCompleted = task.countCompleted > 0;

  return (
    <div className="group flex items-start gap-3 flex-1 min-w-0">
      {/* Completion Control */}
      {isOnce ? (
        <input
          type="checkbox"
          checked={isCompleted}
          disabled={!isLeaf || task.isArchived}
          onChange={(e) => modifyCountCompleted(taskId, e.target.checked ? 1 : -1)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-indigo-500 shrink-0"
        />
      ) : (
        <div className="flex flex-col items-center justify-center bg-slate-100 rounded p-0.5 dark:bg-slate-700/60 shrink-0 select-none">
          <button
            type="button"
            onClick={() => modifyCountCompleted(taskId, 1)}
            disabled={!isLeaf || task.isArchived}
            className="p-0.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            title="Increment completions"
          >
            ︿
          </button>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-1">
            {task.countCompleted}
          </span>
          <button
            type="button"
            onClick={() => modifyCountCompleted(taskId, -1)}
            disabled={task.countCompleted <= 0}
            className="p-0.5 text-[10px] font-bold text-slate-600 hover:text-indigo-600 disabled:opacity-30 dark:text-slate-300 dark:hover:text-indigo-400"
            title="Decrement completions"
          >
            ﹀
          </button>
        </div>
      )}

      {/* Description & Metadata */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium break-words ${
              isOnce && isCompleted
                ? "line-through text-slate-400 dark:text-slate-500"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {task.description}
          </span>

          {!isOnce && (
            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60">
              🔁 Recurring
            </span>
          )}
        </div>

        {/* Notes preview */}
        {task.notes && task.notes.trim() !== "" && (
          <div
            onClick={() => setIsNotesExpanded((prev) => !prev)}
            className="mt-1.5 cursor-pointer rounded bg-slate-50/80 p-2 text-xs text-slate-600 transition hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-900/80"
          >
            <p className={`whitespace-pre-wrap break-words ${!isNotesExpanded ? "line-clamp-1" : ""}`}>
              {task.notes}
            </p>
            <span className="mt-1 inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
              {isNotesExpanded ? "Show less ︿" : "Show more ﹀"}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons & Coin Badge */}
      <div className="flex items-center gap-1.5 ml-3 shrink-0">
        

        <button
          onClick={onOpenEdit}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition"
          title="Edit Task"
        >
          ✏️
        </button>

        <button
          onClick={onOpenAddSubtask}
          className="opacity-0 group-hover:opacity-100 px-2 py-0.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950/50 transition"
          title="Add Subtask"
        >
          + Subtask
        </button>
        <button
          type="button"
          onClick={() => toggleArchived(taskId)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition"
          title={task.isArchived ? "Restore Task" : "Archive Task"}
          aria-label={task.isArchived ? "Restore Task" : "Archive Task"}
        >
          {task.isArchived ? "📦" : "🗄️"}
        </button>

        <button
          onClick={() => deleteTask(taskId)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition"
          title="Delete Task"
        >
          ✕
        </button>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isLeaf
              ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
              : "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60"
          }`}
          title={isLeaf ? "Leaf task value" : "Sum of all subtasks"}
        >
          🪙 {task.coinValue}
        </span>
      </div>
    </div>
  );
};