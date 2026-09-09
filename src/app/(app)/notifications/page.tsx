import { Bell } from "lucide-react";
import { NotificationList } from "@/components/notification-list";
import { getNotifications, requireUser } from "@/lib/data";

export default async function NotificationsPage() {
  const user = await requireUser();
  const entries = await getNotifications(user.id);
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-slate-500">
            Activity from your managed GitHub work
          </p>
        </div>
      </div>
      <NotificationList entries={entries} />
    </>
  );
}
