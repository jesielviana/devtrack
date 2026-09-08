import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  githubLogin: text("github_login").unique(),
  githubUserId: text("github_user_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("account", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]);

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_token", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (table) => [primaryKey({ columns: [table.identifier, table.token] })]);

export const githubItems = pgTable("github_item", {
  id: text("id").primaryKey(),
  githubId: text("github_id").notNull().unique(),
  repositoryId: text("repository_id").notNull(),
  repositoryName: text("repository_name").notNull(),
  repositoryOwner: text("repository_owner").notNull(),
  number: integer("number").notNull(),
  type: text("type", { enum: ["issue", "pull_request"] }).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  state: text("state", { enum: ["open", "closed"] }).notNull(),
  author: text("author"),
  isDraft: boolean("is_draft").default(false).notNull(),
  labels: text("labels").notNull().default("[]"),
  commentCount: integer("comment_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("github_item_repo_number_unique").on(table.repositoryId, table.number),
  index("github_item_repository_idx").on(table.repositoryName),
]);

export const itemMetadata = pgTable("item_metadata", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  githubItemId: text("github_item_id").notNull().references(() => githubItems.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["todo", "doing", "done"] }).default("todo").notNull(),
  targetDate: timestamp("target_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("item_metadata_user_item_unique").on(table.userId, table.githubItemId),
  index("item_metadata_user_status_idx").on(table.userId, table.status),
]);

export const repositoryPreferences = pgTable("repository_preference", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  repositoryId: text("repository_id").notNull(),
  repositoryName: text("repository_name").notNull(),
  ignored: boolean("ignored").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("repository_preference_user_repository_unique").on(table.userId, table.repositoryId),
  index("repository_preference_user_ignored_idx").on(table.userId, table.ignored),
]);

export const tasks = pgTable("task", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  repositoryId: text("repository_id"),
  repositoryName: text("repository_name"),
  title: text("title").notNull(),
  tags: text("tags").notNull().default("[]"),
  targetDate: timestamp("target_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("task_user_target_idx").on(table.userId, table.targetDate),
]);

export const commentTracking = pgTable("comment_tracking", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  githubItemId: text("github_item_id").notNull().references(() => githubItems.id, { onDelete: "cascade" }),
  lastKnownCommentId: text("last_known_comment_id"),
  lastKnownCommentAt: timestamp("last_known_comment_at", { withTimezone: true }),
  lastKnownCommentCount: integer("last_known_comment_count").default(0).notNull(),
  lastViewedCommentId: text("last_viewed_comment_id"),
  lastViewedCommentAt: timestamp("last_viewed_comment_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("comment_tracking_user_item_unique").on(table.userId, table.githubItemId)]);

export const notifications = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  githubItemId: text("github_item_id").references(() => githubItems.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["new_comment", "target_soon", "target_overdue"] }).notNull(),
  message: text("message").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("notification_user_read_idx").on(table.userId, table.readAt),
  uniqueIndex("notification_user_item_type_unique").on(table.userId, table.githubItemId, table.type),
]);

export const githubItemsRelations = relations(githubItems, ({ many }) => ({
  metadata: many(itemMetadata),
  notifications: many(notifications),
}));
