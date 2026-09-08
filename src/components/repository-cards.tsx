"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { EyeOff, Eye, FolderGit2 } from "lucide-react";
import { setRepositoryIgnored } from "@/app/actions";

export type RepositorySummary = {
  id: string; name: string; issues: number; pullRequests: number; doing: number; overdue: number;
};
type IgnoredRepository = { repositoryId: string; repositoryName: string };

export function RepositoryCards({ repositories, ignored }: { repositories: RepositorySummary[]; ignored: IgnoredRepository[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function update(repositoryId: string, repositoryName: string, value: boolean) {
    startTransition(async () => {
      await setRepositoryIgnored(repositoryId, repositoryName, value);
      router.refresh();
    });
  }
  return <><div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{repositories.map((repository) => <section key={repository.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><div className="flex justify-between"><div className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"><FolderGit2 size={19} /></div><button disabled={pending} onClick={() => update(repository.id, repository.name, true)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-zinc-900"><EyeOff size={15} />Ignore</button></div><h2 className="mt-4 font-semibold">{repository.name}</h2><div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs"><Metric label="Issues" value={repository.issues} /><Metric label="PRs" value={repository.pullRequests} /><Metric label="Doing" value={repository.doing} /><Metric label="Overdue" value={repository.overdue} /></div></section>)}</div>{!repositories.length && <p className="mt-8 text-sm text-slate-500">No active repositories have been synchronized yet.</p>}{ignored.length > 0 && <section className="mt-8 rounded-xl border border-dashed border-slate-300 p-5 dark:border-zinc-700"><h2 className="font-semibold">Ignored repositories</h2><p className="mt-1 text-sm text-slate-500">These repositories are hidden and excluded from future GitHub synchronization.</p><div className="mt-4 space-y-2">{ignored.map((repository) => <div key={repository.repositoryId} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-zinc-900"><span>{repository.repositoryName}</span><button disabled={pending} onClick={() => update(repository.repositoryId, repository.repositoryName, false)} className="inline-flex items-center gap-1 font-medium text-indigo-600 disabled:opacity-50"><Eye size={15} />Restore</button></div>)}</div></section>}</>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div><p className="font-semibold text-slate-900 dark:text-slate-100">{value}</p><p className="mt-1 text-slate-500">{label}</p></div>; }
