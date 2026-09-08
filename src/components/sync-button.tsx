"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { syncAction } from "@/app/actions";

export function SyncButton() {
  const [pending, startTransition] = useTransition();
  return <button onClick={() => startTransition(async () => { await syncAction(); })} disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"><RefreshCw size={16} className={pending ? "animate-spin" : ""} />{pending ? "Syncing..." : "Sync with GitHub"}</button>;
}
