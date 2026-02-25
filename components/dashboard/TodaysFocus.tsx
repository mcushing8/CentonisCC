"use client";
/* This component shows today's high priority tasks and progress. */
import type { Task } from "@/types/models";
import { useMemo } from "react";
import Link from "next/link";
import { deleteTask } from "@/services/taskService";

type TodaysFocusProps = {
  tasks: Task[];
  onRefresh: () => Promise<void>;
};

export function TodaysFocus({ tasks, onRefresh }: TodaysFocusProps) {
  const today = new Date().toLocaleDateString('en-CA');

  const todaysTasks = useMemo(() => {
    return tasks.filter((task) => {
      const isDueToday = task.dueDate === today;
      const isOverdue = task.dueDate < today && task.status !== "done";
      const isHighPriority = task.priority === "high" && task.status !== "done";
      return (isDueToday || isOverdue || isHighPriority) && task.status !== "done";
    });
  }, [tasks, today]);

  const totalDueToday = useMemo(() => {
    return tasks.filter((task) => {
      const isDueToday = task.dueDate === today;
      const isOverdue = task.dueDate < today && task.status !== "done";
      const isHighPriority = task.priority === "high" && task.status !== "done";
      return isDueToday || isOverdue || isHighPriority || (task.status === "done" && task.dueDate === today);
    }).length;
  }, [tasks, today]);

  const completedToday = useMemo(() => {
    return tasks.filter((task) => {
      const isDone = task.status === "done";
      if (!isDone) return false;
      const isDueToday = task.dueDate === today;
      const wasOverdue = task.dueDate < today;
      const wasHighPriority = task.priority === "high";
      return isDueToday || wasOverdue || wasHighPriority;
    }).length;
  }, [tasks, today]);

  const progress = totalDueToday > 0 ? Math.round((completedToday / totalDueToday) * 100) : 0;

  async function handleDelete(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await deleteTask(taskId);
    await onRefresh();
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>🎯</span> Today&apos;s Focus
        </h2>
        <div className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">
          {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-2xl">
        <div className="flex-1">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-2">Daily Progress</p>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{progress}%</p>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto pr-1 flex-1">
        {todaysTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-full border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/20 mt-2">
            <div className="text-4xl mb-3 opacity-50">✨</div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">All caught up!</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-[250px]">No priority tasks today. Enjoy your free time or get ahead on other goals.</p>
          </div>
        ) : (
          todaysTasks.map((task) => (
            <div key={task.id} className={`group flex items-center justify-between p-3 rounded-xl border transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${task.priority === 'high' ? 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5' : 'border-zinc-200 bg-white/50 dark:border-zinc-800/60 dark:bg-zinc-900/30'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${task.priority === 'high' ? 'bg-red-500 shadow-red-500/50' : task.priority === 'medium' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-zinc-400 dark:bg-zinc-500'}`}></span>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{task.title}</p>
                </div>
                <div className="flex gap-2 text-[10px] text-zinc-500 mt-1 ml-3.5">
                   {task.dueDate < today ? (
                     <span className="text-red-500 dark:text-red-400 font-bold uppercase tracking-wider">Overdue</span>
                   ) : (
                     <span>Due {new Date(task.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                   )}
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/goals/${task.goalId}`} className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors">
                  View
                </Link>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-[10px] px-2 py-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-500/20 dark:hover:text-red-300 transition-colors"
                  title="Delete task"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}