"use client";

import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { useState, useTransition } from "react";
import { updateItemStatus } from "@/app/actions";
import { ManagedItem } from "@/lib/data";
import { statusLabels, type InternalStatus } from "@/lib/utils";

function Card({ item }: { item: ManagedItem }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: item.id });
  return <div ref={setNodeRef} {...listeners} {...attributes} style={{ transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined }} className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-950"><p className="text-xs text-slate-500">#{item.number} · {item.type === "issue" ? "Issue" : "PR"}</p><p className="mt-1 text-sm font-medium leading-5">{item.title}</p><p className="mt-2 truncate text-xs text-slate-500">{item.repositoryName}</p></div>;
}
function Column({ status, items }: { status: InternalStatus; items: ManagedItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return <section ref={setNodeRef} className={`min-h-96 min-w-72 flex-1 rounded-xl border p-3 ${isOver ? "border-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10" : "border-slate-200 bg-slate-100/60 dark:border-zinc-800 dark:bg-zinc-900/40"}`}><div className="mb-3 flex items-center justify-between px-1"><h2 className="text-sm font-semibold">{statusLabels[status]}</h2><span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 dark:bg-zinc-800">{items.length}</span></div><div className="space-y-2">{items.map((item) => <Card key={item.id} item={item} />)}</div></section>;
}
export function Kanban({ initialItems }: { initialItems: ManagedItem[] }) {
  const [items, setItems] = useState(initialItems); const [, startTransition] = useTransition();
  function onDragEnd({ active, over }: DragEndEvent) { if (!over || !["todo", "doing", "done"].includes(String(over.id))) return; const status = String(over.id) as InternalStatus; if (items.find((item) => item.id === active.id)?.status === status) return; setItems((current) => current.map((item) => item.id === active.id ? { ...item, status } : item)); startTransition(() => updateItemStatus(String(active.id), status)); }
  return <DndContext onDragEnd={onDragEnd}><div className="flex gap-4 overflow-x-auto pb-3">{(["todo", "doing", "done"] as InternalStatus[]).map((status) => <Column key={status} status={status} items={items.filter((item) => item.status === status)} />)}</div></DndContext>;
}
