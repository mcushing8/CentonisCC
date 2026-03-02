"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { Trash2, GripVertical, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import {
  createDailyTask,
  deleteDailyTask,
  getDailyTask,
  listDailyTasks,
  updateDailyTask,
  updateDailyTaskStatus,
  updateDailyTaskOwner,
} from "@/services/dailyTaskService";
import { listWorkspaceMembers } from "@/services/workspaceService";
import { SidePeek } from "@/components/ui/SidePeek";
import { DailyTaskPage } from "@/components/databases/DailyTaskPage";
import type { DailyTask, WorkspaceMember } from "@/types/models";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function TaskCard({
  task,
  onDelete,
  onToggleStatus,
  onOpenPeek,
}: {
  task: DailyTask;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onOpenPeek: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isDone = task.status === "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 sm:gap-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm px-3 py-2.5 sm:py-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] ${
        isDone ? "opacity-60" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0 p-1 -m-1 touch-manipulation"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleStatus(task.id, task.status); }}
        className={`flex h-6 w-6 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded border transition-colors touch-manipulation min-w-[24px] min-h-[24px] ${
          isDone
            ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 text-white dark:text-zinc-900"
            : "border-zinc-300 dark:border-zinc-700 bg-transparent hover:border-zinc-400 dark:hover:border-zinc-500 active:border-zinc-500"
        }`}
        aria-label={isDone ? "Mark as not done" : "Mark as done"}
      >
        {isDone && <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5" />}
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onOpenPeek(task.id); }}
        className={`flex-1 min-w-0 text-left text-sm sm:text-[15px] truncate transition-colors cursor-pointer hover:underline active:opacity-80 py-1 -my-1 ${
          isDone
            ? "text-zinc-400 dark:text-zinc-500 line-through"
            : "text-zinc-800 dark:text-zinc-200"
        }`}
      >
        {task.title || "Untitled task"}
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-400 hover:text-red-500 active:text-red-500 transition-all shrink-0 p-1.5 -m-1.5 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Column({
  userEmail,
  userId,
  tasks,
  onAdd,
  onDelete,
  onToggleStatus,
  onOpenPeek,
}: {
  userEmail: string;
  userId: string;
  tasks: DailyTask[];
  onAdd: (userId: string, title: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onOpenPeek: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: userId });
  const [newTaskTitle, setNewTaskTitle] = useState("");

  function handleAddSubmit() {
    const t = newTaskTitle.trim();
    if (!t) return;
    onAdd(userId, t);
    setNewTaskTitle("");
  }

  // Use a simple color mapping based on userId length or hash to give each column a subtle tint
  const colors = [
    "border-blue-400/50 dark:border-blue-500/50",
    "border-purple-400/50 dark:border-purple-500/50",
    "border-amber-400/50 dark:border-amber-500/50",
    "border-emerald-400/50 dark:border-emerald-500/50",
    "border-rose-400/50 dark:border-rose-500/50",
  ];
  const colorIndex = userId.length % colors.length;
  const borderColor = colors[colorIndex];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border-t-4 ${borderColor} bg-zinc-50/40 dark:bg-[#1a1a1a]/40 min-h-[320px] sm:min-h-[400px] transition-colors ${
        isOver ? "bg-zinc-100/60 dark:bg-[#202020]/60 ring-2 ring-zinc-200 dark:ring-zinc-800" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden min-w-0">
          <div className="h-7 w-7 sm:h-6 sm:w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {userEmail.split("@")[0]}
          </h3>
          <span className="rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-2 sm:space-y-2.5 p-3 sm:p-3 flex flex-col min-h-0">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onOpenPeek={onOpenPeek}
            />
          ))}
        </SortableContext>
        <div className="pt-2 mt-auto border-t border-zinc-200/50 dark:border-zinc-800/50 shrink-0">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSubmit()}
            placeholder="Add a task…"
            className="w-full bg-transparent text-sm sm:text-[15px] text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none px-2 py-2.5 sm:py-1.5 rounded-md hover:bg-zinc-100/60 dark:hover:bg-zinc-800/30 focus:bg-zinc-100/80 dark:focus:bg-zinc-800/50 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
          />
        </div>
      </div>
    </div>
  );
}

