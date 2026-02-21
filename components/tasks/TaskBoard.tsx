"use client";
/* This file renders a drag-and-drop Kanban board for a goal's tasks. */
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useState } from "react";
import { createTask, listTasksByGoal, moveTask } from "@/services/taskService";
import type { Task, TaskStatus, WorkspaceType } from "@/types/models";
import { TaskComments } from "@/components/tasks/TaskComments";

type TaskBoardProps = {
  goalId: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  userId: string;
};

const columns: Array<{ id: TaskStatus; label: string }> = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

function TaskCard({
  task,
  userId,
}: {
  task: Task;
  userId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { taskId: task.id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="space-y-2 rounded border border-slate-200 bg-white p-2"
    >
      <button
        type="button"
        className="w-full cursor-grab rounded bg-slate-100 p-1 text-left text-sm"
        {...listeners}
        {...attributes}
      >
        {task.title}
      </button>
      <p className="text-xs text-slate-500">Due: {task.dueDate}</p>
      {task.workspaceType === "team" ? (
        <p className="text-xs text-slate-500">
          Assignee: {task.assigneeUserId ?? "Unassigned"}
        </p>
      ) : null}
      <TaskComments
        taskId={task.id}
        goalId={task.goalId}
        workspaceType={task.workspaceType}
        workspaceId={task.workspaceId}
        authorUserId={userId}
      />
    </article>
  );
}

function BoardColumn({
  columnId,
  label,
  tasks,
  userId,
}: {
  columnId: TaskStatus;
  label: string;
  tasks: Task[];
  userId: string;
}) {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div ref={setNodeRef} className="min-h-[240px] rounded-lg bg-slate-100 p-3">
      <h3 className="mb-3 text-sm font-semibold">{label}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} userId={userId} />
        ))}
      </div>
    </div>
  );
}

export function TaskBoard({
  goalId,
  workspaceType,
  workspaceId,
  userId,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");

  const refresh = useCallback(async () => {
    const next = await listTasksByGoal(goalId);
    setTasks(next);
  }, [goalId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createTask({
      goalId,
      workspaceType,
      workspaceId,
      title,
      dueDate,
      assigneeUserId: workspaceType === "team" ? assigneeUserId || null : null,
    });
    setTitle("");
    setDueDate("");
    setAssigneeUserId("");
    await refresh();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const targetStatus = event.over?.id as TaskStatus | undefined;
    if (!targetStatus || !columns.some((column) => column.id === targetStatus)) {
      return;
    }
    await moveTask(taskId, targetStatus);
    await refresh();
  }

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Tasks</h2>
      <form onSubmit={handleCreateTask} className="grid gap-2 md:grid-cols-4">
        <input
          className="rounded border border-slate-300 p-2"
          required
          placeholder="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="rounded border border-slate-300 p-2"
          type="date"
          required
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        {workspaceType === "team" ? (
          <input
            className="rounded border border-slate-300 p-2"
            placeholder="Assignee user ID (optional)"
            value={assigneeUserId}
            onChange={(event) => setAssigneeUserId(event.target.value)}
          />
        ) : (
          <div />
        )}
        <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Add Task
        </button>
      </form>

      <DndContext onDragEnd={(event) => void handleDragEnd(event)}>
        <div className="grid gap-3 md:grid-cols-3">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              columnId={column.id}
              label={column.label}
              tasks={tasks.filter((task) => task.status === column.id)}
              userId={userId}
            />
          ))}
        </div>
      </DndContext>
    </section>
  );
}
