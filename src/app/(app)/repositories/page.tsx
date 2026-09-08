import { RepositoryCards, type RepositorySummary } from "@/components/repository-cards";
import { getIgnoredRepositories, getItems, requireUser } from "@/lib/data";
import { isOverdue } from "@/lib/utils";

export default async function RepositoriesPage() {
  const user = await requireUser();
  const [items, ignored] = await Promise.all([getItems(user.id), getIgnoredRepositories(user.id)]);
  const repositories = Object.entries(Object.groupBy(items, (item) => item.repositoryName)).map(([name, repositoryItems]) => {
    const entries = repositoryItems ?? [];
    return {
      id: entries[0]?.repositoryId ?? name,
      name,
      issues: entries.filter((item) => item.type === "issue").length,
      pullRequests: entries.filter((item) => item.type === "pull_request").length,
      doing: entries.filter((item) => item.status === "doing").length,
      overdue: entries.filter((item) => isOverdue(item.targetDate, item.status)).length,
    } satisfies RepositorySummary;
  });
  return <><div><p className="text-sm text-slate-500">Hide repositories that are not relevant to your personal workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Repositories</h1></div><RepositoryCards repositories={repositories} ignored={ignored} /> </>;
}
