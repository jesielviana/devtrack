import { and, desc, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { githubItems, itemMetadata, notifications, repositoryPreferences, tasks } from "@/lib/schema";
import { InternalStatus } from "@/lib/utils";

export type ManagedItem = {
  id: string; number: number; title: string; url: string; type: "issue" | "pull_request";
  state: "open" | "closed"; repositoryId: string; repositoryName: string; repositoryOwner: string; author: string | null;
  isDraft: boolean; labels: { name: string; color?: string }[]; commentCount: number;
  createdAt: Date; updatedAt: Date; status: InternalStatus; targetDate: Date | null;
};

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized.");
  return session.user;
}

export async function getItems(userId: string, type?: ManagedItem["type"]) {
  const filters = [eq(itemMetadata.userId, userId)];
  if (type) filters.push(eq(githubItems.type, type));
  const rows = await db.select({ item: githubItems, metadata: itemMetadata }).from(itemMetadata)
    .innerJoin(githubItems, eq(itemMetadata.githubItemId, githubItems.id))
    .where(and(...filters)).orderBy(desc(githubItems.updatedAt));
  return rows.map(({ item, metadata }) => ({
    ...item, status: metadata.status,
    targetDate: metadata.targetDate,
    labels: JSON.parse(item.labels) as { name: string; color?: string }[],
  })) as ManagedItem[];
}

export async function getNotifications(userId: string) {
  return db.select({ notification: notifications, item: githubItems }).from(notifications)
    .leftJoin(githubItems, eq(notifications.githubItemId, githubItems.id))
    .where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function unreadNotificationCount(userId: string) {
  const rows = await db.select({ id: notifications.id }).from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return rows.length;
}

export async function getIgnoredRepositories(userId: string) {
  return db.select().from(repositoryPreferences)
    .where(and(eq(repositoryPreferences.userId, userId), eq(repositoryPreferences.ignored, true)));
}

export type PersonalTask = {
  id: string; title: string; repositoryId: string | null; repositoryName: string | null;
  tags: string[]; targetDate: Date | null; completedAt: Date | null; createdAt: Date;
};

export async function getTasks(userId: string) {
  const rows = await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.targetDate));
  return rows.map((task) => ({ ...task, tags: JSON.parse(task.tags) as string[] })) as PersonalTask[];
}
