"use client";
/* This file displays and creates comments for a specific task. */
import { useCallback, useEffect, useState } from "react";
import { createComment, listTaskComments } from "@/services/commentService";
import type { Comment, WorkspaceType } from "@/types/models";

type TaskCommentsProps = {
  taskId: string;
  goalId: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  authorUserId: string;
};

export function TaskComments({
  taskId,
  goalId,
  workspaceType,
  workspaceId,
  authorUserId,
}: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  const refresh = useCallback(async () => {
    const next = await listTaskComments(taskId);
    setComments(next.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
  }, [taskId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createComment({
      taskId,
      goalId,
      workspaceType,
      workspaceId,
      authorUserId,
      text,
    });
    setText("");
    await refresh();
  }

  return (
    <div className="space-y-2 rounded border border-slate-200 p-2">
      <p className="text-xs font-medium text-slate-600">Comments</p>
      <div className="max-h-32 space-y-1 overflow-auto">
        {comments.map((comment) => (
          <p key={comment.id} className="rounded bg-slate-50 p-1 text-xs">
            {comment.text}
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="w-full rounded border border-slate-300 p-1 text-xs"
          required
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add comment"
        />
        <button className="rounded bg-slate-900 px-2 py-1 text-xs text-white">
          Post
        </button>
      </form>
    </div>
  );
}
