"use client";
/* This file renders the personal workspace dashboard page. */
import { GoalManager } from "@/components/goals/GoalManager";
import { SummaryCards } from "@/components/shared/SummaryCards";
import { TeamManager } from "@/components/teams/TeamManager";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function PersonalDashboardPage() {
  const { user, isLoading } = useAuth();
  const workspace = useWorkspace("personal", user?.uid);

  if (isLoading || !user || workspace.isLoading) {
    return <p className="text-sm text-slate-600">Loading personal dashboard...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Personal Dashboard</h1>
      <SummaryCards summary={workspace.summary} />
      <GoalManager
        workspaceType="personal"
        workspaceId={user.uid}
        goals={workspace.goals}
        onRefresh={workspace.refresh}
      />
      <TeamManager
        userId={user.uid}
        selectedTeam={null}
        currentRole={null}
        onRefreshTeams={async () => {
          window.location.reload();
        }}
      />
    </div>
  );
}
