import { and, eq, inArray, notInArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { accounts, commentTracking, githubItems, itemMetadata, notifications, repositoryPreferences } from "@/lib/schema";

type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  comments: number;
  pull_request?: { url: string; draft?: boolean };
  repository?: { id: number; name: string; full_name: string; owner: { login: string } };
  repository_url?: string;
  user: { login: string } | null;
  labels: Array<{ name: string; color?: string }>;
};

type GitHubSearchResult = { items: GitHubIssue[] };

type GitHubAccount = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
};

type RefreshTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

function repositoryDetails(issue: GitHubIssue) {
  if (issue.repository) {
    return {
      id: String(issue.repository.id),
      name: issue.repository.full_name,
      owner: issue.repository.owner.login,
    };
  }
  if (!issue.repository_url) throw new Error(`GitHub did not provide a repository for #${issue.number}.`);
  const segments = new URL(issue.repository_url).pathname.split("/").filter(Boolean);
  if (segments.length !== 3 || segments[0] !== "repos") {
    throw new Error(`GitHub returned an invalid repository URL for #${issue.number}.`);
  }
  return {
    id: issue.repository_url,
    name: `${segments[1]}/${segments[2]}`,
    owner: segments[1],
  };
}

async function requestGitHub(path: string, token: string): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 0 },
  });
}

async function parseGitHubResponse<T>(response: Response): Promise<T> {
  if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
    throw new Error("GitHub rate limit reached. Please try again later.");
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub sync failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  return response.json() as Promise<T>;
}

async function getGitHubAccount(userId: string): Promise<GitHubAccount> {
  const [account] = await db.select({
    accessToken: accounts.access_token,
    refreshToken: accounts.refresh_token,
    expiresAt: accounts.expires_at,
  }).from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "github"))).limit(1);
  if (!account?.accessToken) throw new Error("No GitHub authorization was found for this account.");
  return account;
}

async function refreshGitHubAccessToken(userId: string, refreshToken: string): Promise<GitHubAccount> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("GitHub OAuth is not configured.");
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
  });
  const refreshed = await response.json() as RefreshTokenResponse;
  if (!response.ok || !refreshed.access_token || !refreshed.refresh_token) {
    throw new Error("Your GitHub session has expired. Please sign in again.");
  }
  const expiresAt = refreshed.expires_in ? Math.floor(Date.now() / 1000) + refreshed.expires_in : null;
  await db.update(accounts).set({
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: expiresAt,
  }).where(and(eq(accounts.userId, userId), eq(accounts.provider, "github")));
  return { accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token, expiresAt };
}

async function createGitHubClient(userId: string) {
  let account = await getGitHubAccount(userId);
  if (account.expiresAt && account.expiresAt <= Math.floor(Date.now() / 1000) + 60) {
    if (!account.refreshToken) throw new Error("Your GitHub session has expired. Please sign in again.");
    account = await refreshGitHubAccessToken(userId, account.refreshToken);
  }
  return async function githubFetch<T>(path: string): Promise<T> {
    let response = await requestGitHub(path, account.accessToken!);
    if (response.status === 401 && account.refreshToken) {
      account = await refreshGitHubAccessToken(userId, account.refreshToken);
      response = await requestGitHub(path, account.accessToken!);
    }
    if (response.status === 401) throw new Error("Your GitHub session has expired. Please sign in again.");
    return parseGitHubResponse<T>(response);
  };
}

