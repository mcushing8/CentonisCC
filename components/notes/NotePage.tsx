"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import type { RandomNote } from "@/types/models";

type NotePageProps = {
  initialData: RandomNote;
  backHref: string;
  backLabel: string;
  onSave: (data: Partial<Pick<RandomNote, "title" | "content">>) => Promise<void>;
  onBack?: () => void;
};

export function NotePage({
  initialData,
  backHref,
  backLabel,
  onSave,
  onBack,
}: NotePageProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(
    (data: Partial<Pick<RandomNote, "title" | "content">>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void onSave(data);
      }, 800);
    },
    [onSave]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function handleBack() {
    if (onBack) onBack();
    else router.push(backHref);
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  }

  function handleContentChange(html: string) {
    setContent(html);
    debouncedSave({ content: html });
  }

  return (
    <div className="mx-auto max-w-4xl pb-16 sm:pb-24">
      {!onBack && (
        <div className="px-4 pt-4 sm:px-8 md:px-12">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors py-2 -my-2 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {backLabel}
          </button>
        </div>
      )}

      <div className={`px-4 sm:px-8 md:px-12 ${onBack ? "mt-20 sm:mt-24 pt-2" : "mt-6"}`}>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-transparent text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
          placeholder="Untitled note"
        />
      </div>

      <div className="mt-8 sm:mt-12 px-4 sm:px-8 md:px-12">
        <NoteEditor content={content} onChange={handleContentChange} />
      </div>
    </div>
  );
}