export function DailyKanban() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const peekId = searchParams.get("peek");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [date, setDate] = useState(todayIso());
  const [activeTask, setActiveTask] = useState<DailyTask | null>(null);
  const [peekTask, setPeekTask] = useState<DailyTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const refresh = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const [items, wsMembers] = await Promise.all([
      listDailyTasks(workspaceId, date),
      listWorkspaceMembers(workspaceId),
    ]);
    
    // Sort members to put the current user first
    const sortedMembers = [...wsMembers].sort((a, b) => {
      if (a.userId === user?.uid) return -1;
      if (b.userId === user?.uid) return 1;
      return a.userEmail.localeCompare(b.userEmail);
    });
    
    setMembers(sortedMembers);
    setTasks(items);
    setIsLoading(false);
  }, [workspaceId, date, user?.uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (peekId) {
      getDailyTask(peekId).then((data) => {
        if (data) setPeekTask(data);
        else setPeekTask(null);
      });
    } else {
      setPeekTask(null);
    }
  }, [peekId]);

  function closePeek() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("peek");
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
  }

  function openPeek(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("peek", id);
    router.replace(`${pathname}?${params}`);
  }

  function openFullPage(id: string) {
    router.push(`/daily/${id}`);
  }

  async function handleAdd(userId: string, title: string) {
    if (!workspaceId || !title.trim()) return;
    const taskId = await createDailyTask(workspaceId, userId, {
      title: title.trim(),
      date,
    });
    await refresh();
    openPeek(taskId);
  }

  async function handleDelete(id: string) {
    await deleteDailyTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "done" ? "not_started" : "done";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus as any } : t))
    );
    await updateDailyTaskStatus(id, newStatus as any);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const overId = over.id as string;
    const isColumn = members.some((m) => m.userId === overId);
    
    let newUserId = isColumn ? overId : tasks.find((t) => t.id === overId)?.createdByUserId;

    if (!newUserId) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.createdByUserId === newUserId) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, createdByUserId: newUserId! } : t))
    );
    await updateDailyTaskOwner(task.id, newUserId);
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-32">
      <div className="px-4 sm:px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 mt-2 sm:mt-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              Daily Tasks
            </h1>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
              See what everyone is working on today
            </p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:w-auto sm:min-w-[160px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 sm:py-2 text-[15px] font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all shadow-sm touch-manipulation"
          />
        </div>

        {isLoading ? (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 sm:pb-8 snap-x snap-mandatory -mx-4 sm:mx-0 px-4 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[280px] sm:min-w-[320px] max-w-[340px] sm:max-w-[400px] flex-shrink-0 h-[360px] sm:h-[400px] rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/30 animate-pulse snap-center" />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 sm:pb-8 snap-x snap-mandatory items-start -mx-4 sm:mx-0 px-4 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain">
              {members.map((member) => (
                <div key={member.userId} className="min-w-[280px] sm:min-w-[320px] max-w-[340px] sm:max-w-[400px] flex-shrink-0 snap-center">
                  <Column
                    userEmail={member.userEmail}
                    userId={member.userId}
                    tasks={tasks.filter((t) => t.createdByUserId === member.userId)}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onOpenPeek={openPeek}
                  />
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 shadow-2xl text-sm sm:text-[15px] text-zinc-800 dark:text-zinc-200 flex items-center gap-3 max-w-[min(340px,90vw)]">
                  <GripVertical className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="truncate">{activeTask.title || "Untitled task"}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <SidePeek
          isOpen={!!peekId}
          onClose={closePeek}
          onOpenFullPage={() => peekId && openFullPage(peekId)}
        >
          {peekTask && (
            <DailyTaskPage
              initialData={{
                title: peekTask.title,
                description: peekTask.description ?? "",
                status: peekTask.status,
                date: peekTask.date,
              }}
              backHref="/daily"
              backLabel="Back to Daily"
              onSave={async (data) => {
                if (!peekTask) return;
                await updateDailyTask(peekTask.id, data);
                setPeekTask((p) => (p ? { ...p, ...data } : null));
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === peekTask.id ? { ...t, ...data } : t
                  )
                );
              }}
              onBack={closePeek}
            />
          )}
        </SidePeek>
      </div>
    </div>
  );
}
