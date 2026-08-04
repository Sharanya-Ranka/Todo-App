// MainPage.tsx
import React from "react";
// import type { Task, AppState, Reward, PageType } from '../types';
import { calculateTaskCoins } from "../scripts/utils";
import { Project } from "../components/Project";
import { Rewards } from "../components/Rewards";
import { useAppState } from "../scripts/useAppState";

export const MainPage: React.FC = () => {
  const {
    state,
    handleAddTask,
    handleCreateProject,
    handleUpdateTask,
    handleDeleteTask,
    // handleToggleComplete,
    handleClaimReward,
    handleAddReward,
    handleUpdateReward,
    handleDeleteReward,
    handleChangeActivePage,
    handleToggleExpand,
    handleToggleTheme,
  } = useAppState();

  const isPageActive = (pageId: string, pageType: "PROJECT" | "REWARDS") => {
    return (
      state.displayState.activePageType === pageType &&
      state.displayState.activePageId === pageId
    );
  };

  const projectIds = state.projectIds;

  const activeProjectTask =
    state.displayState.activePageType === "PROJECT"
      ? state.tasks[state.displayState.activePageId] || null
      : null;

  return (
  <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">
    {/* SIDEBAR */}
    <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col justify-between p-4 shadow-xl border-r border-slate-800 dark:border-slate-800/80">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <h1 className="text-xl font-bold text-white tracking-wide">
              My Todos
            </h1>
          </div>
        </div>

        {/* User Coin Balance */}
        <div className="mb-6 p-3 bg-slate-800/80 dark:bg-slate-900/90 rounded-xl border border-slate-700/50 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            YOUR BALANCE
          </span>
          <span className={`text-sm font-extrabold ${state.currentCoins >= 0 ? "text-amber-400" : "text-rose-500"}`}>
          🪙 {state.currentCoins} Coins
        </span>
        </div>

        {/* Projects Navigation Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
            <span>Projects</span>
            <button
              onClick={handleCreateProject}
              className="hover:text-indigo-400 text-base font-normal leading-none transition"
              title="Create Project"
            >
              +
            </button>
          </div>
          <nav className="space-y-1">
            {projectIds.map((projId) => {
              const proj = state.tasks[projId];
              const coins = calculateTaskCoins(projId, state.tasks);
              return (
                <button
                  key={projId}
                  onClick={() => handleChangeActivePage(projId, "PROJECT")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isPageActive(projId, "PROJECT")
                      ? "bg-indigo-600 text-white shadow"
                      : "hover:bg-slate-800 text-slate-300 dark:hover:bg-slate-900"
                  }`}
                >
                  <span className="truncate">{proj.description}</span>
                  <span className="text-xs opacity-75 ml-2">🪙 {coins}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rewards Section */}
        <div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
            Store
          </div>
          <button
            onClick={() => handleChangeActivePage("REWARDS", "REWARDS")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              isPageActive("REWARDS", "REWARDS")
                ? "bg-indigo-600 text-white shadow"
                : "hover:bg-slate-800 text-slate-300 dark:hover:bg-slate-900"
            }`}
          >
            <span>🎁</span> Rewards Store
          </button>
        </div>
      </div>

      {/* Sidebar Footer: Theme Toggle Button */}
      <div className="pt-4 border-t border-slate-800 dark:border-slate-800/80">
        <button
          onClick={handleToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-slate-200 transition"
        >
          <span>Appearance</span>
          <span>{state.displayState.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
        </button>
      </div>
    </aside>

    {/* MAIN CONTENT AREA */}
    <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {isPageActive("REWARDS", "REWARDS") ? (
        <Rewards
          rewards={state.rewards}
          currentCoins={state.currentCoins}
          onClaimReward={handleClaimReward}
          onAddReward={handleAddReward}
          onUpdateReward={handleUpdateReward}
          onDeleteReward={handleDeleteReward}
        />
      ) : activeProjectTask ? (
        <Project
          key={activeProjectTask.id}
          projectTask={activeProjectTask}
          tasks={state.tasks}
          displayState={state.displayState}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          // onToggleComplete={handleToggleComplete}
          onToggleExpand={handleToggleExpand}
        />
      ) : (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          Select or create a project to get started.
        </div>
      )}
    </main>
  </div>
);
};
