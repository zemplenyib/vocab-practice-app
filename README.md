# Vocab Practice App

A Hungarian → German vocabulary practice app with a spaced-repetition-style rating system.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Backend**: Node.js + TypeScript + Hono + Drizzle ORM + @libsql/client (SQLite)
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Database**: SQLite (file-based, no server required)

## Prerequisites

- Node.js 22+
- npm (used to invoke pnpm)

> **Windows note**: pnpm is not globally installed. Use `npm exec pnpm <command>` for all pnpm commands.

## Development Setup

```bash
# 1. Install all dependencies
npm exec pnpm install

# 2. Start the API (port 3000, hot reload)
npm exec pnpm dev:api

# 3. In a separate terminal, start the frontend (port 5173)
npm exec pnpm dev:web
```

Open http://localhost:5173 in your browser.

The API runs at http://localhost:3000. The frontend proxies all `/api` requests there.

## Adding Words

1. Go to the **Words** tab
2. Click **+ Add Word**
3. Enter the Hungarian word, German translation, and optionally the grammatical gender (der/die/das)

## Practice Mode

1. Go to the **Practice** tab
2. Click **Start Practice**
3. For each word shown in Hungarian:
   - Select the gender (always shown — pick "None" for non-nouns)
   - Type the German translation
   - Click **Submit Answer**
4. Correct answers increase rating; wrong answers decrease it

## Rating System

| Rating | Category | Practice frequency |
|--------|----------|--------------------|
| 0–2    | New      | High (weight 3)    |
| 3–6    | Learning | Medium (weight 2)  |
| 7–10   | Mastered | Low (weight 1)     |

Recently practiced words (last 5) get a 0.1× weight reduction to promote variety.

## Production Deployment (Linux Server)

### One-time setup

```bash
# Install PM2 globally
npm install -g pm2

# Install dependencies
npm exec pnpm install
```

### Build and deploy

```bash
# Build API + frontend, copy frontend into API's public/ directory
npm exec pnpm build

# Start with PM2 (serves everything on port 3000)
pm2 start pm2.config.js

# Save PM2 config to restart on reboot
pm2 save
pm2 startup
```

### Database migrations

Migrations run **automatically** on API startup. The SQLite file is created at `./vocab.db` (configurable via `DATABASE_URL` env var).

To manually generate a migration after changing `packages/shared/src/schema.ts`:

```bash
cd apps/api
node_modules/.bin/drizzle-kit generate
```

### Environment variables

Copy `.env.example` to `.env` and adjust as needed:

```
DATABASE_URL=file:./vocab.db
PORT=3000
NODE_ENV=production
```

## Project Structure

```
vocab-practice-app/
├── packages/shared/        # Shared types, schema, validators (@vocab/shared)
├── apps/api/               # Hono REST API + static file server
│   └── src/
│       ├── routes/         # words.ts, practice.ts
│       ├── services/       # wordService, practiceService, selectionService
│       └── migrations/     # Drizzle-generated SQL migrations
└── apps/web/               # React frontend
    └── src/
        ├── pages/          # HomePage, PracticePage
        ├── components/     # layout/, words/, practice/
        └── hooks/          # useWords, usePractice (state machine)
```
