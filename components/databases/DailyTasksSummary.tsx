"use client";
import { useEffect, useState } from "react";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { listDailyTasks } from "@/services/dailyTaskService";
import { listWorkspaceMembers } from "@/services/workspaceService";
import type { DailyTask, WorkspaceMember } from "@/types/models";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export function DailyTasksSummary() {
  const { workspaceId } = useWorkspaceContext();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!workspaceId) return;
      setIsLoading(true);
      const [items, wsMembers] = await Promise.all([
        listDailyTasks(workspaceId, todayIso()),
        listWorkspaceMembers(workspaceId),
      ]);
      
      // Sort members so those with tasks show up first, then alphabetically
      wsMembers.sort((a, b) => a.userEmail.localeCompare(b.userEmail));
      
      setTasks(items);
      setMembers(wsMembers);
      setIsLoading(false);
    }
    void load();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="space-y-5">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2.5">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) return null;

  const hasAnyTasks = tasks.length > 0;

  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        {`Today's Progress`}
      </h2>
      
      <div className="space-y-6">
        {members.map((member) => {
          const userTasks = tasks.filter((t) => t.createdByUserId === member.userId);
          if (userTasks.length === 0 && hasAnyTasks) return null; // Hide users with no tasks if others have tasks
          
          const doneTasks = userTasks.filter((t) => t.status === "done").length;
          const totalTasks = userTasks.length;
          const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
          
          return (
            <div key={member.userId} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {member.userEmail.split("@")[0]}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium tabular-nums">
                  {doneTasks} / {totalTasks} tasks
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}

        {!hasAnyTasks && (
          <div className="py-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No tasks assigned for today yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
