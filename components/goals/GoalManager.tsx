"use client";
/* This file renders goal CRUD UI for either personal or team workspace. */
import Link from "next/link";
import { useState } from "react";
import { createGoal, setGoalStatus, updateGoal } from "@/services/goalService";
import type { Goal, WorkspaceType } from "@/types/models";

type GoalManagerProps = {
  workspaceType: WorkspaceType;
  workspaceId: string;
  goals: Goal[];
  onRefresh: () => Promise<void>;
};

export function GoalManager({
  workspaceType,
  workspaceId,
  goals,
  onRefresh,
}: GoalManagerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createGoal({ workspaceType, workspaceId, title, description, dueDate });
    setTitle("");
    setDescription("");
    setDueDate("");
    await onRefresh();
  }

  async function handleSave(goalId: string) {
    await updateGoal(goalId, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate,
    });
    setEditingId(null);
    await onRefresh();
  }

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Goals</h2>
      <form onSubmit={handleCreate} className="grid gap-2 md:grid-cols-4">
        <input
          className="rounded border border-slate-300 p-2"
          placeholder="Title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="rounded border border-slate-300 p-2"
          placeholder="Description"
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <input
          className="rounded border border-slate-300 p-2"
          type="date"
          required
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Add Goal
        </button>
      </form>

      <div className="space-y-3">
        {goals.map((goal) => {
          const isEditing = editingId === goal.id;
          return (
            <article key={goal.id} className="rounded border border-slate-200 p-3">
              {isEditing ? (
                <div className="grid gap-2 md:grid-cols-4">
                  <input
                    className="rounded border border-slate-300 p-2"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                  <input
                    className="rounded border border-slate-300 p-2"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />
                  <input
                    className="rounded border border-slate-300 p-2"
                    type="date"
                    value={editDueDate}
                    onChange={(event) => setEditDueDate(event.target.value)}
                  />
                  <button
                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                    onClick={() => void handleSave(goal.id)}
                    type="button"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-slate-600">{goal.description}</p>
                    <p className="text-xs text-slate-500">Due: {goal.dueDate}</p>
                    <p className="text-xs text-slate-500">Status: {goal.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/goals/${goal.id}`}
                      className="rounded border border-slate-300 px-3 py-1 text-sm"
                    >
                      Open Tasks
                    </Link>
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-3 py-1 text-sm"
                      onClick={() => {
                        setEditingId(goal.id);
                        setEditTitle(goal.title);
                        setEditDescription(goal.description);
                        setEditDueDate(goal.dueDate);
                      }}
                    >
                      Edit
                    </button>
                    {goal.status !== "Completed" ? (
                      <button
                        type="button"
                        className="rounded bg-emerald-600 px-3 py-1 text-sm text-white"
                        onClick={() => void setGoalStatus(goal.id, "Completed").then(onRefresh)}
                      >
                        Mark Completed
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
