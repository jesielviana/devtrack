import Link from "next/link";
import { ExternalLink, GitPullRequest, MessageSquare, CircleDot } from "lucide-react";
import { notFound } from "next/navigation";
import { ItemTable } from "@/components/item-table";
import { getItems, requireUser } from "@/lib/data";
import { labelTextColor } from "@/lib/utils";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const { id } = await params; const item = (await getItems(user.id)).find((entry) => entry.id === id);
  if (!item) notFound();
  const Icon = item.type === "issue" ? CircleDot : GitPullRequest;
  return <><Link href={item.type === "issue" ? "/issues" : "/pull-requests"} className="text-sm font-medium text-indigo-600">← Back to {item.type === "issue" ? "issues" : "pull requests"}</Link><div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><Icon className="mt-1 text-slate-500" /><div><p className="text-sm text-slate-500">{item.repositoryName} · #{item.number}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{item.title}</h1><p className="mt-2 text-sm text-slate-500">Opened by {item.author ?? "unknown"} · Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(item.updatedAt)}</p></div></div><a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Open on GitHub <ExternalLink size={15} /></a></div><div className="mt-5 flex flex-wrap gap-2">{item.labels.map((label) => <span key={label.name} className="badge" style={{ backgroundColor: `#${label.color ?? "cbd5e1"}`, color: labelTextColor(label.color) }}>{label.name}</span>)}</div><div className="mt-8 border-t border-slate-100 pt-5 dark:border-zinc-800"><h2 className="flex items-center gap-2 font-semibold"><MessageSquare size={17} />GitHub activity</h2><p className="mt-2 text-sm text-slate-500">{item.commentCount} comments. Discussion stays on GitHub; use the link above to read and reply.</p></div></div><div className="mt-6"><h2 className="mb-3 font-semibold">Management details</h2><ItemTable items={[item]} kind={item.type} /></div></>;
}
