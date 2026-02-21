"use client";
/* This file renders shared authenticated navigation for personal and teams. */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/authService";
import type { Team } from "@/types/models";

type AppShellProps = {
  children: React.ReactNode;
  teams: Team[];
};

export function AppShell({ children, teams }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`rounded px-3 py-2 text-sm ${
                pathname === "/dashboard" ? "bg-slate-900 text-white" : "bg-slate-100"
              }`}
            >
              Personal
            </Link>
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className={`rounded px-3 py-2 text-sm ${
                  pathname === `/teams/${team.id}` ? "bg-blue-700 text-white" : "bg-slate-100"
                }`}
              >
                {team.name}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">{children}</main>
    </div>
  );
}
