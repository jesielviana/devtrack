import { AlertTriangle, CalendarClock, CheckSquare, CircleDot, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { SyncButton } from "@/components/sync-button";
import { getItems, getTasks, requireUser } from "@/lib/data";
import { deadlineLabel, isOverdue } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser(); const [items, tasks] = await Promise.all([getItems(user.id), getTasks(user.id)]);
  const overdue = items.filter((item) => isOverdue(item.targetDate, item.status));
  const deadlines = [
    ...items.filter((item) => item.targetDate && item.status !== "done").map((item) => ({ id: item.id, title: item.title, date: item.targetDate!, kind: `#${item.number}` })),
    ...tasks.filter((task) => task.targetDate && !task.completedAt).map((task) => ({ id: task.id, title: task.title, date: task.targetDate!, kind: "Task" })),
  ].sort((left, right) => left.date.getTime() - right.date.getTime());
  const cards: Array<[string, number, LucideIcon]> = [["Open issues", items.filter((x) => x.type === "issue" && x.state === "open").length, CircleDot], ["Open pull requests", items.filter((x) => x.type === "pull_request" && x.state === "open").length, CheckSquare], ["To do", items.filter((x) => x.status === "todo").length, CalendarClock], ["Doing", items.filter((x) => x.status === "doing").length, MessageSquare], ["Done", items.filter((x) => x.status === "done").length, CheckSquare], ["Overdue", overdue.length, AlertTriangle]];
  const status = (["todo", "doing", "done"] as const).map((key) => ({ name: key === "todo" ? "To do" : key === "doing" ? "Doing" : "Done", value: items.filter((item) => item.status === key).length }));
  const repositories = Object.entries(items.reduce<Record<string, number>>((all, item) => ({ ...all, [item.repositoryName]: (all[item.repositoryName] ?? 0) + 1 }), {})).slice(0, 8).map(([name, value]) => ({ name, value }));
  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Welcome back, {user.githubLogin ?? user.name}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Your GitHub work</h1></div><SyncButton /></div><section className="mt-7 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-center justify-between"><h2 className="font-semibold">Upcoming deadlines</h2><CalendarClock size={18} className="text-slate-400" /></div>{deadlines.length ? <div className="mt-4 divide-y divide-slate-100 dark:divide-zinc-800">{deadlines.slice(0, 8).map((deadline) => { const label = deadlineLabel(deadline.date); return <div key={deadline.id} className="flex justify-between gap-4 py-3 text-sm"><span className="truncate"><span className="mr-2 text-slate-400">{deadline.kind}</span>{deadline.title}</span><span className={`shrink-0 ${label.startsWith("Vencida") ? "font-medium text-rose-600" : label === "Hoje" || label === "Amanhã" ? "font-medium text-amber-600" : "text-slate-500"}`}>{label}</span></div>; })}</div> : <p className="mt-4 text-sm text-slate-500">No upcoming deadlines.</p>}</section><div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{cards.map(([label, value, CardIcon]) => <section key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-center justify-between gap-2 text-slate-500"><span className="text-sm">{label}</span><CardIcon size={17} className="shrink-0" /></div><p className="mt-3 text-3xl font-semibold">{value}</p></section>)}</div><div className="mt-7"><DashboardCharts status={status} repositories={repositories} /></div></>;
}
