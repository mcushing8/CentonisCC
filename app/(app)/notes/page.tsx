"use client";
/* This file renders the notes list page. */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { listNotes, createNote, deleteNote, updateNote } from "@/services/noteService";
import { NoteList } from "@/components/notes/NoteList";
import type { Note } from "@/types/models";
import { toast } from "sonner";

export default function NotesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load notes function
  async function loadNotes() {
    if (!user) return;
    try {
      const notesData = await listNotes(user.uid);
      // Sort by updatedAt descending
      notesData.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setNotes(notesData);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  }

  useEffect(() => {
    void loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCreateNote() {
    console.log("Create note clicked", { user });
    if (!user) return;
    setIsCreating(true);
    try {
      const noteId = await createNote(user.uid);
      console.log("Note created with ID:", noteId);
      router.push(`/notes/${noteId}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note. Please try again.");
      setIsCreating(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      await deleteNote(noteId);
      await loadNotes(); // Refresh list
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note.");
    }
  }

  async function handleRenameNote(noteId: string, newTitle: string) {
    try {
      await updateNote(noteId, { title: newTitle });
      await loadNotes(); // Refresh list
    } catch (error) {
      console.error("Failed to rename note:", error);
      toast.error("Failed to rename note.");
    }
  }

  if (isLoading || isLoadingNotes) {
    return <p className="text-sm text-zinc-400">Loading notes...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Notes</h1>
        <button
          onClick={() => void handleCreateNote()}
          disabled={isCreating}
          className="rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "Creating..." : "New Note"}
        </button>
      </div>
      <NoteList 
        notes={notes} 
        onDelete={handleDeleteNote}
        onRename={handleRenameNote}
      />
    </div>
  );
}
