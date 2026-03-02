"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDailyTask, updateDailyTask } from "@/services/dailyTaskService";
import { DailyTaskPage } from "@/components/databases/DailyTaskPage";
import type { DailyTask, EntryStatus } from "@/types/models";

export default function TaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const [task, setTask] = useState<DailyTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getDailyTask(params.taskId);
      if (!data) {
        router.replace("/daily");
        return;
      }
      setTask(data);
      setIsLoading(false);
    }
    void load();
  }, [params.taskId, router]);

  const handleSave = useCallback(
    async (data: { title?: string; description?: string; status?: EntryStatus; date?: string }) => {
      if (!task) return;
      await updateDailyTask(task.id, data);
      setTask((prev) => (prev ? { ...prev, ...data } : null));
    },
    [task]
  );

  if (isLoading || !task) {
    return <p className="text-sm text-zinc-400">Loading...</p>;
  }

  return (
    <DailyTaskPage
      initialData={{
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        date: task.date,
      }}
      backHref="/daily"
      backLabel="Back to Daily"
      onSave={handleSave}
    />
  );
}
