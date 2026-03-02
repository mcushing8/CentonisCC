"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import {
  updateWorkspaceName,
  listWorkspaceMembers,
  leaveWorkspace,
  regenerateInviteCode,
} from "@/services/workspaceService";
import type { WorkspaceMember } from "@/types/models";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const { workspace, workspaceId, refresh: refreshWorkspace } = useWorkspaceContext();
  const router = useRouter();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const m = await listWorkspaceMembers(workspaceId);
    m.sort(
      (a, b) =>
        new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    );
    setMembers(m);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setInviteCode(workspace.inviteCode);
      void loadMembers();
    }
  }, [workspace, loadMembers]);

  async function handleNameSave() {
    if (!workspaceId || !name.trim()) return;
    await updateWorkspaceName(workspaceId, name.trim());
    await refreshWorkspace();
    toast.success("Workspace name updated");
  }

  async function handleRegenerateCode() {
    if (!workspaceId) return;
    const newCode = await regenerateInviteCode(workspaceId);
    setInviteCode(newCode);
    await refreshWorkspace();
    toast.success("Invite code regenerated");
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(inviteCode);
    toast.success("Invite code copied to clipboard");
  }

  async function handleLeave() {
    if (!workspaceId || !user) return;
    if (
      !confirm(
        "Are you sure you want to leave this workspace? You will lose access to all data."
      )
    )
      return;
    await leaveWorkspace(workspaceId, user.uid);
    await refreshWorkspace();
    router.replace("/onboarding");
  }

  if (!workspace) {
    return <p className="text-sm text-zinc-400">Loading...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your workspace and team
        </p>
      </div>

      {/* Name */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Workspace Name
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
          />
          <button
            onClick={() => void handleNameSave()}
            className="rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>

      {/* Invite Code */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Invite Code
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Share this code with others to let them join your workspace.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-zinc-900 dark:text-zinc-100 select-all">
            {inviteCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Copy invite code"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => void handleRegenerateCode()}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Regenerate invite code"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Members ({members.length})
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {member.userEmail}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    Joined{" "}
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                {member.userId === user?.uid && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="text-xs text-red-600 dark:text-red-400/80">
          Leaving the workspace will remove your access to all data within it.
        </p>
        <button
          onClick={() => void handleLeave()}
          className="flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Leave Workspace
        </button>
      </div>
    </div>
  );
}
