import { WorkList } from "@/components/work-list";
import { SyncButton } from "@/components/sync-button";
import { getItems, requireUser } from "@/lib/data";

export default async function IssuesPage() {
  const user = await requireUser();
  const items = await getItems(user.id, "issue");
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Issues</h1>
          <p className="text-sm text-slate-500">
            {items.filter((item) => item.state === "open").length} open issues
          </p>
        </div>
        <SyncButton />
      </div>
      <WorkList items={items} kind="issue" />
    </>
  );
}
