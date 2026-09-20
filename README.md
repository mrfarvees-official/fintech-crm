# Fintech CRM

An internal CRM for a fintech's back office — customer onboarding, KYC
verification, and compliance approvals in one place.

## What's built right now

- **Authentication** — sign in, sign out, protected pages, session cookies.

That's it so far. The database is already modeled for everything below,
but there's no application code for it yet:

- Customer records
- KYC case management (submissions, documents, reviewer decisions)
- Risk assessment
- Multi-step approval workflows
- Policy-based permissions (PBAC) — access decisions evaluated against
  stored policies, not a direct role→permission lookup
- Audit log
- Notifications

## Tech stack

- Next.js 16 (App Router) + React 19
- MySQL + Drizzle ORM
- Tailwind CSS
- TypeScript

## Prerequisites

- Node.js 20 or newer
- A MySQL server you can connect to (local install, Docker, or a hosted
  instance)

## Setup — step by step

**1. Install dependencies**

```bash
npm install
```

**2. Create your environment file**

```bash
cp .env.example .env
```

Open `.env` and fill in two values:

```
DATABASE_URL=mysql://user:password@localhost:3306/fintech_crm
SESSION_SECRET=
```

- `DATABASE_URL` — connection string to a MySQL database (it can be empty,
  the database itself doesn't need to exist yet — the migration step
  creates the tables).
- `SESSION_SECRET` — a random string used to sign login sessions. Generate
  one with:

  ```bash
  openssl rand -base64 32
  ```

  Paste the output as the value.

**3. Set up the database**

This creates all tables and fills them with demo data in one step:

```bash
npm run db:fresh
```

(Under the hood this runs `db:reset` → `db:migrate` → `db:seed`. You can
run those individually if you only need one step.)

**4. Start the app**

```bash
npm run dev
```

**5. Open it**

Go to [http://localhost:3000](http://localhost:3000) — you'll land on the
login page.

## Logging in

The seed script creates five demo users, all with the password `1234`:

| Email                    | Role                  |
| ------------------------ | --------------------- |
| `rm@fintech.local`       | Relationship Manager  |
| `analyst@fintech.local`  | KYC Analyst           |
| `officer@fintech.local`  | Compliance Officer    |
| `manager@fintech.local`  | Compliance Manager    |
| `admin@fintech.local`    | Administrator         |

Right now every account sees the same basic home page after logging in —
role-based views haven't been built yet.

## All available commands

| Command                | What it does                                    |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Start the app locally                            |
| `npm run build`         | Build for production                             |
| `npm run start`         | Run a production build                           |
| `npm run lint`          | Check code style                                 |
| `npm run db:generate`   | Generate a migration file after changing schema  |
| `npm run db:migrate`    | Apply migrations to the database                 |
| `npm run db:push`       | Push schema changes directly (skips migration files) |
| `npm run db:studio`     | Open a visual database browser                   |
| `npm run db:reset`      | Wipe all tables                                  |
| `npm run db:seed`       | Insert demo data                                 |
| `npm run db:fresh`      | Reset + migrate + seed, in one command           |

## Architecture

The project is organized by **feature**, not by technical layer — each
capability owns its own folder with everything it needs (server actions,
validation, components), rather than scattering related code across
generic `components/`, `actions/`, `utils/` folders.

```
app/                    Routes only. Pages stay thin and call into
                        features/ and lib/ for actual logic.
  login/page.tsx
  page.tsx              Protected home page

features/
  auth/                 Everything specific to signing in/out
    actions.ts            Server actions: loginAction, logoutAction
    schema.ts             Zod validation for the login form
    components/           Client UI (login form)

lib/
  auth/                 Auth primitives other features can reuse later
    passwords.ts           Password hashing/verification
    session.ts              Session cookie encrypt/decrypt (JWT)
    dal.ts                   Data Access Layer — see below
    config.ts                 Shared constants (cookie name, expiry)
  db/                    Drizzle schema, seed scripts, DB connection
```

When a new feature is added (KYC, approvals, etc.), it gets its own folder
under `features/` following the same shape as `features/auth/`, and reuses
the primitives in `lib/` rather than duplicating them.

### Data Access Layer (`lib/auth/dal.ts`)

This is the one place that answers "is this user logged in, and who are
they." Every protected page calls `getCurrentUser()` from here instead of
reading cookies or querying the database directly. That means:

- The auth check can't accidentally be skipped on a new page — fetching
  the user *is* the check.
- If the session format or user-lookup query ever changes, it changes in
  one file.
- It never returns the password hash — only the fields a page actually
  needs.

Results are memoized per request with React's `cache()`, so multiple
components on the same page can call `getCurrentUser()` without hitting
the database more than once.

### State management

There's no client-side state library (no Redux/Zustand/etc.) and none is
needed yet. Auth state lives in an httpOnly session cookie plus the
database, read fresh on the server for every request — the client never
even holds a copy of it. The only client-side state in the app is trivial
form UI (pending/error) handled by React's `useActionState`.

A client store would only be worth introducing once a feature has
genuinely complex, cross-component client-only state (e.g. a multi-step
wizard) — not for identity/session data, which belongs on the server.

### `proxy.ts`

Next.js 16 renamed `middleware.js` to `proxy.js` (same mechanism, new
name). This file only does a cheap, optimistic check — is a session cookie
present — to redirect at the edge before a page even renders. It does
**not** verify the session or touch the database; that real check happens
in the DAL on every request, which is the actual security boundary.



- **"SESSION_SECRET environment variable is not defined"** — you skipped
  step 2, or left `SESSION_SECRET` blank in `.env`. Generate one with
  `openssl rand -base64 32` and restart `npm run dev`.
- **Can't connect to the database** — double check `DATABASE_URL` and that
  your MySQL server is actually running and reachable.
- **Changed the schema and it's not reflected** — run `npm run db:generate`
  then `npm run db:migrate` (or `npm run db:push` for quick local
  iteration without a migration file).