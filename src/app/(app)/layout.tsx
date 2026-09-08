import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireUser, unreadNotificationCount } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  let user;
  try { user = await requireUser(); } catch { redirect("/"); }
  const unreadCount = await unreadNotificationCount(user.id);
  return <AppShell user={user} unreadCount={unreadCount}>{children}</AppShell>;
}
