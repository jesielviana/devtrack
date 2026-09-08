"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CheckSquare,
  ChevronRight,
  CircleDot,
  FolderGit2,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
  Tags,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation: Array<[string, string, LucideIcon]> = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/issues", "Issues", CircleDot],
  ["/pull-requests", "Pull requests", CheckSquare],
  ["/tasks", "Tasks", ListTodo],
  ["/repositories", "Repositories", FolderGit2],
  ["/labels", "Labels", Tags],
];

export function AppShell({
  children,
  user,
  unreadCount,
}: {
  children: React.ReactNode;
  user: { name?: string | null; image?: string | null; githubLogin?: string };
  unreadCount: number;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#09090b] dark:text-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:flex md:flex-col">
        <Link
          href="/dashboard"
          className="mb-9 px-2"
          aria-label="DevTrack dashboard"
        >
          <div className="flex items-center gap-2">
          <Image
            src="/favicon.png"
            alt="DevTrack"
            width={32}
            height={32}
            className="h-auto w-8"
            priority
          />
            <b>DevTrack</b>
          </div>
        </Link>
        <nav className="space-y-1">
          {navigation.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${pathname.startsWith(href) ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900"}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-slate-100 pt-4 dark:border-zinc-800">
          <Link
            href="/notifications"
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${pathname === "/notifications" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "text-slate-600 dark:text-zinc-400"}`}
          >
            <span className="flex items-center gap-3">
              <Bell size={17} />
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-zinc-400"
          >
            <Settings size={17} />
            Settings
          </Link>
        </div>
      </aside>
      <main className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85 md:px-8">
          <Link href="/dashboard" className="font-semibold md:hidden">
            DevTrack
          </Link>
          <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
            <span>Workspace</span>
            <ChevronRight size={15} />
            <span className="text-slate-900 dark:text-slate-100">Personal</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              aria-label="Notifications"
              href="/notifications"
              className="relative rounded-md p-2 hover:bg-slate-100 dark:hover:bg-zinc-900"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <div className="grid size-8 place-items-center overflow-hidden rounded-full bg-slate-200 font-medium dark:bg-zinc-800">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="size-full"
                    unoptimized
                  />
                ) : (
                  user.name?.[0]
                )}
              </div>
              <span className="hidden sm:block">
                {user.githubLogin ?? user.name}
              </span>
            </div>
            <button
              aria-label="Sign out"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 pb-24 md:p-8">{children}</div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
        {navigation.slice(0, 5).map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] ${pathname.startsWith(href) ? "text-indigo-600" : "text-slate-500"}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
