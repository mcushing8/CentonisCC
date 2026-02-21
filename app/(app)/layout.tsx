"use client";
/* This file protects app routes and wraps pages in shared workspace navigation. */
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { getTeamsForUser } from "@/services/teamService";
import type { Team } from "@/types/models";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    async function loadTeams() {
      if (!user) {
        return;
      }
      const nextTeams = await getTeamsForUser(user.uid);
      setTeams(nextTeams);
    }
    void loadTeams();
  }, [user]);

  if (isLoading || !user) {
    return <main className="p-6 text-sm text-slate-600">Loading...</main>;
  }

  return <AppShell teams={teams}>{children}</AppShell>;
}
