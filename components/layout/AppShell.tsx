"use client";
/* This file renders shared authenticated navigation for personal and teams. */
import { useRouter } from "next/navigation";
import { logout } from "@/services/authService";
import { FloatingDock } from "@/components/ui/FloatingDock";
import { User, Users, NotebookPen, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const navItems = [
    { title: "Personal", href: "/dashboard", icon: <User className="h-5 w-5" /> },
    { title: "Teams", href: "/teams", icon: <Users className="h-5 w-5" /> },
    { title: "Notes", href: "/notes", icon: <NotebookPen className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Minimal top header for logout */}
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-end gap-2 p-4 pointer-events-none">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-zinc-200 bg-white/50 px-4 py-2 text-sm text-zinc-600 backdrop-blur-md transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 pt-20">
        {children}
      </main>

      <FloatingDock items={navItems} />
    </div>
  );
}