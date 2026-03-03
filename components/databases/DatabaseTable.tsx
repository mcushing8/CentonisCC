"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { PageCoverBanner } from "@/components/ui/PageCoverBanner";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import {
  createDatabaseEntry,
  deleteDatabaseEntry,
  getDatabaseEntry,
  listDatabaseEntries,
  updateDatabaseEntry,
  type DatabaseEntryType,
} from "@/services/databaseEntryService";
import { StatusBadge } from "@/components/databases/StatusBadge";
import { EditableCell } from "@/components/databases/EditableCell";
import { SidePeek } from "@/components/ui/SidePeek";
import { DatabaseEntryPage } from "@/components/databases/DatabaseEntryPage";
import type { DatabaseEntry, EntryStatus } from "@/types/models";

const DB_LABELS: Record<DatabaseEntryType, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const TYPE_ROUTES: Record<DatabaseEntryType, string> = {
  weekly: "/weekly",
  monthly: "/monthly",
  quarterly: "/quarterly",
  yearly: "/yearly",
};

type DatabaseTableProps = {
  databaseType: DatabaseEntryType;
};

export function DatabaseTable({ databaseType }: DatabaseTableProps) {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const peekId = searchParams.get("peek");
  const [entries, setEntries] = useState<DatabaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [peekEntry, setPeekEntry] = useState<DatabaseEntry | null>(null);

  const label = DB_LABELS[databaseType];

  const refresh = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const items = await listDatabaseEntries(workspaceId, databaseType);
    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setEntries(items);
    setIsLoading(false);
  }, [workspaceId, databaseType]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (peekId) {
      getDatabaseEntry(peekId).then((data) => {
        if (data) setPeekEntry(data);
        else setPeekEntry(null);
      });
    } else {
      setPeekEntry(null);
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
    router.push(`/entry/${id}`);
  }

  async function handleInlineAdd() {
    if (!workspaceId || !user) return;
    const entryId = await createDatabaseEntry(workspaceId, user.uid, {
      databaseType,
      title: "",
      period: "",
      date: new Date().toISOString().split("T")[0],
    });
    await refresh();
    openPeek(entryId);
  }

  async function handleDelete(id: string) {
    await deleteDatabaseEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (peekId === id) closePeek();
  }

  async function handleStatusChange(id: string, status: EntryStatus) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
    await updateDatabaseEntry(id, { status });
    if (peekEntry?.id === id) setPeekEntry((p) => (p ? { ...p, status } : null));
  }

  async function handleTitleChange(id: string, title: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, title } : e))
    );
    await updateDatabaseEntry(id, { title });
    if (peekEntry?.id === id) setPeekEntry((p) => (p ? { ...p, title } : null));
  }

  async function handleDateChange(id: string, date: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, date } : e))
    );
    await updateDatabaseEntry(id, { date });
    if (peekEntry?.id === id) setPeekEntry((p) => (p ? { ...p, date } : null));
  }

  const backRoute = TYPE_ROUTES[databaseType];

  return (
    <div className="space-y-6 pb-24">
      <div className="px-2">
        <PageCoverBanner pageKey={databaseType} className="mb-6" />
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          {label} Goals
        </h1>

        <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <button className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded">
            <span className="font-medium">Table</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-[40%] font-mono">
                  Aa {label === "Weekly" ? "Week" : label}
                </th>
                <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-[25%]">
                  Date
                </th>
                <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                  Grade
                </th>
                <th className="px-3 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td colSpan={4} className="px-3 py-2.5">
                      <div className="h-5 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="group border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium">
                        <div className="flex items-center gap-2">
                          <EditableCell
                            value={entry.title}
                            onChange={(v) => handleTitleChange(entry.id, v)}
                            placeholder="Untitled"
                            isTitle
                          />
                          <button
                            onClick={() => openPeek(entry.id)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 rounded px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-sans font-normal"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Open
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300" onClick={(e) => e.stopPropagation()}>
                        <EditableCell
                          type="date"
                          value={entry.date}
                          onChange={(v) => handleDateChange(entry.id, v)}
                          placeholder="YYYY-MM-DD"
                        />
                      </td>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge
                          status={entry.status}
                          onChange={(s) => handleStatusChange(entry.id, s)}
                        />
                      </td>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr
                    onClick={() => void handleInlineAdd()}
                    className="border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td colSpan={4} className="px-3 py-3">
                      <span className="text-zinc-400 dark:text-zinc-500 text-sm flex items-center gap-2">
                        + New page
                      </span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SidePeek
        isOpen={!!peekId}
        onClose={closePeek}
        onOpenFullPage={() => peekId && openFullPage(peekId)}
      >
        {peekEntry && (
          <DatabaseEntryPage
            initialData={{
              title: peekEntry.title,
              content: peekEntry.content,
              status: peekEntry.status,
              coverImage: peekEntry.coverImage,
              icon: peekEntry.icon,
              properties: {
                period: peekEntry.period,
                date: peekEntry.date,
              },
            }}
            propertyLabels={[
              { key: "date", label: "Date" },
            ]}
            backHref={backRoute}
            backLabel={`Back to ${label}`}
            onSave={async (data) => {
              if (!peekEntry) return;
              await updateDatabaseEntry(peekEntry.id, data);
              setPeekEntry((p) => (p ? { ...p, ...data } : null));
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === peekEntry.id ? { ...e, ...data } : e
                )
              );
            }}
            onPropertyChange={async (key, value) => {
              if (!peekEntry) return;
              await updateDatabaseEntry(peekEntry.id, { [key]: value } as Record<string, string>);
              setPeekEntry((p) => (p ? { ...p, [key]: value } : null));
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === peekEntry.id ? { ...e, [key]: value } : e
                )
              );
            }}
            onBack={closePeek}
          />
        )}
      </SidePeek>
    </div>
  );
}
