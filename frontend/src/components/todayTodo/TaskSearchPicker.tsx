import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { TaskV3 } from "../../types/task";

interface TaskSearchPickerProps {
  selectedTaskIds: string[];
  onSelectTask: (task: TaskV3) => void;
  placeholder?: string;
}

export const TaskSearchPicker: React.FC<TaskSearchPickerProps> = ({
  selectedTaskIds,
  onSelectTask,
  placeholder = "Search available tasks...",
}) => {
  const taskMap = useAppStore((state) => state.taskMap);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter eligible leaf tasks: not archived, countCompleted === 0, no subtasks
  const eligibleTasks = useMemo(() => {
    return Object.values(taskMap).filter(
      (task) =>
        !task.isArchived &&
        (task.countCompleted === 0 || task.taskType == "RECURRING") &&
        task.subTaskIds.length === 0 &&
        !selectedTaskIds.includes(task.id)
    );
  }, [taskMap, selectedTaskIds]);

  // Search by description or notes
  const filteredTasks = useMemo(() => {
    if (!query.trim()) return eligibleTasks;
    const q = query.toLowerCase();

    const searchBasis = (task: TaskV3) => {
        if  (task.description.toLowerCase().includes(q)) return true;
        if (task.notes && task.notes.toLowerCase().includes(q)) return true;

        let ancestorId = task.parentId;
        while (ancestorId) {
          const ancestor = taskMap[ancestorId];
          if (!ancestor) break;
          if (ancestor.description.toLowerCase().includes(q)) return true;
          ancestorId = ancestor.parentId;
        }
    }

    return eligibleTasks
      .filter(
        (t) =>
          searchBasis(t)
      )
  }, [eligibleTasks, query, taskMap]);

  // Helper to trace root/parent project name
//   const getParentName = (parentId: string | null): string => {
//     if (!parentId) return "Project Root";
//     const parent = taskMap[parentId];
//     return parent ? parent.description : "Project";
//   };

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {isOpen && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1">
          {filteredTasks.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              No matching uncompleted leaf tasks found.
            </div>
          ) : (
            filteredTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSelectTask(t);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-sm transition"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {t.description}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    📁 {getFullPath(t).join(" > ")}
                  </span>
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                  🪙 {t.coinValue}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};