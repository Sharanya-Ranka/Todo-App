import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { TaskSearchPicker } from "./TaskSearchPicker";
import type { TaskV3 } from "../../types/task";
import type { ScheduleBlock} from "../../types/todaytodo";

interface BlockEditorCardProps {
  isEdit?: boolean;
  block?: ScheduleBlock;
  existingBlocks: ScheduleBlock[];
  onClose: () => void;
}

export const BlockEditorCard: React.FC<BlockEditorCardProps> = ({
  isEdit = false,
  block,
  existingBlocks,
  onClose,
}) => {
  const taskMap = useAppStore((state) => state.taskMap);
  const addScheduleBlock = useAppStore((state) => state.addScheduleBlock);
  const updateScheduleBlock = useAppStore((state) => state.updateScheduleBlock);

  const [timeBegin, setTimeBegin] = useState(block?.timeBegin || "09:00");
  const [timeEnd, setTimeEnd] = useState(block?.timeEnd || "10:30");
  
  // Initialize staged tasks from block if editing
  const [selectedTasks, setSelectedTasks] = useState<TaskV3[]>(() => {
    if (block?.taskIds) {
      return block.taskIds.map((id) => taskMap[id]).filter(Boolean);
    }
    return [];
  });
  
  const [error, setError] = useState<string | null>(null);

  const handleAddTask = (task: TaskV3) => {
    if (!selectedTasks.some((t) => t.id === task.id)) {
      setSelectedTasks((prev) => [...prev, task]);
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setSelectedTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (timeBegin >= timeEnd) {
      setError("Start time must be before end time.");
      return;
    }

    // Exclude the current block being edited from the overlap check
    const otherBlocks = isEdit && block
      ? existingBlocks.filter((b) => b.id !== block.id)
      : existingBlocks;

    const hasOverlap = otherBlocks.some((b) => {
      return (
        (timeBegin >= b.timeBegin && timeBegin < b.timeEnd) ||
        (timeEnd > b.timeBegin && timeEnd <= b.timeEnd) ||
        (timeBegin <= b.timeBegin && timeEnd >= b.timeEnd)
      );
    });

    if (hasOverlap) {
      setError("Time interval overlaps with an existing block.");
      return;
    }

    const taskIds = selectedTasks.map((t) => t.id);

    if (isEdit && block) {
      updateScheduleBlock(block.id, timeBegin, timeEnd, taskIds);
    } else {
      addScheduleBlock(timeBegin, timeEnd, taskIds);
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white dark:bg-slate-900 border-2 border-indigo-400 dark:border-indigo-600 rounded-xl p-5 shadow-lg space-y-4 mb-4 transition"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>{isEdit ? "✏️" : "⏰"}</span>
          <span>{isEdit ? "Edit Time Block" : "Schedule Time Block"}</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-950/40 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Time Interval Inputs */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Starts
          </label>
          <input
            type="time"
            value={timeBegin}
            onChange={(e) => setTimeBegin(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <span className="text-slate-400 mt-5">→</span>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Ends
          </label>
          <input
            type="time"
            value={timeEnd}
            onChange={(e) => setTimeEnd(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      {/* Task Search & Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Scheduled Tasks
        </label>
        <TaskSearchPicker
          selectedTaskIds={selectedTasks.map((t) => t.id)}
          onSelectTask={handleAddTask}
          placeholder="Search and add uncompleted leaf tasks..."
        />

        {selectedTasks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedTasks.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <span className="truncate max-w-[200px]">{t.description}</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  🪙{t.coinValue}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(t.id)}
                  className="hover:text-rose-500 text-xs ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
        >
          {isEdit ? "Update Block" : "Create Time Block"}
        </button>
      </div>
    </form>
  );
};