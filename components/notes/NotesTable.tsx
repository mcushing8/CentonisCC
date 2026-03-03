"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ExternalLink, ImageIcon, Table, Trash2 } from "lucide-react";
import { PageCoverBanner } from "@/components/ui/PageCoverBanner";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import {
  createNote,
  deleteNote,
  getNoteById,
  listNotes,
  updateNote,
} from "@/services/noteService";
import { EditableCell } from "@/components/databases/EditableCell";
import { SidePeek } from "@/components/ui/SidePeek";
import { NotePage } from "@/components/notes/NotePage";
import type { RandomNote } from "@/types/models";

function stripHtml(html: string, maxLength = 120): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, maxLength) + (text.length > maxLength ? "…" : "");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type ViewMode = "table" | "gallery";

export function NotesTable() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspaceContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const peekId = searchParams.get("peek");
  const [notes, setNotes] = useState<RandomNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [peekNote, setPeekNote] = useState<RandomNote | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const refresh = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const items = await listNotes(workspaceId);
    items.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setNotes(items);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (peekId) {
      getNoteById(peekId).then((data) => {
        if (data) setPeekNote(data);
        else setPeekNote(null);
      });
    } else {
      setPeekNote(null);
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
    router.push(`/notes/${id}`);
  }

  async function handleInlineAdd() {
    if (!workspaceId || !user) return;
    const noteId = await createNote(workspaceId, user.uid);
    await refresh();
    openPeek(noteId);
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (peekId === id) closePeek();
  }

  async function handleTitleChange(id: string, title: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title } : n))
    );
    await updateNote(id, { title });
    if (peekNote?.id === id) setPeekNote((p) => (p ? { ...p, title } : null));
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="px-2">
        <PageCoverBanner pageKey="notes" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          Notes
        </h1>

        <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
              viewMode === "table"
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span className="font-medium">Table</span>
          </button>
          <button
            onClick={() => setViewMode("gallery")}
            className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
              viewMode === "gallery"
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span className="font-medium">Gallery</span>
          </button>
        </div>

        {viewMode === "gallery" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-lg border border-zinc-200 dark:border-zinc-800 animate-pulse bg-zinc-100 dark:bg-zinc-800"
                />
              ))
            ) : (
              <>
                {notes.map((note) => (
                  <div key={note.id} className="group cursor-pointer">
                    <div
                      className="relative aspect-[3/4] rounded-lg border border-zinc-200 dark:border-zinc-700/80 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors bg-zinc-50 dark:bg-zinc-900"
                      onClick={() => openPeek(note.id)}
                    >
                      <div className="absolute inset-0">
                        {note.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element -- User-provided cover URLs; next/image requires known domains
                          <img
                            src={note.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full overflow-hidden relative bg-zinc-100 dark:bg-zinc-900">
                            <div
                              className="bg-white dark:bg-zinc-800/90 rounded-sm"
                              style={{
                                width: "200%",
                                height: "200%",
                                transform: "scale(0.5)",
                                transformOrigin: "top left",
                                padding: "24px",
                              }}
                            >
                              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-2xl leading-tight mb-3">
                                {note.title || "Untitled"}
                              </div>
                              <div
                                className="pointer-events-none prose prose-zinc dark:prose-invert prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:text-zinc-600 dark:prose-p:text-zinc-300 max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-6 prose-h1:mb-3 prose-h2:text-2xl prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-xl prose-h3:mt-3 prose-h3:mb-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:text-zinc-600 dark:prose-li:text-zinc-300 prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-600 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-zinc-500 dark:prose-blockquote:text-zinc-400 prose-code:bg-zinc-200 dark:prose-code:bg-zinc-700 prose-code:text-zinc-800 dark:prose-code:text-zinc-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-200 dark:prose-pre:bg-zinc-700/80 prose-pre:text-zinc-800 dark:prose-pre:text-zinc-200"
                                dangerouslySetInnerHTML={{
                                  __html: note.content || "<p class='italic text-zinc-400 dark:text-zinc-500'>No content yet</p>",
                                }}
                              />
                            </div>
                            {/* Subtle fade at the bottom to smoothly cut off overflowing text */}
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-zinc-800 to-transparent pointer-events-none" />
                          </div>
                        )}
                      </div>
                      
                      <div
                        className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openPeek(note.id)}
                          className="p-1.5 rounded-md bg-white/95 dark:bg-zinc-700/95 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1.5 rounded-md bg-white/95 dark:bg-zinc-700/95 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-600/60 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 px-0.5">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {note.title || "Untitled"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="group cursor-pointer">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleInlineAdd();
                    }}
                    className="w-full relative aspect-[3/4] rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 text-sm">
                      + New page
                    </span>
                  </button>
                  <div className="mt-2.5 px-0.5 opacity-0 pointer-events-none select-none" aria-hidden>
                    <p className="text-sm font-medium">Placeholder</p>
                    <p className="text-xs mt-0.5">Placeholder</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-[40%] font-mono">
                    Aa Title
                  </th>
                  <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                    Preview
                  </th>
                  <th className="px-3 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                    Updated
                  </th>
                  <th className="px-3 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-zinc-100 dark:border-zinc-800/50"
                    >
                      <td colSpan={4} className="px-3 py-2.5">
                        <div className="h-5 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    {notes.map((note) => (
                      <tr
                        key={note.id}
                        className="group border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-3 py-2 font-medium">
                          <div className="flex items-center gap-2">
                            <EditableCell
                              value={note.title}
                              onChange={(v) =>
                                handleTitleChange(note.id, v)
                              }
                              placeholder="Untitled"
                              isTitle
                            />
                            <button
                              onClick={() => openPeek(note.id)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 rounded px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-sans font-normal"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Open
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 max-w-[280px] text-zinc-600 dark:text-zinc-400 truncate">
                          {stripHtml(note.content) || (
                            <span className="text-zinc-400">
                              No content
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                          {formatDate(note.updatedAt)}
                        </td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(note.id)}
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
        )}
      </div>

      <SidePeek
        isOpen={!!peekId}
        onClose={closePeek}
        onOpenFullPage={() => peekId && openFullPage(peekId)}
      >
        {peekNote && (
          <NotePage
            initialData={peekNote}
            backHref="/notes"
            backLabel="Back to Notes"
            onSave={async (data) => {
              if (!peekNote) return;
              await updateNote(peekNote.id, data);
              setPeekNote((p) => (p ? { ...p, ...data } : null));
              setNotes((prev) =>
                prev.map((n) =>
                  n.id === peekNote.id ? { ...n, ...data } : n
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