export async function syncGitHub(userId?: string) {
  const session = await auth();
  const authenticatedUserId = userId ?? session?.user?.id;
  if (!authenticatedUserId || (userId && session?.user?.id !== userId)) throw new Error("Unauthorized.");
  const githubFetch = await createGitHubClient(authenticatedUserId);
  let synced = 0;
  let completedPagination = true;
  const assignedItemIds: string[] = [];
  const ignoredRepositories = await db.select({ name: repositoryPreferences.repositoryName })
    .from(repositoryPreferences)
    .where(and(eq(repositoryPreferences.userId, authenticatedUserId), eq(repositoryPreferences.ignored, true)));
  const ignoredQualifiers = ignoredRepositories.map(({ name }) => `-repo:${name}`).join(" ");

  for (const type of ["issue", "pull_request"] as const) {
    for (const state of ["open", "closed"] as const) {
      let page = 1;
      while (page <= 10) {
        const query = encodeURIComponent(`assignee:@me archived:false is:${type === "issue" ? "issue" : "pr"} state:${state} ${ignoredQualifiers}`.trim());
        const result = await githubFetch<GitHubSearchResult>(`/search/issues?q=${query}&sort=updated&order=desc&per_page=100&page=${page}`);
        if (!result.items.length) break;
        for (const issue of result.items) {
          const itemId = String(issue.id);
          const repository = repositoryDetails(issue);
          assignedItemIds.push(itemId);
          await db.insert(githubItems).values({
            id: itemId, githubId: itemId, repositoryId: repository.id, repositoryName: repository.name, repositoryOwner: repository.owner,
            number: issue.number, type, title: issue.title, url: issue.html_url, state: issue.state, author: issue.user?.login ?? null,
            isDraft: issue.pull_request?.draft ?? false, labels: JSON.stringify(issue.labels.map(({ name, color }) => ({ name, color }))),
            commentCount: issue.comments, createdAt: new Date(issue.created_at), updatedAt: new Date(issue.updated_at), syncedAt: new Date(),
          }).onConflictDoUpdate({
            target: githubItems.githubId,
            set: {
              title: issue.title, url: issue.html_url, state: issue.state, author: issue.user?.login ?? null,
              isDraft: issue.pull_request?.draft ?? false, labels: JSON.stringify(issue.labels.map(({ name, color }) => ({ name, color }))),
              commentCount: issue.comments, updatedAt: new Date(issue.updated_at), syncedAt: new Date(),
            },
          });
          await db.insert(itemMetadata).values({
            id: crypto.randomUUID(),
            userId: authenticatedUserId,
            githubItemId: itemId,
            status: issue.state === "closed" ? "done" : "todo",
          }).onConflictDoNothing();
          await updateCommentTracking(authenticatedUserId, issue);
          synced++;
        }
        if (result.items.length < 100) break;
        if (page === 10) completedPagination = false;
        page++;
      }
    }
  }
  if (completedPagination) {
    const staleItems = await db.select({ githubItemId: itemMetadata.githubItemId }).from(itemMetadata)
      .where(assignedItemIds.length
        ? and(eq(itemMetadata.userId, authenticatedUserId), notInArray(itemMetadata.githubItemId, assignedItemIds))
        : eq(itemMetadata.userId, authenticatedUserId));
    const staleIds = staleItems.map((item) => item.githubItemId);
    if (staleIds.length) {
      await db.delete(notifications).where(and(eq(notifications.userId, authenticatedUserId), inArray(notifications.githubItemId, staleIds)));
      await db.delete(commentTracking).where(and(eq(commentTracking.userId, authenticatedUserId), inArray(commentTracking.githubItemId, staleIds)));
      await db.delete(itemMetadata).where(and(eq(itemMetadata.userId, authenticatedUserId), inArray(itemMetadata.githubItemId, staleIds)));
    }
  }
  const closedItems = await db.select({ githubItemId: itemMetadata.githubItemId }).from(itemMetadata)
    .innerJoin(githubItems, eq(itemMetadata.githubItemId, githubItems.id))
    .where(and(eq(itemMetadata.userId, authenticatedUserId), eq(githubItems.state, "closed")));
  const closedItemIds = closedItems.map((item) => item.githubItemId);
  if (closedItemIds.length) {
    await db.update(itemMetadata).set({ status: "done", updatedAt: new Date() })
      .where(and(eq(itemMetadata.userId, authenticatedUserId), inArray(itemMetadata.githubItemId, closedItemIds)));
  }
  await createDeadlineNotifications(authenticatedUserId);
  return { synced };
}

async function updateCommentTracking(userId: string, issue: GitHubIssue) {
  const [tracking] = await db.select().from(commentTracking).where(and(
    eq(commentTracking.userId, userId), eq(commentTracking.githubItemId, String(issue.id)),
  )).limit(1);
  if (!tracking) {
    // Establish a baseline during the first sync; querying every discussion would be costly and rate-limit prone.
    await db.insert(commentTracking).values({
      id: crypto.randomUUID(),
      userId,
      githubItemId: String(issue.id),
      lastKnownCommentCount: issue.comments,
      updatedAt: new Date(),
    });
    return;
  }
  if (issue.comments <= tracking.lastKnownCommentCount) return;
  const isNew = issue.comments > tracking.lastKnownCommentCount;
  await db.insert(commentTracking).values({
    id: tracking.id, userId, githubItemId: String(issue.id),
    lastKnownCommentId: tracking.lastKnownCommentId, lastKnownCommentAt: tracking.lastKnownCommentAt,
    lastKnownCommentCount: issue.comments,
    lastViewedCommentId: tracking.lastViewedCommentId,
    lastViewedCommentAt: tracking.lastViewedCommentAt, updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [commentTracking.userId, commentTracking.githubItemId],
    set: { lastKnownCommentCount: issue.comments, updatedAt: new Date() },
  });
  if (isNew) {
    await db.insert(notifications).values({
      id: crypto.randomUUID(), userId, githubItemId: String(issue.id), type: "new_comment",
      message: `New comments on #${issue.number}`,
    }).onConflictDoUpdate({
      target: [notifications.userId, notifications.githubItemId, notifications.type],
      set: { readAt: null, createdAt: new Date(), message: `New comments on #${issue.number}` },
    });
  }
}

async function createDeadlineNotifications(userId: string) {
  const rows = await db.select({ item: githubItems, metadata: itemMetadata }).from(itemMetadata)
    .innerJoin(githubItems, eq(itemMetadata.githubItemId, githubItems.id))
    .where(eq(itemMetadata.userId, userId));
  const today = new Date(new Date().toDateString());
  for (const { item, metadata } of rows) {
    if (!metadata.targetDate || metadata.status === "done") continue;
    const days = Math.ceil((metadata.targetDate.getTime() - today.getTime()) / 86_400_000);
    const type = days < 0 ? "target_overdue" : days <= 1 ? "target_soon" : null;
    if (!type) continue;
    await db.insert(notifications).values({
      id: crypto.randomUUID(), userId, githubItemId: item.id, type,
      message: days < 0 ? `Overdue target date for #${item.number}` : `Target date is approaching for #${item.number}`,
    }).onConflictDoNothing();
  }
}
