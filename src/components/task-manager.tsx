"use client";

import { FormEvent, useState, useTransition } from "react";
import { Check, Circle, Plus, Tag } from "lucide-react";
import { createTask, setTaskCompleted } from "@/app/actions";
import type { PersonalTask } from "@/lib/data";
import { deadlineLabel } from "@/lib/utils";

type Repository = { id: string; name: string };

export function TaskManager({ tasks, repositories }: { tasks: PersonalTask[]; repositories: Repository[] }) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [repositoryId, setRepositoryId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const repository = repositories.find((entry) => entry.id === repositoryId);
    startTransition(async () => {
      await createTask({
        title,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        repositoryId: repository?.id ?? null,
        repositoryName: repository?.name ?? null,
        targetDate: targetDate || null,
      });
      setTitle(""); setTags(""); setRepositoryId(""); setTargetDate("");
    });
  }

  return <><form onSubmit={submit} className="mt-7 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]"><input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to be done?" className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700" /><select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)} className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"><option value="">No repository</option>{repositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.name}</option>)}</select><input value={targetDate} onChange={(event) => setTargetDate(event.target.value)} type="date" aria-label="Completion date" className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" /><button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><Plus size={16} />Add task</button></div><label className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Tag size={15} /><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags separated by commas" className="w-full bg-transparent outline-none" /></label></form><div className="mt-5 space-y-2">{tasks.map((task) => <article key={task.id} className={`flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 ${task.completedAt ? "opacity-60" : ""}`}><button disabled={pending} onClick={() => startTransition(() => setTaskCompleted(task.id, !task.completedAt))} aria-label={task.completedAt ? "Mark task as incomplete" : "Mark task as complete"} className={`grid size-6 shrink-0 place-items-center rounded-full border ${task.completedAt ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-zinc-600"}`}>{task.completedAt ? <Check size={14} /> : <Circle size={0} />}</button><div className="min-w-0 flex-1"><p className={`font-medium ${task.completedAt ? "line-through" : ""}`}>{task.title}</p><div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">{task.repositoryName && <span>{task.repositoryName}</span>}{task.tags.map((tag) => <span key={tag} className="badge bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">{tag}</span>)}</div></div>{task.targetDate && !task.completedAt && <span className={deadlineLabel(task.targetDate).startsWith("Vencida") ? "text-sm font-medium text-rose-600" : "text-sm text-slate-500"}>{deadlineLabel(task.targetDate)}</span>}</article>)}</div>{!tasks.length && <div className="mt-5 rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-zinc-700">Create a personal task to start planning work beyond GitHub items.</div>}</>;
}
