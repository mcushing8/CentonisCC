"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Editor } from "@tiptap/core";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Minus,
  ImageIcon,
} from "lucide-react";

export type SlashCommandItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
  aliases?: string[];
  action: (editor: Editor, range: { from: number; to: number }) => void;
};

type SlashCommandListProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
};

export const SlashCommandList = forwardRef<
  { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
  SlashCommandListProps
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

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
      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#191919]/95 backdrop-blur-xl px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 shadow-2xl">
        No blocks found
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#202020]/95 backdrop-blur-xl py-2 shadow-2xl min-w-[280px] max-h-[360px] overflow-y-auto">
      <div className="px-3 pb-2 pt-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
        Basic blocks
      </div>
      {items.map((item, index) => (
        <button
          key={item.title}
          ref={(el) => { itemRefs.current[index] = el; }}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          className={`flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors ${
            index === selectedIndex
              ? "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-50"
              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
          }`}
          onClick={() => command(item)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-50 dark:bg-[#252525] border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400 shadow-sm">
            {item.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-[13px] text-zinc-900 dark:text-zinc-100">{item.title}</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});

SlashCommandList.displayName = "SlashCommandList";

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    aliases: ["h1", "heading1", "heading 1"],
    icon: <Heading1 className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    aliases: ["h2", "heading2", "heading 2"],
    icon: <Heading2 className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    aliases: ["h3", "heading3", "heading 3"],
    icon: <Heading3 className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Unordered list of items",
    aliases: ["bullet", "ul", "unordered", "bullets"],
    icon: <List className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered list of items",
    aliases: ["numbered", "ol", "ordered", "numbers"],
    icon: <ListOrdered className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "To-do List",
    description: "List with checkboxes",
    aliases: ["todo", "todolist", "to-do", "task", "tasks", "checkbox", "checklist"],
    icon: <ListTodo className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Quote",
    description: "Block quotation",
    aliases: ["blockquote", "quote", "citation"],
    icon: <Quote className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Fenced code snippet",
    aliases: ["code", "codeblock", "pre", "snippet"],
    icon: <Code2 className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Divider",
    description: "Horizontal separator",
    aliases: ["hr", "horizontal", "line", "separator"],
    icon: <Minus className="h-4 w-4" />,
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Image",
    description: "Embed an image from URL",
    aliases: ["img", "picture", "photo"],
    icon: <ImageIcon className="h-4 w-4" />,
    action: (editor, range) => {
      const url = window.prompt("Image URL");
      if (url)
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
    },
  },
];
