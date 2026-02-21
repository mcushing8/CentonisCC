"use client";
/* This file loads goals/tasks and builds a summary for a workspace. */
import { useCallback, useEffect, useState } from "react";
import { listGoals } from "@/services/goalService";
import { buildWorkspaceSummary } from "@/services/dashboardService";
import { listTasksByWorkspace } from "@/services/taskService";
import type { Goal, Task, WorkspaceSummary, WorkspaceType } from "@/types/models";

type WorkspaceState = {
  goals: Goal[];
  tasks: Task[];
  summary: WorkspaceSummary;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const emptySummary: WorkspaceSummary = {
  activeGoals: 0,
  completedGoals: 0,
  todoTasks: 0,
  inProgressTasks: 0,
  doneTasks: 0,
};

export function useWorkspace(
  workspaceType: WorkspaceType,
  workspaceId: string | undefined,
): WorkspaceState {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<WorkspaceSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!workspaceId) {
      setGoals([]);
      setTasks([]);
      setSummary(emptySummary);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const [nextGoals, nextTasks] = await Promise.all([
      listGoals(workspaceType, workspaceId),
      listTasksByWorkspace(workspaceType, workspaceId),
    ]);
    setGoals(nextGoals);
    setTasks(nextTasks);
    setSummary(buildWorkspaceSummary(nextGoals, nextTasks));
    setIsLoading(false);
  }, [workspaceId, workspaceType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { goals, tasks, summary, isLoading, refresh };
}
