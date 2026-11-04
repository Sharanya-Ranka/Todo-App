import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { TaskEditorCard } from "./TaskEditorCard";
import { ViewingMainTaskCard } from "./ViewingMainTaskCard";

interface MainTaskCardProps {
  taskId: string;
  onOpenAddSubtask: () => void;
}

export const MainTaskCard: React.FC<MainTaskCardProps> = ({
  taskId,
  onOpenAddSubtask,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const subTaskCount = useAppStore((state) => state.taskMap[taskId]?.subTaskIds.length ?? 0);
  const isExpanded = useAppStore((state) => state.displayState.expandedTasks.includes(taskId));
  const toggleExpandTask = useAppStore((state) => state.toggleExpandTask);

  const hasSubtasks = subTaskCount > 0;

  return (
    <div className="group flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 transition">
      <div className="flex items-start justify-between p-3">
        {isEditing ? (
          <TaskEditorCard
            mode="edit"
            taskId={taskId}
            onClose={() => setIsEditing(false)}
          />
        ) : (
          <ViewingMainTaskCard
            taskId={taskId}
            onOpenEdit={() => setIsEditing(true)}
            onOpenAddSubtask={onOpenAddSubtask}
          />
        )}
      </div>

      {hasSubtasks && (
        <button
          type="button"
          onClick={() => toggleExpandTask(taskId)}
          className="w-full bg-slate-50 hover:bg-slate-100 border-t border-slate-100 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition flex items-center justify-center tracking-widest dark:bg-slate-900/40 dark:hover:bg-slate-900 dark:border-slate-700/60 dark:text-slate-500 dark:hover:text-slate-300"
          title={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
        >
          {isExpanded ? "︿" : "﹀"}
        </button>
      )}
    </div>
  );
};