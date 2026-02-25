"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export function FloatingDock({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        className
      )}
    >
      <div className="flex h-16 items-center gap-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-4 backdrop-blur-md shadow-2xl">
        {items.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");
          return (
            <Link href={item.href} key={item.title}>
              <motion.div
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "group relative flex aspect-square w-12 items-center justify-center rounded-xl transition-colors",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                )}
              >
                {item.icon}

                {/* Tooltip */}
                <span className="absolute -top-10 scale-0 rounded bg-zinc-900 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-100 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
                  {item.title}
                </span>

                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -bottom-2 h-1 w-1 rounded-full bg-blue-500 dark:bg-zinc-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
