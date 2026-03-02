"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type FC,
} from "react";
import type { Editor, Range } from "@tiptap/core";

export type SlashCommandItem = {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
};

type SlashCommandListProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  selectedIndex?: number;
};

export const SlashCommandList: FC<SlashCommandListProps> = forwardRef<
  { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
  SlashCommandListProps
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 shadow-lg">
        No commands found
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-1 shadow-xl min-w-[240px] max-h-[320px] overflow-y-auto">
      <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Blocks
      </div>
      {items.map((item, index) => (
        <button
          key={item.title}
          type="button"
          className={`flex w-full items-center gap-3 px-2.5 py-2 text-sm transition-colors ${
            index === selectedIndex
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          }`}
          onClick={() => command(item)}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono">
            {item.icon}
          </span>
          <div className="text-left">
            <div className="font-medium text-[13px]">{item.title}</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});

SlashCommandList.displayName = "SlashCommandList";
