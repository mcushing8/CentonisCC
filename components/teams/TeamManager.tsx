"use client";
/* This file lets owners create teams and add members by email. */
import { useState } from "react";
import { addTeamMemberByEmail, createTeam } from "@/services/teamService";
import type { Team, TeamRole } from "@/types/models";

type TeamManagerProps = {
  userId: string;
  selectedTeam: Team | null;
  currentRole: TeamRole | null;
  onRefreshTeams: () => Promise<void>;
};

export function TeamManager({
  userId,
  selectedTeam,
  currentRole,
  onRefreshTeams,
}: TeamManagerProps) {
  const [newTeamName, setNewTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<TeamRole>("member");
  const [message, setMessage] = useState("");

  async function handleCreateTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    await createTeam(newTeamName, userId);
    setNewTeamName("");
    setMessage("Team created.");
    await onRefreshTeams();
  }

  async function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTeam) {
      return;
    }
    setMessage("");
    await addTeamMemberByEmail(selectedTeam.id, memberRole, memberEmail);
    setMemberEmail("");
    setMessage("Member added.");
  }

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Team Management</h2>

      <form onSubmit={handleCreateTeam} className="space-y-2">
        <p className="text-sm font-medium">Create Team</p>
        <input
          className="w-full rounded border border-slate-300 p-2"
          value={newTeamName}
          onChange={(event) => setNewTeamName(event.target.value)}
          required
          placeholder="Team name"
        />
        <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Create
        </button>
      </form>

      {selectedTeam && currentRole === "owner" ? (
        <form onSubmit={handleAddMember} className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium">Add Member by Email</p>
          <input
            className="w-full rounded border border-slate-300 p-2"
            type="email"
            value={memberEmail}
            onChange={(event) => setMemberEmail(event.target.value)}
            required
            placeholder="member@example.com"
          />
          <select
            className="w-full rounded border border-slate-300 p-2"
            value={memberRole}
            onChange={(event) => setMemberRole(event.target.value as TeamRole)}
          >
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
          <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
            Add Member
          </button>
        </form>
      ) : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </section>
  );
}
