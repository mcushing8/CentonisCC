"use client";
import { DatabaseHome } from "@/components/databases/DatabaseHome";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: wsLoading, hasWorkspace } = useWorkspaceContext();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !wsLoading && user && !hasWorkspace) {
      router.replace("/onboarding");
    }
  }, [authLoading, wsLoading, user, hasWorkspace, router]);

  if (authLoading || wsLoading || !user || !hasWorkspace) {
    return <p className="text-sm text-zinc-400">Loading...</p>;
  }

  return <DatabaseHome />;
}
