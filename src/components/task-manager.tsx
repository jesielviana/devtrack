"use client";

import { FormEvent, useState, useTransition } from "react";
import { Check, Circle, Pencil, Plus, Tag, X } from "lucide-react";
import { createTask, setTaskCompleted, updateTask } from "@/app/actions";
import type { PersonalTask } from "@/lib/data";
import { deadlineLabel } from "@/lib/utils";

type Repository = { id: string; name: string };

export function TaskManager({ tasks, repositories }: { tasks: PersonalTask[]; repositories: Repository[] }) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [repositoryId, setRepositoryId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editRepositoryId, setEditRepositoryId] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
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

  function beginEditing(task: PersonalTask) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditTags(task.tags.join(", "));
    setEditRepositoryId(task.repositoryId ?? "");
    setEditTargetDate(task.targetDate?.toISOString().slice(0, 10) ?? "");
  }

  function saveTask(event: FormEvent<HTMLFormElement>, taskId: string) {
    event.preventDefault();
    const repository = repositories.find((entry) => entry.id === editRepositoryId);
    startTransition(async () => {
      await updateTask({
        id: taskId,
        title: editTitle,
        tags: editTags.split(",").map((tag) => tag.trim()).filter(Boolean),
        repositoryId: repository?.id ?? null,
        repositoryName: repository?.name ?? null,
        targetDate: editTargetDate || null,
      });
      setEditingId(null);
    });
  }

  return <><form onSubmit={submit} className="mt-7 rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><div className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-3 md:grid-cols-[1fr_180px_180px_auto]"><input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to be done?" className="col-span-2 min-w-0 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 md:col-span-1 dark:border-zinc-700" /><select value={repositoryId} onChange={(event) => setRepositoryId(event.target.value)} className="min-w-0 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"><option value="">No repository</option>{repositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.name}</option>)}</select><input value={targetDate} onChange={(event) => setTargetDate(event.target.value)} type="date" aria-label="Completion date" className="min-w-0 rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-sm dark:border-zinc-700 md:px-3" /><button disabled={pending} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 md:col-span-1"><Plus size={16} />Add task</button></div><label className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Tag size={15} /><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags separated by commas" className="min-w-0 flex-1 bg-transparent outline-none" /></label></form><div className="mt-5 space-y-2">{tasks.map((task) => <article key={task.id} className={`rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 ${task.completedAt ? "opacity-60" : ""}`}>{editingId === task.id ? <form onSubmit={(event) => saveTask(event, task.id)} className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-3 md:grid-cols-[1fr_180px_180px_auto]"><input required maxLength={160} value={editTitle} onChange={(event) => setEditTitle(event.target.value)} aria-label="Task text" className="col-span-2 min-w-0 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 md:col-span-1 dark:border-zinc-700" /><select value={editRepositoryId} onChange={(event) => setEditRepositoryId(event.target.value)} aria-label="Repository or project" className="min-w-0 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"><option value="">No repository</option>{repositories.map((repository) => <option key={repository.id} value={repository.id}>{repository.name}</option>)}</select><input value={editTargetDate} onChange={(event) => setEditTargetDate(event.target.value)} type="date" aria-label="Completion date" className="min-w-0 rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-sm dark:border-zinc-700 md:px-3" /><div className="col-span-2 flex gap-2 md:col-span-1"><button disabled={pending} aria-label="Save task" title="Save task" className="grid size-10 place-items-center rounded-lg bg-indigo-600 text-white disabled:opacity-50"><Check size={16} /></button><button type="button" disabled={pending} onClick={() => setEditingId(null)} aria-label="Cancel editing" title="Cancel editing" className="grid size-10 place-items-center rounded-lg border border-slate-200 dark:border-zinc-700"><X size={16} /></button></div><label className="col-span-2 flex min-w-0 items-center gap-2 text-sm text-slate-500 md:col-span-3"><Tag size={15} /><input value={editTags} onChange={(event) => setEditTags(event.target.value)} placeholder="Tags separated by commas" className="min-w-0 flex-1 bg-transparent outline-none" /></label></form> : <div className="flex items-center gap-4"><button disabled={pending} onClick={() => startTransition(() => setTaskCompleted(task.id, !task.completedAt))} aria-label={task.completedAt ? "Mark task as incomplete" : "Mark task as complete"} className={`grid size-6 shrink-0 place-items-center rounded-full border ${task.completedAt ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-zinc-600"}`}>{task.completedAt ? <Check size={14} /> : <Circle size={0} />}</button><div className="min-w-0 flex-1"><p className={`font-medium ${task.completedAt ? "line-through" : ""}`}>{task.title}</p><div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">{task.repositoryName && <span>{task.repositoryName}</span>}{task.tags.map((tag) => <span key={tag} className="badge bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">{tag}</span>)}</div></div>{task.targetDate && !task.completedAt && <span className={deadlineLabel(task.targetDate).startsWith("Vencida") ? "text-sm font-medium text-rose-600" : "text-sm text-slate-500"}>{deadlineLabel(task.targetDate)}</span>}<button type="button" disabled={pending} onClick={() => beginEditing(task)} aria-label={`Edit ${task.title}`} title="Edit task" className="grid size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-900 dark:hover:text-slate-100"><Pencil size={16} /></button></div>}</article>)}</div>{!tasks.length && <div className="mt-5 rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-zinc-700">Create a personal task to start planning work beyond GitHub items.</div>}</>;
}
