import React, { useState, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
// import type { ScheduleBlock } from "../../types/todaytodo";
import { BlockEditorCard } from "../components/todayTodo/BlockEditorCard";
import { ScheduleBlockCard } from "../components/todayTodo/ScheduleBlockCard";

export const TodayTodoPage: React.FC = () => {
  const todaySchedule = useAppStore((state) => state.todaySchedule);
  const checkAndResetDaySchedule = useAppStore(
    (state) => state.checkAndResetDaySchedule
  );

  const [isCreatingBlock, setIsCreatingBlock] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  
  // Track IDs of blocks manually clicked to toggle expanded state
  const [clickedExpandedIds, setClickedExpandedIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    checkAndResetDaySchedule();
  }, [checkAndResetDaySchedule]);

  // Live ticker: updates current time every 30s and checks for day rollover
useEffect(() => {
  const tick = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setCurrentTimeStr(`${hours}:${minutes}`);

    // Check if the date rolled over while the app remained open
    checkAndResetDaySchedule();
  };

  tick();
  const interval = setInterval(tick, 30000);
  return () => clearInterval(interval);
}, [checkAndResetDaySchedule]);

  const toggleBlockExpansion = (blockId: string) => {
    setClickedExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  const dateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
  <div className="flex items-center gap-2 flex-wrap">
    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
      📅 Today&apos;s Schedule
    </h1>

    <div className="flex items-center gap-1.5">
      {/* Date Badge */}
      <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
        {dateFormatted}
      </span>

      {/* Live Time Badge */}
      {currentTimeStr && (
        <span className="text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          <span className="text-[10px] text-amber-500">●</span>
          {currentTimeStr}
        </span>
      )}
    </div>
  </div>

  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
    Pick uncompleted leaf tasks, allocate dedicated time blocks, and conquer them.
  </p>
</div>

        <button
          type="button"
          onClick={() => setIsCreatingBlock((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition shrink-0"
        >
          {isCreatingBlock ? "Close Form" : "+ Add Time Block"}
        </button>
      </div>

      {/* Creation Mode using Unified Card */}
      {isCreatingBlock && (
        <BlockEditorCard
          isEdit={false}
          existingBlocks={todaySchedule.blocks}
          onClose={() => setIsCreatingBlock(false)}
        />
      )}

      {/* Vertical Timeline */}
      <div className="space-y-4">
        {todaySchedule.blocks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            <span className="text-3xl block mb-2">⏳</span>
            <p className="text-sm font-medium">No time blocks scheduled for today yet.</p>
            <p className="text-xs mt-1">
              Click &quot;+ Add Time Block&quot; to organize your day.
            </p>
          </div>
        ) : (
          todaySchedule.blocks.map((block) => {
            const isActive =
              currentTimeStr >= block.timeBegin && currentTimeStr < block.timeEnd;
            const isClickedExpanded = clickedExpandedIds.has(block.id);

            return (
              <ScheduleBlockCard
                key={block.id}
                block={block}
                isActive={isActive}
                isClickedExpanded={isClickedExpanded}
                onToggleClickExpand={() => toggleBlockExpansion(block.id)}
                allBlocks={todaySchedule.blocks}
              />
            );
          })
        )}
      </div>
    </div>
  );
};