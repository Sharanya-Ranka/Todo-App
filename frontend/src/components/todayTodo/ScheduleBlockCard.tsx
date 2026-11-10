import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { ScheduleBlock } from "../../types/todaytodo";
import { TaskSearchPicker } from "./TaskSearchPicker";
import { BlockEditorCard } from "./BlockEditorCard";
import type { TaskV3 } from "../../types/task";

interface ScheduleBlockCardProps {
  block: ScheduleBlock;
  isActive: boolean;
  isClickedExpanded: boolean;
  onToggleClickExpand: () => void;
  allBlocks: ScheduleBlock[];
}

export const ScheduleBlockCard: React.FC<ScheduleBlockCardProps> = ({
  block,
  isActive,
  isClickedExpanded,
  onToggleClickExpand,
  allBlocks,
}) => {
  const taskMap = useAppStore((state) => state.taskMap);
  const modifyCountCompleted = useAppStore(
    (state) => state.modifyCountCompleted,
  );
  const deleteScheduleBlock = useAppStore((state) => state.deleteScheduleBlock);
  const removeTaskFromBlock = useAppStore((state) => state.removeTaskFromBlock);
  const addTaskToBlock = useAppStore((state) => state.addTaskToBlock);

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTaskInline, setIsAddingTaskInline] = useState(false);

  // A card expands if it is currently active OR explicitly clicked by the user
  const isExpanded = isActive || isClickedExpanded;

  const tasks = block.taskIds.map((id) => taskMap[id]).filter(Boolean);
  const completedCount = tasks.filter((t) => t.countCompleted > 0).length;
  const totalCoins = tasks.reduce((sum, t) => sum + (t.coinValue || 0), 0);

  const getFullPath = (task: TaskV3): string[] => {
    const path: string[] = [];
    let currentId: string | null = task.parentId;

    while (currentId) {
      const current = taskMap[currentId];
      if (!current) break;
      path.unshift(current.description);
      currentId = current.parentId;
    }

    return path;
  };

  if (isEditing) {
    return (
      <BlockEditorCard
        isEdit={true}
        block={block}
        existingBlocks={allBlocks}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div
      className={`rounded-xl transition-all duration-200 relative ${
        isActive
          ? "bg-white dark:bg-slate-900 border-2 border-amber-500 shadow-xl p-5 ring-4 ring-amber-500/10 scale-[1.01]"
          : isExpanded
            ? "bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 shadow-md p-5"
            : "bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
      }`}
    >
      {/* Header (Clicking toggles manual expansion) */}
      <div className="flex items-center justify-between gap-3 select-none">
        <div
          onClick={onToggleClickExpand}
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
        >
          {isActive ? (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          ) : (
            <span className="text-slate-400 text-sm">
              {isExpanded ? "▼" : "▶"}
            </span>
          )}

          <span
            className={`font-mono font-extrabold ${
              isActive
                ? "text-amber-600 dark:text-amber-400 text-base"
                : "text-slate-700 dark:text-slate-300 text-sm"
            }`}
          >
            {block.timeBegin} – {block.timeEnd}
          </span>

          {isActive && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Live Focus
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {completedCount}/{tasks.length} Done
          </span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            🪙 {totalCoins}
          </span>

          {/* Edit Block Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Edit block timing and tasks"
          >
            ✏️
          </button>

          {/* Delete Block Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteScheduleBlock(block.id);
            }}
            className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 p-1 text-xs transition"
            title="Delete Block"
          >
            ✕
          </button>
        </div>
      </div>

      {/* EXPANDED VIEW: Complete task checklist with toggle actions */}
      {isExpanded ? (
        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {tasks.length === 0 ? (
            <div className="py-5 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              No tasks scheduled in this block yet.
            </div>
          ) : (
            tasks.map((task) => {
              const isDone = task.countCompleted > 0;
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                    isDone
                      ? "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60"
                      : "bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) =>
                        modifyCountCompleted(task.id, e.target.checked ? 1 : -1)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      {/* Breadcrumb Hierarchy */}
                      {(() => {
                        const path = getFullPath(task);
                        if (path.length === 0) return null;
                        const breadcrumb = path.join(" > ");

                        return (
                          <span
                            title={breadcrumb}
                            className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mb-0.5"
                          >
                            📁 {breadcrumb}
                          </span>
                        );
                      })()}

                      {/* Task Description */}
                      <span
                        title={task.description}
                        className={`text-sm font-medium truncate ${
                          isDone
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {task.description}
                      </span>

                      {/* Notes Preview */}
                      {task.notes && task.notes.trim() !== "" && (
                        <span
                          title={task.notes}
                          className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5"
                        >
                          {task.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      🪙 {task.coinValue}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTaskFromBlock(block.id, task.id)}
                      className="text-slate-300 hover:text-rose-500 text-xs px-1"
                      title="Remove task from block"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Quick-add task picker within expanded block */}
          <div className="pt-1">
            {isAddingTaskInline ? (
              <div className="space-y-2 mt-2">
                <TaskSearchPicker
                  selectedTaskIds={block.taskIds}
                  onSelectTask={(task) => {
                    addTaskToBlock(block.id, task.id);
                    setIsAddingTaskInline(false);
                  }}
                  placeholder="Quick add task..."
                />
                <button
                  type="button"
                  onClick={() => setIsAddingTaskInline(false)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTaskInline(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1"
              >
                + Add Task to block
              </button>
            )}
          </div>
        </div>
      ) : (
        /* COLLAPSED SUMMARY: Compact Chips */
        <div
          onClick={onToggleClickExpand}
          className="flex flex-wrap gap-1.5 mt-2 cursor-pointer"
        >
          {tasks.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              No tasks picked
            </span>
          ) : (
            tasks.map((task) => {
              const isDone = task.countCompleted > 0;
              return (
                <span
                  key={task.id}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border ${
                    isDone
                      ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 line-through"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className="truncate max-w-[160px]">
                    {task.description}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    🪙{task.coinValue}
                  </span>
                </span>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
