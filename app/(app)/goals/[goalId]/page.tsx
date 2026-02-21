"use client";
/* This file renders the goal details page with the task Kanban board. */
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { useAuth } from "@/hooks/useAuth";
import { getGoalById } from "@/services/goalService";
import type { Goal } from "@/types/models";

export default function GoalTasksPage() {
  const params = useParams<{ goalId: string }>();
  const goalId = params.goalId;
  const { user, isLoading } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadGoal() {
      if (isLoading || !user) {
        return;
      }
      try {
        setErrorMessage("");
        const nextGoal = await getGoalById(goalId);
        setGoal(nextGoal);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not load this goal right now.";
        setErrorMessage(message);
      }
    }
    void loadGoal();
  }, [goalId, isLoading, user]);

  if (errorMessage) {
    return <p className="rounded bg-red-50 p-2 text-sm text-red-600">{errorMessage}</p>;
  }

  if (isLoading || !user || !goal) {
    return <p className="text-sm text-slate-600">Loading goal tasks...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{goal.title}</h1>
          <p className="text-sm text-slate-600">{goal.description}</p>
        </div>
        <Link
          href={goal.workspaceType === "personal" ? "/dashboard" : `/teams/${goal.workspaceId}`}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          Back
        </Link>
      </div>
      <TaskBoard
        goalId={goal.id}
        workspaceType={goal.workspaceType}
        workspaceId={goal.workspaceId}
        userId={user.uid}
      />
    </div>
  );
}
