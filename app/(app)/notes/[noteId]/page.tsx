"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getNoteById, updateNote } from "@/services/noteService";
import { NotePage } from "@/components/notes/NotePage";
import type { RandomNote } from "@/types/models";

export default function NoteDetailPage() {
  const params = useParams<{ noteId: string }>();
  const router = useRouter();
  const [note, setNote] = useState<RandomNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getNoteById(params.noteId);
      if (!data) {
        router.replace("/notes");
        return;
      }
      setNote(data);
      setIsLoading(false);
    }
    void load();
  }, [params.noteId, router]);

  const handleSave = useCallback(
    async (data: Partial<Pick<RandomNote, "title" | "content">>) => {
      if (!note) return;
      await updateNote(note.id, data);
      setNote((prev) => (prev ? { ...prev, ...data } : null));
    },
    [note]
  );

  if (isLoading || !note) {
    return <p className="text-sm text-zinc-400">Loading note...</p>;
  }

  return (
    <NotePage
      initialData={note}
      backHref="/notes"
      backLabel="Back to Notes"
      onSave={handleSave}
    />
  );
}
