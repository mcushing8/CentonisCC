"use client";
import Link from "next/link";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  CalendarClock,
  Target,
  FolderKanban,
  FileText,
} from "lucide-react";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";

export function DatabaseHome() {
  const { workspace } = useWorkspaceContext();

  const databases = [
    {
      title: "Daily Tasks",
      href: "/daily",
      icon: <CalendarDays className="h-[18px] w-[18px]" />,
    },
    {
      title: "Weekly Goals",
      href: "/weekly",
      icon: <CalendarRange className="h-[18px] w-[18px]" />,
    },
    {
      title: "Monthly Goals",
      href: "/monthly",
      icon: <Calendar className="h-[18px] w-[18px]" />,
    },
    {
      title: "Quarterly Goals",
      href: "/quarterly",
      icon: <CalendarClock className="h-[18px] w-[18px]" />,
    },
    {
      title: "Yearly Goals",
      href: "/yearly",
      icon: <Target className="h-[18px] w-[18px]" />,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: <FolderKanban className="h-[18px] w-[18px]" />,
    },
    {
      title: "Notes",
      href: "/notes",
      icon: <FileText className="h-[18px] w-[18px]" />,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto pt-24 pb-12 px-8">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        {workspace?.name || "Dashboard"}
      </h1>

      <div className="flex flex-col space-y-1">
        {databases.map((db) => (
          <Link
            href={db.href}
            key={db.title}
            className="flex items-center gap-3 px-2 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors w-fit pr-6"
          >
            <span className="text-zinc-400 dark:text-zinc-500 flex-shrink-0">
              {db.icon}
            </span>
            <span className="text-[15px] font-medium border-b border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-400 transition-colors">
              {db.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
