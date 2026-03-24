# Architecture Reference

> Maintained by the docs-updater agent after each feature implementation. Always read this before exploring the codebase.

## Package Boundaries

| Package | Workspace name | Owns |
|---------|---------------|------|
| `packages/shared` | `@vocab/shared` | Drizzle schema, Zod validators, TypeScript types — source of truth for all data shapes |
| `apps/api` | `@vocab/api` | Hono REST API, services, DB access, static file serving in production |
| `apps/web` | `@vocab/web` | React 18 SPA (Vite + Tailwind), proxies `/api` to :3000 in dev |

All inter-package imports use `@vocab/shared` (never relative paths across packages).

---

## Key Files

### `packages/shared/src/`
- `schema.ts` — Drizzle table definitions (`words`, `practice_sessions`). Single source of truth.
- `types.ts` — TypeScript types: `Word`, `WordWithCategory`, `Category`, `AnswerResult`. Helper: `getCategory(rating)`.
- `validators.ts` — Zod schemas: `AddWordSchema`, `SubmitAnswerSchema`.
- `index.ts` — Re-exports everything above.

### `apps/api/src/`
- `index.ts` — Hono app setup, route registration, CORS, static serving in prod.
- `db.ts` — @libsql/client + Drizzle init, auto-runs migrations on startup.
- `routes/words.ts` — `GET/POST /api/words`, `PUT /api/words/:id`.
- `routes/practice.ts` — `GET /api/practice/next`, `POST /api/practice/answer`.
- `services/wordService.ts` — getAllWords, addWord, getWordById, updateWord, updateWordRating.
- `services/practiceService.ts` — submitAnswer: evaluates answers, updates rating, records session.
- `services/selectionService.ts` — selectNextWord (weighted random), recordPracticed (circular buffer, last 5).
- `migrations/` — Drizzle-generated SQL files, auto-applied on startup.

### `apps/web/src/`
- `api/client.ts` — Typed fetch wrapper. All HTTP logic here. `api.words.{list,add,update}`, `api.practice.{next,answer}`.
- `hooks/usePractice.ts` — Practice state machine (IDLE → AWAITING_ANSWER → SHOWING_RESULT).
- `hooks/useWords.ts` — Word list fetch + add/update.
- `pages/HomePage.tsx` — Word list, category stats, add modal trigger.
- `pages/PracticePage.tsx` — Practice card container, routes through usePractice state.
- `components/layout/` — AppShell, NavBar.
- `components/practice/` — PracticeCard, AnswerInput, ResultDisplay.
- `components/words/` — WordList, WordCard, WordBadge, AddWordModal, EditWordModal.
- `index.css` — Tailwind imports, CSS variables (dark academia theme), @keyframes.

---

## Data Layer

- **DB**: SQLite file at `vocab.db` (monorepo root). Env var: `DATABASE_URL` (default `file:./vocab.db`).
- **ORM**: Drizzle ORM + @libsql/client (pure JS/WASM — no native compilation required).
- **Tables**: `words(id, hungarian, german, gender, rating, created_at, last_practiced_at)`, `practice_sessions(id, word_id, was_correct, practiced_at)`.
- **Migrations**: Auto-applied on startup. Generate new: `cd apps/api && drizzle-kit generate`. Config in `apps/api/drizzle.config.ts`.
- **Query pattern**: `db.select()`, `db.insert()`, `db.update()` with Drizzle query builders (`eq()`, `desc()`).

---

## API Layer

- **Framework**: Hono on port 3000.
- **Route registration**: `app.route('/api/words', wordsRouter)` in `index.ts`.
- **Validation**: `@hono/zod-validator` via `zValidator('json', Schema)` — auto-returns 400 on failure.
- **Response shape**: success → `c.json(data, status)`, error → `c.json({ error: 'message' }, status)`.
- **Middleware**: `logger()` on all routes, `cors()` on `/api/*` only.

---

## Frontend Layer

- **Routing**: react-router-dom v6. Two routes: `/` (HomePage), `/practice` (PracticePage).
- **State**: React hooks only (useState). No global state manager.
- **API calls**: All via `src/api/client.ts`. Never fetch directly in components.
- **Styling**: Tailwind + CSS variables in `:root`. Fonts: Playfair Display (display), Geist Mono (mono). Colors: `--bg`, `--gold`, `--new`, `--learning`, `--mastered`.
- **Modal pattern**: Fixed overlay, click-outside-to-close, form state local to component.
- **Gender toggle**: 3-button (der/blue, die/red, das/yellow). Click again to deselect.

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Components / Pages | PascalCase | `WordCard.tsx`, `HomePage.tsx` |
| Hooks | camelCase with `use` prefix | `useWords.ts` |
| Services / utilities | camelCase | `wordService.ts`, `client.ts` |
| DB columns | snake_case | `created_at`, `word_id` |
| TS types | PascalCase | `Word`, `AddWordInput` |
| Zod schemas | PascalCase + Schema | `AddWordSchema` |
| Functions | camelCase | `getAllWords`, `selectNextWord` |
| Constants | UPPER_SNAKE_CASE | `RATING_MAX`, `RECENT_BUFFER_SIZE` |

---

## Key Design Decisions

- **@libsql/client over better-sqlite3**: Node 22 on Windows lacks VS 2019+ for native compilation.
- **Schema in shared package**: Drizzle imports it; frontend uses inferred types. Never duplicate.
- **Rating 0→1 on first practice**: New words always bump to 1 regardless of answer.
- **Recency circular buffer**: Last 5 practiced words get 0.1× selection weight. Resets on API restart.
- **Gender always shown**: Even if `word.gender` is null, selector is visible. Null = skip gender check.
- **PUT /words/:id**: Updates `hungarian`, `german`, `gender` only — preserves `rating`, `createdAt`, `lastPracticedAt`.
- **Prod serving**: Vite dist copied to `apps/api/public/`. Single port (3000) serves everything.
