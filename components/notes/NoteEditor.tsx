"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* This component provides a command-driven note editor with slash commands. */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useState, useRef } from "react";

type NoteEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onTitleChange?: (title: string) => void;
};

const SLASH_COMMANDS = [
  // Headings
  { command: "/h1", label: "Heading 1", icon: "H1", shortcut: "⌘+Opt+1", action: (editor: any) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { command: "/h2", label: "Heading 2", icon: "H2", shortcut: "⌘+Opt+2", action: (editor: any) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { command: "/h3", label: "Heading 3", icon: "H3", shortcut: "⌘+Opt+3", action: (editor: any) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  
  // Basic Formatting
  { command: "/bold", label: "Bold", icon: "B", shortcut: "⌘+B", action: (editor: any) => editor.chain().focus().toggleBold().run() },
  { command: "/italic", label: "Italic", icon: "I", shortcut: "⌘+I", action: (editor: any) => editor.chain().focus().toggleItalic().run() },
  { command: "/underline", label: "Underline", icon: "U", shortcut: "⌘+U", action: (editor: any) => editor.chain().focus().toggleUnderline().run() },
  { command: "/strike", label: "Strikethrough", icon: "S", shortcut: "⌘+Shift+X", action: (editor: any) => editor.chain().focus().toggleStrike().run() },
  { command: "/highlight", label: "Highlight", icon: "H", shortcut: "⌘+Shift+H", action: (editor: any) => editor.chain().focus().toggleHighlight().run() },
  { command: "/code", label: "Inline Code", icon: "<>", shortcut: "⌘+E", action: (editor: any) => editor.chain().focus().toggleCode().run() },

  // Lists & Structure
  { command: "/bullet", label: "Bullet List", icon: "•", shortcut: "⌘+Shift+8", action: (editor: any) => editor.chain().focus().toggleBulletList().run() },
  { command: "/number", label: "Numbered List", icon: "1.", shortcut: "⌘+Shift+7", action: (editor: any) => editor.chain().focus().toggleOrderedList().run() },
  { command: "/todo", label: "Todo List", icon: "☐", shortcut: "⌘+Shift+9", action: (editor: any) => editor.chain().focus().toggleBulletList().run() }, // Placeholder for now
  { command: "/quote", label: "Blockquote", icon: "❝", shortcut: "⌘+Shift+B", action: (editor: any) => editor.chain().focus().toggleBlockquote().run() },
  { command: "/codeblock", label: "Code Block", icon: "</>", shortcut: "⌘+Alt+C", action: (editor: any) => editor.chain().focus().toggleCodeBlock().run() },
  { command: "/hr", label: "Divider", icon: "—", shortcut: "---", action: (editor: any) => editor.chain().focus().setHorizontalRule().run() },

  // Alignment
  { command: "/left", label: "Align Left", icon: "L", shortcut: "⌘+Shift+L", action: (editor: any) => editor.chain().focus().setTextAlign('left').run() },
  { command: "/center", label: "Align Center", icon: "C", shortcut: "⌘+Shift+E", action: (editor: any) => editor.chain().focus().setTextAlign('center').run() },
  { command: "/right", label: "Align Right", icon: "R", shortcut: "⌘+Shift+R", action: (editor: any) => editor.chain().focus().setTextAlign('right').run() },
  { command: "/justify", label: "Justify", icon: "J", shortcut: "⌘+Shift+J", action: (editor: any) => editor.chain().focus().setTextAlign('justify').run() },

  // Inserts
  { command: "/link", label: "Link", icon: "🔗", shortcut: "⌘+K", action: (editor: any) => {
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('URL', previousUrl);
      if (url === null) return;
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } 
  },
  { command: "/image", label: "Image", icon: "🖼️", shortcut: "", action: (editor: any) => {
      const url = window.prompt('Image URL');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } 
  },

  // History
  { command: "/undo", label: "Undo", icon: "↩", shortcut: "⌘+Z", action: (editor: any) => editor.chain().focus().undo().run() },
  { command: "/redo", label: "Redo", icon: "↪", shortcut: "⌘+Shift+Z", action: (editor: any) => editor.chain().focus().redo().run() },
];

export function NoteEditor({ content, onChange, onTitleChange }: NoteEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slashQuery, setSlashQuery] = useState("");
  const [showLegend, setShowLegend] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Typography,
      Underline,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
    ],
    content,
    editable: true,
    onUpdate: ({ editor, transaction }) => {
      const html = editor.getHTML();
      onChange(html);

      // Detect slash command
      const { state } = editor.view;
      const { selection } = state;
      const { $from } = selection;
      const textBefore = state.doc.textBetween(Math.max(0, $from.pos - 50), $from.pos, "");
      const isAtLineStart = $from.parentOffset === 0 || textBefore.match(/\n[^/]*\/$/) || (textBefore.length < 2 && textBefore === "/");
      
      if (textBefore.endsWith("/") && (isAtLineStart || textBefore.match(/\s\/$/))) {
        setShowSlashMenu(true);
        setSlashQuery("");
        setSelectedIndex(0);
      } else if (showSlashMenu) {
        const match = textBefore.match(/\/([^\s/]*)$/);
        if (match && match[1]) {
          setSlashQuery(match[1]);
        } else if (!textBefore.includes("/")) {
          setShowSlashMenu(false);
          setSlashQuery("");
        }
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-zinc dark:prose-invert focus:outline-none min-h-[500px] max-w-none py-6 text-zinc-900 dark:text-zinc-200",
      },
      handleKeyDown: (view, event) => {
        if (showSlashMenu) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (filteredCommands[selectedIndex]) {
              filteredCommands[selectedIndex].action(editor);
              setShowSlashMenu(false);
              setSlashQuery("");
              setSelectedIndex(0);
            }
            return true;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setShowSlashMenu(false);
            setSlashQuery("");
            setSelectedIndex(0);
            return true;
          }
        }

        // Slash command detection is handled in onUpdate
      },
    },
  });

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.command.toLowerCase().includes(slashQuery.toLowerCase()) ||
    cmd.label.toLowerCase().includes(slashQuery.toLowerCase())
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="min-h-full transition-shadow">
        <EditorContent editor={editor} />
      </div>

      {showSlashMenu && editor && (
        <div
          ref={menuRef}
          className="absolute z-50 mt-2 w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl"
          style={{
            top: editor.view.coordsAtPos(editor.state.selection.$from.pos)?.top ? editor.view.coordsAtPos(editor.state.selection.$from.pos).top + 20 : 0,
            left: editor.view.coordsAtPos(editor.state.selection.$from.pos)?.left || 0,
          }}
        >
          <div className="p-2">
            <div className="mb-2 border-b border-zinc-100 dark:border-zinc-800 px-2 pb-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              Commands
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="px-2 py-2 text-sm text-zinc-500">No commands found</div>
              ) : (
                filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.command}
                    onClick={() => {
                      cmd.action(editor);
                      setShowSlashMenu(false);
                      setSlashQuery("");
                      setSelectedIndex(0);
                    }}
                    className={`w-full flex items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors ${
                      index === selectedIndex
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      {cmd.icon}
                    </span>
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-200">{cmd.label}</div>
                      <div className="text-xs text-zinc-500">{cmd.command}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Command Legend / Key */}
      <div className="fixed bottom-6 right-6 z-40">
        {showLegend ? (
          <div className="w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-t-xl">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowLegend(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="space-y-1">
                {SLASH_COMMANDS.map((cmd) => (
                  <div key={cmd.command} className="flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <span className="text-zinc-700 dark:text-zinc-400 font-medium">{cmd.label}</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                        {cmd.shortcut}
                      </code>
                    </div>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 px-2">
                  <p className="text-[10px] text-zinc-500">
                    Type <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded border border-zinc-200 dark:border-zinc-700">/</code> for command menu
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-105 transition-all text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="Keyboard Shortcuts"
          >
            ⌨️
          </button>
        )}
      </div>
    </div>
  );
}
