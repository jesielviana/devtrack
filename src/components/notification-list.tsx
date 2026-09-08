"use client";

import Link from "next/link";
import { CheckCheck, ExternalLink, MessageSquare, Timer, TriangleAlert } from "lucide-react";
import { useTransition } from "react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions";

type Entry = {
  notification: { id: string; type: "new_comment" | "target_soon" | "target_overdue"; message: string; readAt: Date | null; createdAt: Date };
  item: { id: string; number: number; title: string; repositoryName: string; url: string } | null;
};

const icons = { new_comment: MessageSquare, target_soon: Timer, target_overdue: TriangleAlert };
export function NotificationList({ entries }: { entries: Entry[] }) {
  const [pending, startTransition] = useTransition();
  return <><div className="mt-6 flex justify-end"><button disabled={pending} onClick={() => startTransition(() => markAllNotificationsRead())} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"><CheckCheck size={16} />Mark all read</button></div><div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">{entries.map(({ notification, item }) => { const Icon = icons[notification.type]; return <article key={notification.id} className={`flex gap-4 border-b border-slate-100 p-5 last:border-0 dark:border-zinc-900 ${notification.readAt ? "opacity-60" : ""}`}><div className={`mt-1 grid size-8 shrink-0 place-items-center rounded-full ${notification.type === "target_overdue" ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"}`}><Icon size={16} /></div><div className="min-w-0 flex-1"><p className="font-medium">{notification.message}</p>{item && <p className="mt-1 truncate text-sm text-slate-500">#{item.number} · {item.title} · {item.repositoryName}</p>}<p className="mt-2 text-xs text-slate-400">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(notification.createdAt)}</p></div><div className="flex items-start gap-1">{item && <><Link href={`/items/${item.id}`} aria-label="Open related item" className="rounded p-2 hover:bg-slate-100 dark:hover:bg-zinc-900">Open</Link><a href={item.url} target="_blank" rel="noreferrer" aria-label="Open on GitHub" className="rounded p-2 hover:bg-slate-100 dark:hover:bg-zinc-900"><ExternalLink size={15} /></a></>}{!notification.readAt && <button onClick={() => startTransition(() => markNotificationRead(notification.id))} aria-label="Mark notification as read" className="rounded p-2 text-xs hover:bg-slate-100 dark:hover:bg-zinc-900">Read</button>}</div></article>; })}</div>{!entries.length && <div className="mt-4 rounded-xl border border-dashed border-slate-300 py-20 text-center text-slate-500 dark:border-zinc-700">You are all caught up. New comments and deadline alerts will appear here.</div>}</>;
}
