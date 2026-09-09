import Link from "next/link";
import { Tags } from "lucide-react";
import { getItems, requireUser } from "@/lib/data";

export default async function LabelsPage() {
  const user = await requireUser();
  const items = await getItems(user.id);
  const labels = new Map<string, { count: number; color?: string }>();
  items.forEach((item) =>
    item.labels.forEach((label) =>
      labels.set(label.name, {
        count: (labels.get(label.name)?.count ?? 0) + 1,
        color: label.color,
      }),
    ),
  );
  return (
    <>
      <div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Labels</h1>
        <p className="text-sm text-slate-500">
          Labels from GitHub are kept in sync with their original colors
        </p>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...labels.entries()]
          .sort((a, b) => b[1].count - a[1].count)
          .map(([name, value]) => (
            <Link
              key={name}
              href={`/issues?label=${encodeURIComponent(name)}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="flex items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: `#${value.color ?? "64748b"}` }}
                />
                <span className="font-medium">{name}</span>
              </span>
              <span className="text-sm text-slate-500">{value.count}</span>
            </Link>
          ))}
      </div>
      {!labels.size && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500 dark:border-zinc-700">
          <Tags className="mx-auto mb-3" />
          No labels found yet.
        </div>
      )}
    </>
  );
}
