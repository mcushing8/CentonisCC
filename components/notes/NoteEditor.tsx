"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import DragHandle from "@tiptap/extension-drag-handle";
import { useCallback, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Highlighter,
} from "lucide-react";
import EntityMentionExtension from "@/lib/tiptap/extensions/EntityMentionExtension";
import SlashCommandExtension from "@/lib/tiptap/extensions/SlashCommandExtension";
import type { EntityMentionItem } from "@/components/mentions/EntityMentionList";

type NoteEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onTitleChange?: (title: string) => void;
};

const KEYBOARD_SHORTCUTS = [
  { label: "Heading 1", shortcut: "⌘+Opt+1" },
  { label: "Heading 2", shortcut: "⌘+Opt+2" },
  { label: "Heading 3", shortcut: "⌘+Opt+3" },
  { label: "Bold", shortcut: "⌘+B" },
  { label: "Italic", shortcut: "⌘+I" },
  { label: "Underline", shortcut: "⌘+U" },
  { label: "Strikethrough", shortcut: "⌘+Shift+X" },
  { label: "Highlight", shortcut: "⌘+Shift+H" },
  { label: "Inline Code", shortcut: "⌘+E" },
  { label: "Bullet List", shortcut: "⌘+Shift+8" },
  { label: "Numbered List", shortcut: "⌘+Shift+7" },
  { label: "Todo List", shortcut: "⌘+Shift+9" },
  { label: "Blockquote", shortcut: "⌘+Shift+B" },
  { label: "Code Block", shortcut: "⌘+Alt+C" },
  { label: "Divider", shortcut: "---" },
  { label: "Slash Command", shortcut: "/" },
  { label: "Undo", shortcut: "⌘+Z" },
  { label: "Redo", shortcut: "⌘+Shift+Z" },
];

export function NoteEditor({ content, onChange }: NoteEditorProps) {
  const [showLegend, setShowLegend] = useState(false);

  const mentionItemsRef = useRef<EntityMentionItem[]>([]);

  const getMentionItems = useCallback((query: string) => {
    const all = mentionItemsRef.current;
    if (!query) return all.slice(0, 20);
    const lower = query.toLowerCase();
    return all
      .filter((item) => item.label.toLowerCase().includes(lower))
      .slice(0, 20);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false,
        underline: false,
      }),
      Typography,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start typing...' }),
      EntityMentionExtension.configure({ getItems: getMentionItems }),
      SlashCommandExtension,
      BubbleMenuExtension,
      DragHandle.configure({
        render: () => {
          const el = document.createElement("div");
          el.classList.add("drag-handle");
          el.innerHTML =
            '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="3" r="1.25"/><circle cx="10" cy="3" r="1.25"/><circle cx="4" cy="7" r="1.25"/><circle cx="10" cy="7" r="1.25"/><circle cx="4" cy="11" r="1.25"/><circle cx="10" cy="11" r="1.25"/></svg>';
          return el;
        },
        nested: true,
      }),
    ],
    content,
    editable: true,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert focus:outline-none min-h-[500px] max-w-none pb-24 text-zinc-900 dark:text-zinc-100 prose-p:my-1.5 prose-p:leading-relaxed prose-headings:font-bold prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-[1.75rem] prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-700 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800/80 prose-pre:text-zinc-800 dark:prose-pre:text-zinc-200",
      },
    },
  });

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const menuBtn =
    "p-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors";
  const menuBtnActive =
    "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100";

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="min-h-full transition-shadow">
        <EditorContent editor={editor} />
      </div>

      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${menuBtn} ${editor.isActive("bold") ? menuBtnActive : ""}`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${menuBtn} ${editor.isActive("italic") ? menuBtnActive : ""}`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${menuBtn} ${editor.isActive("underline") ? menuBtnActive : ""}`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${menuBtn} ${editor.isActive("strike") ? menuBtnActive : ""}`}
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${menuBtn} ${editor.isActive("code") ? menuBtnActive : ""}`}
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`${menuBtn} ${editor.isActive("highlight") ? menuBtnActive : ""}`}
        >
          <Highlighter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`${menuBtn} ${editor.isActive("link") ? menuBtnActive : ""}`}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </BubbleMenu>

      <div className="fixed bottom-6 right-6 z-40">
        {showLegend ? (
          <div className="w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-t-xl">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowLegend(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="space-y-1">
                {KEYBOARD_SHORTCUTS.map((cmd, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="text-zinc-700 dark:text-zinc-400 font-medium">
                      {cmd.label}
                    </span>
                    <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                      {cmd.shortcut}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="Keyboard Shortcuts"
          >
            &#x2328;&#xFE0F;
          </button>
        )}
      </div>
    </div>
  );
}
