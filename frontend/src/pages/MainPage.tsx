import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { ProjectPage } from "./ProjectPage";
import { RewardsPage } from "./RewardsPage";
import { TodayTodoPage } from "./TodayTodoPage";

export const MainPage: React.FC = () => {
  // Store subscriptions
  const taskMap = useAppStore((state) => state.taskMap);
  const currentCoins = useAppStore((state) => state.currentCoins);
  const activePageType = useAppStore((state) => state.displayState.activePageType);
  const activePageId = useAppStore((state) => state.displayState.activePageId);
  const theme = useAppStore((state) => state.displayState.theme);
  const handleChangeActivePage = useAppStore((state) => state.handleChangeActivePage);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  // Collapsible section state (default collapsed)
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);

  // Derive top-level active and archived projects (parentId === null)
  const allProjects = Object.values(taskMap).filter((task) => task.parentId === null).toReversed();
  const activeProjects = allProjects.filter((task) => !task.isArchived);
  const archivedProjects = allProjects.filter((task) => task.isArchived);

  const isPageActive = (type: string, id: string | null = null) => {
    if (id !== null) {
      return activePageType === type && activePageId === id;
    }
    return activePageType === type;
  };

  const handleCreateProject = () => {
    const title = prompt("Enter new project title:");
    if (!title || !title.trim()) return;

    const newProjectId = crypto.randomUUID();
    useAppStore.setState((state) => ({
      taskMap: {
        ...state.taskMap,
        [newProjectId]: {
          id: newProjectId,
          parentId: null,
          description: title.trim(),
          taskType: "ONCE",
          coinValue: 0,
          countCompleted: 0,
          subTaskIds: [],
          isArchived: false,
          hasArchivedDependants: false,
        },
      },
    }));

    handleChangeActivePage("PROJECT", newProjectId);
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col justify-between p-4 shadow-xl border-r border-slate-800 dark:border-slate-800/80 shrink-0">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* App Header */}
          <div className="flex items-center gap-2 mb-6 px-2 shrink-0">
            <span className="text-2xl">🪙</span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              My Todos
            </h1>
          </div>

          {/* User Coin Balance */}
          <div className="mb-6 p-3 bg-slate-800/80 dark:bg-slate-900/90 rounded-xl border border-slate-700/50 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-slate-400">
              YOUR BALANCE
            </span>
            <span
              className={`text-sm font-extrabold ${
                currentCoins >= 0 ? "text-amber-400" : "text-rose-500"
              }`}
            >
              🪙 {currentCoins} Coins
            </span>
          </div>

          {/* Navigation Links Scroll Container */}
          <nav className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
            {/* 1. Today's Todo */}
            <div>
              <button
                type="button"
                onClick={() => handleChangeActivePage("TODAY", null)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isPageActive("TODAY")
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "hover:bg-slate-800 text-slate-300 dark:hover:bg-slate-900"
                }`}
              >
                <span>📅</span>
                <span>Today&apos;s Todo</span>
              </button>
            </div>

            {/* 2. Active Projects */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                <span>Projects</span>
                <button
                  type="button"
                  onClick={handleCreateProject}
                  className="hover:text-indigo-400 text-lg font-semibold leading-none transition px-1"
                  title="Create Project"
                >
                  +
                </button>
              </div>

              <div className="space-y-1">
                {activeProjects.length === 0 ? (
                  <p className="text-xs text-slate-500 px-2 py-1 italic">
                    No active projects
                  </p>
                ) : (
                  activeProjects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleChangeActivePage("PROJECT", proj.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                        isPageActive("PROJECT", proj.id)
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "hover:bg-slate-800 text-slate-300 dark:hover:bg-slate-900"
                      }`}
                    >
                      <span className="truncate flex-1">{proj.description}</span>
                      <span className="text-xs opacity-80 ml-2 shrink-0">
                        🪙 {proj.coinValue}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* 3. Archived Projects (Collapsible, default collapsed) */}
            <div>
              <button
                type="button"
                onClick={() => setIsArchivedExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-300 transition"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">
                    {isArchivedExpanded ? "▼" : "▶"}
                  </span>
                  <span>Archived Projects</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-400">
                  {archivedProjects.length}
                </span>
              </button>

              {isArchivedExpanded && (
                <div className="space-y-1 pl-1 border-l-2 border-slate-800 dark:border-slate-800/60 ml-2">
                  {archivedProjects.length === 0 ? (
                    <p className="text-xs text-slate-500 px-2 py-1 italic">
                      No archived projects
                    </p>
                  ) : (
                    archivedProjects.map((proj) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => handleChangeActivePage("PROJECT", proj.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                          isPageActive("PROJECT", proj.id)
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "hover:bg-slate-800 text-slate-300 dark:hover:bg-slate-900"
                        }`}
                      >
                        <span className="truncate flex-1 text-slate-400">
                          {proj.description}
                        </span>
                        <span className="text-xs opacity-75 ml-2 shrink-0">
                          🪙 {proj.coinValue}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 4. Rewards Store */}
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                Store
              </div>
              <button
                type="button"
                onClick={() => handleChangeActivePage("REWARDS", null)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isPageActive("REWARDS")
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "hover:bg-slate-800 text-slate-300 dark:hover:bg-slate-900"
                }`}
              >
                <span>🎁</span>
                <span>Rewards Store</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: Theme Toggle */}
        <div className="pt-4 border-t border-slate-800 dark:border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-slate-200 transition"
          >
            <span>Appearance</span>
            <span>{theme === "dark" ? "🌙 Dark" : "☀️ Light"}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        {activePageType === "TODAY" ? (
          <TodayTodoPage />
        ) : activePageType === "REWARDS" ? (
          <RewardsPage />
        ) : activePageType === "PROJECT" && activePageId && taskMap[activePageId] ? (
          <ProjectPage key={activePageId} taskId={activePageId} />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
            <div>
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-base font-medium">Select a page or project from the sidebar.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};