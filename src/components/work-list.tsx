"use client";

import { useMemo, useState } from "react";
import { LayoutList, Search, TableProperties } from "lucide-react";
import { ItemTable } from "@/components/item-table";
import { Kanban } from "@/components/kanban";
import { ManagedItem } from "@/lib/data";

export function WorkList({ items, kind }: { items: ManagedItem[]; kind: "issue" | "pull_request" }) {
  const [state, setState] = useState<"open" | "closed" | "all">("open");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const visible = useMemo(() => items.filter((item) => (state === "all" || item.state === state) && `${item.title} ${item.repositoryName} ${item.labels.map((label) => label.name).join(" ")}`.toLowerCase().includes(query.toLowerCase())), [items, state, query]);
  return <><div className="mt-6 flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-lg bg-slate-100 p-1 dark:bg-zinc-900">{(["open", "closed", "all"] as const).map((value) => <button key={value} onClick={() => setState(value)} className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${state === value ? "bg-white shadow-sm dark:bg-zinc-800" : "text-slate-500"}`}>{value}</button>)}</div><div className="flex gap-2"><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"><Search size={15} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, repo, label..." className="w-48 bg-transparent outline-none" /></label><div className="hidden rounded-lg border border-slate-200 p-1 dark:border-zinc-800 sm:flex"><button aria-label="List view" onClick={() => setView("list")} className={`rounded p-1.5 ${view === "list" ? "bg-slate-100 dark:bg-zinc-800" : ""}`}><TableProperties size={16} /></button><button aria-label="Kanban view" onClick={() => setView("kanban")} className={`rounded p-1.5 ${view === "kanban" ? "bg-slate-100 dark:bg-zinc-800" : ""}`}><LayoutList size={16} /></button></div></div></div><div className="mt-5">{view === "list" ? <ItemTable items={visible} kind={kind} /> : <Kanban initialItems={visible} />}</div></>;
}
