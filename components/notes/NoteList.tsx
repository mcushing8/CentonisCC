"use client";
/* This component displays a list of notes with delete and rename options. */
import Link from "next/link";
import { useState } from "react";
import type { Note } from "@/types/models";

type NoteListProps = {
  notes: Note[];
  onDelete: (noteId: string) => void;
  onRename: (noteId: string, newTitle: string) => void;
};

export function NoteList({ notes, onDelete, onRename }: NoteListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  function startEditing(note: Note, e: React.MouseEvent) {
    e.preventDefault();
    setEditingId(note.id);
    setEditTitle(note.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
  }

  function saveEditing(noteId: string, e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRename(noteId, editTitle.trim());
    }
    setEditingId(null);
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-8 text-center shadow-sm">
        <p className="text-zinc-400">No notes yet. Create your first note!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/30 p-4 transition-all hover:bg-white/80 dark:hover:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700/80"
        >
          {editingId === note.id ? (
            <form 
              onSubmit={(e) => saveEditing(note.id, e)} 
              className="flex flex-1 items-center gap-2"
            >
              <input
                autoFocus
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-zinc-500"
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEditing();
                }}
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <Link href={`/notes/${note.id}`} className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                  {note.title || "Untitled"}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {new Date(note.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Link>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => startEditing(note, e)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
                  title="Rename note"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm("Are you sure you want to delete this note?")) {
                      onDelete(note.id);
                    }
                  }}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete note"
                >
                  🗑️
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}