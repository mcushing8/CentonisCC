"use client";
import type { EntryStatus } from "@/types/models";

const STATUS_CONFIG: Record<EntryStatus, { label: string; className: string }> = {
  not_started: {
    label: "Not Started",
    className:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  done: {
    label: "Done",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
};

type StatusBadgeProps = {
  status: EntryStatus;
  onChange?: (status: EntryStatus) => void;
};

export function StatusBadge({ status, onChange }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!onChange) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  }

  const statuses: EntryStatus[] = ["not_started", "in_progress", "done"];

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as EntryStatus)}
      className={`cursor-pointer rounded-full border-0 px-2.5 py-0.5 text-xs font-medium outline-none ${config.className}`}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {STATUS_CONFIG[s].label}
        </option>
      ))}
    </select>
  );
}
