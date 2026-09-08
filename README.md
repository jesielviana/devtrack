# DevTrack

Personal GitHub Issues and Pull Requests workspace built as a single full-stack Next.js application. GitHub remains the source of truth for repository data; the application stores only private work-management metadata such as **Fazer/Fazendo/Feito**, target dates, and notification/read state.

## Architecture

```text
Browser -> Next.js App Router (Server Components, Server Actions, Route Handlers)
                                      |              |
                                   Auth.js       GitHub REST API
                                      |
                               Drizzle ORM -> PostgreSQL
```

There is no separate backend. OAuth, authorization, GitHub API access, synchronization, and database queries run on the server. GitHub secrets and access tokens are never sent to the browser.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Auth.js GitHub OAuth with the Drizzle adapter
- PostgreSQL, Drizzle ORM and migrations
- Recharts, Lucide React, and dnd-kit Kanban interactions
- Vitest for business-rule tests

## Local setup

1. Copy `.env.example` to `.env.local` and supply the values below.
2. Create a PostgreSQL database.
3. Generate and apply schema migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. Start the application:

   ```bash
   npm run dev
   ```

Create a GitHub OAuth App at `https://github.com/settings/developers` with callback URL `http://localhost:3000/api/auth/callback/github`. For production, change this to your deployed HTTPS URL.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Long random secret used to sign Auth.js cookies |
| `AUTH_URL` | Production | Public application URL |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret; server-only |

Generate `AUTH_SECRET` with `openssl rand -base64 32`. Do not commit `.env.local`.

## Synchronization

**Sync with GitHub** reads the authenticated account token server-side and paginates GitHub Search using the same filters as GitHub's assigned-work view: `assignee:@me`, `archived:false`, type, and state. It upserts GitHub title, state, labels, URLs, repository metadata, and comment counts. Metadata is keyed by the authenticated user and the global GitHub item ID, so one user cannot read or mutate another user's data.

Comment endpoint requests only occur when GitHub reports a changed comment count. The latest comment ID/date and count are tracked; newly discovered comments create a private notification. Deadline alerts are also private. The app never writes labels, comments, projects, milestones, or custom fields to GitHub.

## Features

- GitHub OAuth sign-in and authenticated workspace
- Dashboard metrics and status/repository charts
- Open, closed, and all Issues/PRs with title/repository/label search
- Item detail screens and safe API-provided GitHub links
- Private status management, target-date editing, deadline highlights
- Private tasks with tags, optional repository links, completion dates, and deadline visibility
- Drag-and-drop Kanban
- Repository and label summaries
- Comment and deadline notification center with read controls
- Responsive navigation, loading skeletons, error boundary, and system dark mode

## Validation and deployment

```bash
npm test
npm run lint
npm run build
```

Deploy to Vercel, Railway, Render, or a Docker-compatible platform with the same environment variables, managed PostgreSQL database, and production GitHub OAuth callback URL. Run migrations as a release step before serving the deployment.

## Known operational considerations

GitHub Search is queried with `assignee:@me`, intentionally limiting the workspace to Issues and Pull Requests explicitly assigned to the authenticated user. GitHub OAuth access tokens are persisted by Auth.js's database adapter and must be protected by production database access controls and encrypted storage/backups.
