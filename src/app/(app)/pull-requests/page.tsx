import { WorkList } from "@/components/work-list";
import { SyncButton } from "@/components/sync-button";
import { getItems, requireUser } from "@/lib/data";

export default async function PullRequestsPage() {
  const user = await requireUser(); const items = await getItems(user.id, "pull_request");
  return <><div className="flex items-end justify-between gap-4"><div><p className="text-sm text-slate-500">{items.filter((item) => item.state === "open").length} open pull requests</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Pull requests</h1></div><SyncButton /></div><WorkList items={items} kind="pull_request" /></>;
}
