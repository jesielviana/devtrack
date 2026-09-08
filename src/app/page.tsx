import { signIn } from "@/auth";
import {
  ArrowRight,
  CheckCircle2,
  GitFork,
  KanbanSquare,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const githubOAuthConfigured = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
  );
  const signInAction = async () => {
    "use server";
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      throw new Error("GitHub OAuth is not configured.");
    }
    await signIn("github", { redirectTo: "/dashboard" });
  };
  return (
    <main className="min-h-screen bg-[#fbfbfd] text-slate-950 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
        <Image
          src="/favicon.png"
          alt="DevTrack"
          width={32}
          height={32}
          className="h-auto w-8"
          priority
        />
          <b>DevTrack</b>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signInAction}>
            <button
              disabled={!githubOAuthConfigured}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:py-32">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <GitFork size={15} />
            Track your development work.
          </div>
          <h1 className="max-w-xl text-5xl font-bold tracking-[-0.045em] sm:text-6xl">
            Bring every issue and pull request into focus.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600 dark:text-zinc-400">
            A private workspace to plan GitHub work, track target dates, and
            never miss a comment—without changing anything in GitHub.
          </p>
          <form action={signInAction} className="mt-8">
            <button
              disabled={!githubOAuthConfigured}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue with GitHub <ArrowRight size={17} />
            </button>
          </form>
          {!githubOAuthConfigured && (
            <p
              role="alert"
              className="mt-3 text-sm text-amber-700 dark:text-amber-300"
            >
              Configure <code>GITHUB_CLIENT_ID</code> and{" "}
              <code>GITHUB_CLIENT_SECRET</code> in <code>.env.local</code> to
              enable GitHub sign-in.
            </p>
          )}
          <div className="mt-9 flex flex-wrap gap-5 text-sm text-slate-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Private metadata
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-500" />
              OAuth secured
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Your GitHub work</p>
              <p className="text-xl font-semibold">Good morning</p>
            </div>
            <KanbanSquare className="text-indigo-600" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Open issues", "24"],
              ["Open PRs", "13"],
              ["Due soon", "4"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-800"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {[
              "#123 Improve multilingual search",
              "#456 Review authentication flow",
              "#789 Fix pagination",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm dark:border-zinc-800"
              >
                <span>{item}</span>
                <span
                  className={`size-2 rounded-full ${index === 0 ? "bg-amber-400" : "bg-indigo-500"}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
