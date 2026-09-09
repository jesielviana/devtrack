import { GitFork, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/data";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <>
      <div>
        <p className="text-sm text-slate-500">Account and data controls</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1>
      </div>
      <section className="mt-7 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex gap-3">
          <GitFork className="text-slate-600 dark:text-zinc-300" />
          <div>
            <h2 className="font-semibold">GitHub account</h2>
            <p className="mt-1 text-sm text-slate-500">
              Connected as{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                @{user.githubLogin ?? user.name}
              </strong>
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-zinc-900">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={16} className="text-emerald-600" />
            Your GitHub source of truth is protected
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Status, target dates, and notification state are private metadata.
            This app never creates labels, comments, projects, or milestones in
            GitHub.
          </p>
        </div>
      </section>
    </>
  );
}
