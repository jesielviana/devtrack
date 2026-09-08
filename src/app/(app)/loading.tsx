export default function Loading() {
  return <div className="space-y-6 animate-pulse"><div className="h-8 w-52 rounded bg-slate-200 dark:bg-zinc-800" /><div className="grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 rounded-xl bg-slate-200 dark:bg-zinc-800" />)}</div><div className="h-80 rounded-xl bg-slate-200 dark:bg-zinc-800" /></div>;
}
