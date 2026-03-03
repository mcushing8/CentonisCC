"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { updatePageBanner } from "@/services/workspaceService";

export type PageBannerKey =
  | "dashboard"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "projects"
  | "notes";

type PageCoverBannerProps = {
  pageKey: PageBannerKey;
  /** Optional: override className for the container */
  className?: string;
};

export function PageCoverBanner({ pageKey, className = "" }: PageCoverBannerProps) {
  const { workspace, workspaceId, refresh } = useWorkspaceContext();
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const imageUrl = workspace?.pageBanners?.[pageKey] ?? null;

  useEffect(() => {
    if (isEditing) {
      setUrlInput(imageUrl || "");
      inputRef.current?.focus();
    }
  }, [isEditing, imageUrl]);

  async function handleSubmitUrl() {
    const url = urlInput.trim();
    if (!workspaceId) return;
    setIsSaving(true);
    try {
      await updatePageBanner(workspaceId, pageKey, url || null);
      await refresh();
      setIsEditing(false);
      setUrlInput("");
    } catch {
      // could show toast
    }
    setIsSaving(false);
  }

  async function handleRemove() {
    if (!workspaceId) return;
    setIsSaving(true);
    try {
      await updatePageBanner(workspaceId, pageKey, null);
      await refresh();
      setIsEditing(false);
    } catch {
      // could show toast
    }
    setIsSaving(false);
  }

  const heightClass = "h-[140px] sm:h-[180px]";
  const topSpacing = pageKey === "dashboard" ? "" : "mt-4";

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-xl ${heightClass} ${topSpacing} ${className}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- User-provided cover URLs; next/image requires known domains
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900" />
      )}

      {/* Hover overlay - Notion style */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
          isEditing ? "opacity-100 bg-black/40" : "opacity-0 group-hover:opacity-100 bg-black/20"
        }`}
      >
        {isEditing ? (
          <div className="flex flex-col gap-3 bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-4 w-[min(360px,90vw)]">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Link2 className="h-4 w-4 shrink-0" />
              Add cover image URL
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Use a high-resolution image (1200px+ wide) for best quality. Right-click an image → &quot;Copy image address&quot; or use &quot;Open image in new tab&quot; to get the full-resolution URL.
            </p>
            <input
              ref={inputRef}
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitUrl()}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-sm"
              disabled={isSaving}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmitUrl}
                disabled={isSaving}
                className="px-4 py-2 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSaving ? "Saving…" : "Add cover"}
              </button>
              {imageUrl && (
                <button
                  onClick={handleRemove}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
              <button
                onClick={() => {
                  setIsEditing(false);
                  setUrlInput("");
                }}
                className="ml-auto px-3 py-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors shadow-lg text-sm font-medium"
          >
            <ImagePlus className="h-4 w-4" />
            {imageUrl ? "Change cover" : "Add cover"}
          </button>
        )}
      </div>
    </div>
  );
}
