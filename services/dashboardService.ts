/* This file calculates dashboard summary counts from goals and tasks. */
import type { Goal, Task, WorkspaceSummary } from "@/types/models";

export function buildWorkspaceSummary(
  goals: Goal[],
  tasks: Task[],
): WorkspaceSummary {
  return {
    activeGoals: goals.filter((goal) => goal.status === "Active").length,
    completedGoals: goals.filter((goal) => goal.status === "Completed").length,
    todoTasks: tasks.filter((task) => task.status === "todo").length,
    inProgressTasks: tasks.filter((task) => task.status === "in_progress").length,
    doneTasks: tasks.filter((task) => task.status === "done").length,
  };
}
