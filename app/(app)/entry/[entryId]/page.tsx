"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getDatabaseEntry,
  updateDatabaseEntry,
} from "@/services/databaseEntryService";
import { DatabaseEntryPage } from "@/components/databases/DatabaseEntryPage";
import type { DatabaseEntry, EntryStatus } from "@/types/models";

const TYPE_ROUTES: Record<string, string> = {
  weekly: "/weekly",
  monthly: "/monthly",
  quarterly: "/quarterly",
  yearly: "/yearly",
};

const TYPE_LABELS: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export default function EntryDetailPage() {
  const params = useParams<{ entryId: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<DatabaseEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getDatabaseEntry(params.entryId);
      if (!data) {
        router.replace("/dashboard");
        return;
      }
      setEntry(data);
      setIsLoading(false);
    }
    void load();
  }, [params.entryId, router]);

  const handleSave = useCallback(
    async (data: {
      title?: string;
      content?: string;
      status?: EntryStatus;
      coverImage?: string;
      icon?: string;
    }) => {
      if (!entry) return;
      await updateDatabaseEntry(entry.id, data);
      setEntry((prev) => (prev ? { ...prev, ...data } : null));
    },
    [entry]
  );

  const handlePropertyChange = useCallback(
    async (key: string, value: string) => {
      if (!entry) return;
      await updateDatabaseEntry(entry.id, { [key]: value } as Record<string, string>);
    },
    [entry]
  );

  if (isLoading || !entry) {
    return <p className="text-sm text-zinc-400">Loading...</p>;
  }

  const backRoute = TYPE_ROUTES[entry.databaseType] || "/dashboard";
  const backLabel = `Back to ${TYPE_LABELS[entry.databaseType] || "Dashboard"}`;

  return (
    <DatabaseEntryPage
      initialData={{
        title: entry.title,
        content: entry.content,
        status: entry.status,
        coverImage: entry.coverImage,
        icon: entry.icon,
        properties: {
          period: entry.period,
          date: entry.date,
        },
      }}
      propertyLabels={[
        { key: "date", label: "Date" },
      ]}
      backHref={backRoute}
      backLabel={backLabel}
      onSave={handleSave}
      onPropertyChange={handlePropertyChange}
    />
  );
}
