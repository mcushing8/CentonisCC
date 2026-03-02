"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import {
  createWorkspace,
  joinWorkspaceByInviteCode,
} from "@/services/workspaceService";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user } = useAuth();
  const { refresh } = useWorkspaceContext();
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await createWorkspace(name.trim(), user.uid, user.email || "");
      await refresh();
      router.replace("/dashboard");
    } catch (error) {
      const message = (error as Error)?.message || "Unknown error";
      const isPermissionIssue =
        message.toLowerCase().includes("insufficient permissions") ||
        message.toLowerCase().includes("permission-denied");
      toast.error(
        isPermissionIssue
          ? "Failed to create workspace: Firestore rules are not deployed yet."
          : `Failed to create workspace: ${message}`
      );
      setIsSubmitting(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;
    setIsSubmitting(true);
    try {
      await joinWorkspaceByInviteCode(
        inviteCode.trim().toUpperCase(),
        user.uid,
        user.email || ""
      );
      await refresh();
      router.replace("/dashboard");
    } catch (error) {
      const message = (error as Error)?.message || "Unknown error";
      const isPermissionIssue =
        message.toLowerCase().includes("insufficient permissions") ||
        message.toLowerCase().includes("permission-denied");
      toast.error(
        isPermissionIssue
          ? "Failed to join workspace: Firestore rules are not deployed yet."
          : `Failed to join workspace: ${message}`
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome to CentonisCC
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Get started by creating or joining a workspace
          </p>
        </div>

        {mode === "choose" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode("create")}
              className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 p-8 hover:shadow-lg transition-all hover:border-zinc-400 dark:hover:border-zinc-600"
            >
              <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3 text-2xl">
                +
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Create Workspace
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Start a new workspace for your team
                </p>
              </div>
            </button>
            <button
              onClick={() => setMode("join")}
              className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 p-8 hover:shadow-lg transition-all hover:border-zinc-400 dark:hover:border-zinc-600"
            >
              <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3 text-2xl">
                &#x2192;
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Join Workspace
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Join with an invite code
                </p>
              </div>
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Create a Workspace
              </h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name..."
                autoFocus
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 text-sm"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || isSubmitting}
                  className="flex-1 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </div>
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Join a Workspace
              </h2>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Invite code (e.g. AB3CD5EF)"
                autoFocus
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 text-sm font-mono tracking-wider text-center uppercase"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!inviteCode.trim() || isSubmitting}
                  className="flex-1 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Joining..." : "Join Workspace"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
