"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { commentTracking, githubItems, itemMetadata, notifications, repositoryPreferences, tasks } from "@/lib/schema";
import { syncGitHub } from "@/lib/github";
import { z } from "zod";
import { InternalStatus } from "@/lib/utils";

async function currentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized.");
  return session.user.id;
}

export async function syncAction() {
  const result = await syncGitHub();
  revalidatePath("/", "layout");
  return result;
}

export async function updateItemStatus(itemId: string, status: InternalStatus) {
  if (!["todo", "doing", "done"].includes(status)) throw new Error("Invalid status.");
  const userId = await currentUserId();
  const updated = await db.update(itemMetadata).set({ status, updatedAt: new Date() })
    .where(and(eq(itemMetadata.userId, userId), eq(itemMetadata.githubItemId, itemId))).returning({ id: itemMetadata.id });
  if (!updated.length) throw new Error("Item not found.");
  revalidatePath("/", "layout");
}

export async function updateTargetDate(itemId: string, value: string | null) {
  const userId = await currentUserId();
  const targetDate = value ? new Date(`${value}T00:00:00.000Z`) : null;
  if (targetDate && Number.isNaN(targetDate.getTime())) throw new Error("Invalid target date.");
  const updated = await db.update(itemMetadata).set({ targetDate, updatedAt: new Date() })
    .where(and(eq(itemMetadata.userId, userId), eq(itemMetadata.githubItemId, itemId))).returning({ id: itemMetadata.id });
  if (!updated.length) throw new Error("Item not found.");
  revalidatePath("/", "layout");
}

export async function markNotificationRead(notificationId: string) {
  const userId = await currentUserId();
  await db.update(notifications).set({ readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  const userId = await currentUserId();
  await db.update(notifications).set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  revalidatePath("/", "layout");
}

export async function markCommentsViewed(itemId: string) {
  const userId = await currentUserId();
  await db.update(commentTracking).set({ lastViewedCommentAt: new Date() })
    .where(and(eq(commentTracking.userId, userId), eq(commentTracking.githubItemId, itemId)));
}

export async function setRepositoryIgnored(repositoryId: string, repositoryName: string, ignored: boolean) {
  const userId = await currentUserId();
  if (!repositoryId || !/^[\w.-]+\/[\w.-]+$/.test(repositoryName)) throw new Error("Invalid repository.");
  await db.insert(repositoryPreferences).values({
    id: crypto.randomUUID(), userId, repositoryId, repositoryName, ignored, updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [repositoryPreferences.userId, repositoryPreferences.repositoryId],
    set: { ignored, repositoryName, updatedAt: new Date() },
  });
  if (ignored) {
    const relatedItems = await db.select({ id: githubItems.id }).from(githubItems)
      .where(eq(githubItems.repositoryId, repositoryId));
    const ids = relatedItems.map((item) => item.id);
    if (ids.length) {
      await db.delete(notifications).where(and(eq(notifications.userId, userId), inArray(notifications.githubItemId, ids)));
      await db.delete(commentTracking).where(and(eq(commentTracking.userId, userId), inArray(commentTracking.githubItemId, ids)));
      await db.delete(itemMetadata).where(and(eq(itemMetadata.userId, userId), inArray(itemMetadata.githubItemId, ids)));
    }
  }
  revalidatePath("/", "layout");
}

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  repositoryId: z.string().trim().max(200).nullable(),
  repositoryName: z.string().trim().regex(/^[\w.-]+\/[\w.-]+$/).nullable(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  tags: z.array(z.string().trim().min(1).max(32)).max(12),
});

const updateTaskSchema = createTaskSchema.extend({
  id: z.string().uuid(),
});

export async function createTask(input: unknown) {
  const userId = await currentUserId();
  const task = createTaskSchema.parse(input);
  if ((task.repositoryId === null) !== (task.repositoryName === null)) throw new Error("Invalid repository.");
  await db.insert(tasks).values({
    id: crypto.randomUUID(), userId, title: task.title, repositoryId: task.repositoryId, repositoryName: task.repositoryName,
    targetDate: task.targetDate ? new Date(`${task.targetDate}T12:00:00.000Z`) : null,
    tags: JSON.stringify(task.tags), createdAt: new Date(), updatedAt: new Date(),
  });
  revalidatePath("/", "layout");
}

export async function setTaskCompleted(taskId: string, completed: boolean) {
  const userId = await currentUserId();
  const updated = await db.update(tasks).set({ completedAt: completed ? new Date() : null, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId))).returning({ id: tasks.id });
  if (!updated.length) throw new Error("Task not found.");
  revalidatePath("/", "layout");
}

export async function updateTask(input: unknown) {
  const userId = await currentUserId();
  const task = updateTaskSchema.parse(input);
  if ((task.repositoryId === null) !== (task.repositoryName === null)) throw new Error("Invalid repository.");
  const updated = await db.update(tasks).set({
    title: task.title,
    repositoryId: task.repositoryId,
    repositoryName: task.repositoryName,
    targetDate: task.targetDate ? new Date(`${task.targetDate}T12:00:00.000Z`) : null,
    tags: JSON.stringify(task.tags),
    updatedAt: new Date(),
  }).where(and(eq(tasks.id, task.id), eq(tasks.userId, userId))).returning({ id: tasks.id });
  if (!updated.length) throw new Error("Task not found.");
  revalidatePath("/", "layout");
}
