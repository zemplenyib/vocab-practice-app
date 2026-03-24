# Vocab Practice App — Developer Guide

## Architecture

pnpm monorepo with three packages:
- `packages/shared` (`@vocab/shared`) — Drizzle schema, Zod validators, TypeScript types. **Source of truth** for all data shapes.
- `apps/api` (`@vocab/api`) — Hono + Drizzle ORM + @libsql/client. Serves REST API on port 3000, serves static frontend in production.
- `apps/web` (`@vocab/web`) — React 18 + Vite + Tailwind CSS. Proxies `/api` to port 3000 in dev.

## Key Design Decisions

- **@libsql/client over better-sqlite3**: Node.js 22 on this Windows dev machine lacks VS 2019+ required for native compilation. @libsql/client is pure JS/WASM, no build tools needed.
- **SQLite with Drizzle**: Local file DB (`vocab.db` in repo root). Drizzle migrations are in `apps/api/src/migrations/`.
- **Schema lives in shared**: `packages/shared/src/schema.ts` is imported by both the API (Drizzle) and drizzle-kit config. Never duplicate types.
- **Gender always shown in practice**: To avoid leaking noun/non-noun status, the gender selector is always visible. If `word.gender` is null, gender input is ignored during evaluation.
- **Word selection**: In-memory circular buffer (last 5 words) in `selectionService.ts`. Recently practiced words get 0.1× weight. Category weights: New=3, Learning=2, Mastered=1.
- **Edit word**: `PUT /api/words/:id` updates `hungarian`, `german`, `gender` only — preserves `rating`, `createdAt`, `lastPracticedAt`. Frontend uses `EditWordModal` (pencil icon on hover in `WordCard`).
- **Gender UI**: der/die/das shown as toggle buttons (blue/red/yellow). Click again to deselect. Used in both `AddWordModal` and `EditWordModal`.
- **Word Lists**: Words can belong to multiple lists via a many-to-many `word_lists` join table. "Alle Wörter" is a virtual sentinel (no DB row) that always resolves to all words. Delete on "Alle Wörter" removes the word permanently; delete on a specific list unlinks the word from that list only. Foreign keys enabled via `PRAGMA foreign_keys = ON` in `db.ts` to ensure cascade deletes work correctly. New words added while a specific list is selected are automatically linked to that list.

## Common Commands

```bash
# Install all deps
npm exec pnpm install

# Start API dev server (hot reload)
npm exec pnpm dev:api

# Start frontend dev server (with /api proxy)
npm exec pnpm dev:web

# Seed database with 50 demo words (skips if DB already has words)
cd apps/api && node_modules/.bin/tsx src/seed.ts

# Generate new migration after schema changes
cd apps/api && node_modules/.bin/drizzle-kit generate

# Build everything + copy frontend to API's public/ for production
npm exec pnpm build

# Start production server via PM2
pm2 start pm2.config.js
```

## Running pnpm on Windows

pnpm is not globally installed. Use `npm exec pnpm <command>` or run binaries from `apps/api/node_modules/.bin/` directly.

## Database

SQLite file: `apps/api/vocab.db` (resolved relative to where the API process runs, gitignored). Migrations run automatically on API startup via `migrate()` in `apps/api/src/db.ts`.

## Rating System

Rating is an integer (0–10).

| Rating | Category | Selection weight |
|--------|----------|-----------------|
| 0      | New      | 3               |
| 1–6    | Learning | 2               |
| 7–10   | Mastered | 1               |

First presentation (rating=0): bumped to 1 regardless of answer. After that, correct: `rating + 1` (max 10), wrong: `rating - 1` (min 1).
