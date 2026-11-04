import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { TaskItem } from "./TaskItem";
import { TaskEditorCard } from "./TaskEditorCard";

interface ProjectProps {
  /** The root task ID representing the project (parentId === null) */
  taskId: string;
}

export const Project: React.FC<ProjectProps> = ({ taskId }) => {
  // Store subscriptions
  const project = useAppStore((state) => state.taskMap[taskId]);
  const onUpdateTaskLocally = useAppStore((state) => state.onUpdateTaskLocally);
  const toggleArchived = useAppStore((state) => state.toggleArchived);

  // Local component UI state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project?.description || "");
  const [isAddingTask, setIsAddingTask] = useState(false);


  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-400 dark:text-slate-500">
        Project not found.
      </div>
    );
  }

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = projectTitle.trim();
    if (!trimmedTitle) return;

    if (trimmedTitle !== project.description) {
      onUpdateTaskLocally(taskId, "description", trimmedTitle);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      {/* Project Header */}
      <div className="group bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="text-2xl font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 px-2 py-1 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 flex-1"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjectTitle(project.description);
                    setIsEditingTitle(false);
                  }}
                  className="rounded bg-slate-200 dark:bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                  {project.description}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition"
                  title="Edit Project Title"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => toggleArchived(taskId)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition"
                  title={project.isArchived ? "Restore Project" : "Archive Project"}
                  aria-label={project.isArchived ? "Restore Project" : "Archive Project"}
                >
                  {project.isArchived ? "📦" : "🗄️"}
                </button>
              </div>
            )}
          </div>

          {/* Root Project Aggregated Coin Value (automatically bubbled by Zustand) */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white px-4 py-2 rounded-lg font-bold shadow-xs shrink-0 select-none">
            <span>🪙 Total Earnable:</span>
            <span>{project.coinValue} Coins</span>
          </div>
        </div>

        {/* Action: Add Top-Level Task */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          {/* <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
            Project Tasks
          </span> */}
          <button
            onClick={() => setIsAddingTask((prev) => !prev)}
            data-testid="add-project-task-btn"
            className="flex items-center gap-1 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            {isAddingTask ? "Close Form" : "+ Add Task"}
          </button>
        </div>
      </div>

      {/* Unified Task Editor in "add" mode under root project */}
      {isAddingTask && (
        <div className="mb-6">
          <TaskEditorCard
            mode="add"
            taskId={taskId}
            onClose={() => setIsAddingTask(false)}
          />
        </div>
      )}

      {/* Task Tree List */}
      <div className="space-y-3">
        {project.subTaskIds.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            No tasks in this project yet. Click &quot;+ Add Task&quot; to get started!
          </div>
        ) : (
          project.subTaskIds.toReversed().map((subTaskId) => (
            <TaskItem key={subTaskId} taskId={subTaskId} />
          ))
        )}
      </div>
    </div>
  );
};