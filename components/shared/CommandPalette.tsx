"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const navItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Daily Tasks", href: "/daily" },
    { label: "Weekly", href: "/weekly" },
    { label: "Monthly", href: "/monthly" },
    { label: "Quarterly", href: "/quarterly" },
    { label: "Yearly", href: "/yearly" },
    { label: "Projects", href: "/projects" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 p-2"
    >
      <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-3">
        <span className="text-zinc-400 mr-2">⌘</span>
        <Command.Input
          placeholder="Search databases, pages, or commands..."
          className="w-full py-3 text-sm outline-none placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100 bg-transparent"
        />
      </div>

      <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden py-2 px-1 scroll-py-2">
        <Command.Empty className="py-6 text-center text-sm text-zinc-500">
          No results found.
        </Command.Empty>

        <Command.Group
          heading="Navigation"
          className="text-xs font-semibold text-zinc-500 px-2 py-1.5 mb-1"
        >
          {navItems.map((item) => (
            <Command.Item
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
              className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
            >
              {item.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>

      <div className="border-t border-zinc-100 dark:border-zinc-800 py-2 px-3 flex justify-between items-center text-[10px] text-zinc-400">
        <div className="flex gap-2">
          <span>
            Move:{" "}
            <kbd className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
              &uarr;
            </kbd>{" "}
            <kbd className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
              &darr;
            </kbd>
          </span>
          <span>
            Select:{" "}
            <kbd className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
              Enter
            </kbd>
          </span>
        </div>
        <span>
          Open:{" "}
          <kbd className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
            ⌘ K
          </kbd>
        </span>
      </div>
    </Command.Dialog>
  );
}
