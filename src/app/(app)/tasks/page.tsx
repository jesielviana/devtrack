import { TaskManager } from "@/components/task-manager";
import { getItems, getTasks, requireUser } from "@/lib/data";

export default async function TasksPage() {
  const user = await requireUser();
  const [tasks, items] = await Promise.all([
    getTasks(user.id),
    getItems(user.id),
  ]);
  const repositories = [
    ...new Map(
      items.map((item) => [item.repositoryId, item.repositoryName]),
    ).entries(),
  ]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <div className="flex items-center gap-3">
        <div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-500">
            Private work not tied to an Issue or Pull Request
          </p>
        </div>
      </div>
      <TaskManager tasks={tasks} repositories={repositories} />
    </>
  );
}
