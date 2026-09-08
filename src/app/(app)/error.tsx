"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/30"><h2 className="font-semibold">We could not load this workspace</h2><p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Check your connection or GitHub authorization, then try again.</p><button onClick={reset} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Try again</button></div>;
}
