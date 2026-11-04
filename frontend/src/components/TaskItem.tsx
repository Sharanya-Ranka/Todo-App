import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { MainTaskCard } from "./MainTaskCard";
import { TaskEditorCard } from "./TaskEditorCard";

interface TaskItemProps {
  taskId: string;
  depth?: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({ taskId, depth = 0 }) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Directly select only the task and expansion state
  const task = useAppStore((state) => state.taskMap[taskId]);
  const isExpanded = useAppStore((state) => state.displayState.expandedTasks.includes(taskId));
  const toggleExpandTask = useAppStore((state) => state.toggleExpandTask);

  if (!task) return null;

  const handleOpenAddSubtask = () => {
    // Auto-expand tree when adding a subtask so it is visible immediately
    if (!isExpanded) {
      toggleExpandTask(taskId);
    }
    setIsAddingSubtask(true);
  };

  return (
    <div className="mt-3 text-slate-800 dark:text-slate-200">
      {/* Primary Card */}
      <MainTaskCard
        taskId={taskId}
        onOpenAddSubtask={handleOpenAddSubtask}
      />

      {/* Unified form in "add" mode under this parent */}
      {isAddingSubtask && (
        <div className="mt-2 ml-6">
          <TaskEditorCard
            mode="add"
            taskId={taskId}
            onClose={() => setIsAddingSubtask(false)}
          />
        </div>
      )}

      {/* Recursive Subtask Branching */}
      {isExpanded && task.subTaskIds.length > 0 && (
        <div className="ml-5 border-l-2 border-slate-200 dark:border-slate-700/70 pl-2">
          {task.subTaskIds.toReversed().map((subtaskId) => (
            <TaskItem
              key={subtaskId}
              taskId={subtaskId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};