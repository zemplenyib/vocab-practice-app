# Feature: Word Lists

**Status: Implemented**

## Summary
Word Lists allow users to organise their vocabulary into named collections. Words can belong to multiple lists simultaneously. A special built-in list called "Alle Wörter" always contains every word in the database and cannot be modified or removed. Both the Words page and the Practice page gain an independent list selector so the user can browse or practise a specific subset of their vocabulary.

## User Stories
- As a user, I want to create named word lists so that I can group vocabulary by topic, lesson, or any other criteria I choose.
- As a user, I want to rename or delete my custom lists so that I can keep my collections organised as my needs change.
- As a user, I want to add a word to one or more specific lists so that the same word can appear wherever it is relevant.
- As a user, I want to filter the Words page by a list so that I can review only the words in that collection.
- As a user, I want to practise only the words in a chosen list so that I can focus on a specific set.
- As a user, I want to remove a word from a specific list without deleting the word itself so that I can reorganise without losing vocabulary data.
- As a user, I want to permanently delete a word from "Alle Wörter" so that I can remove vocabulary I no longer need.
- As a user, I want the New / Learning / Mastered stats to reflect whichever list I am currently viewing so that the counts are meaningful in context.

## Scope

**In scope:**
- A new "Lists" page in the navigation for creating, renaming, and deleting custom lists.
- A list selector (dropdown or equivalent) on the Words page that filters the word grid and stats.
- A list selector on the Practice page that scopes word selection to the chosen list.
- Many-to-many relationship between words and lists via a join table.
- The "Alle Wörter" virtual list (implemented as a special sentinel — no database row required — that always resolves to all words).
- Word deletion: permanently deletes the word from the database when on "Alle Wörter"; unlinks the word from the current list when on a specific list.
- Linking a newly added word to the currently selected list when that list is not "Alle Wörter".
- New/Learning/Mastered stat pills on the Words page updating to reflect the active list.

**Out of scope:**
- Reordering words within a list.
- Nesting or hierarchy of lists (lists are flat).
- Sharing or exporting lists.
- Bulk add/remove of words across lists from a single action.
- Any change to the rating system or practice scoring logic.
- Any change to the existing edit-word flow (`EditWordModal`, `PUT /api/words/:id`).

## Functional Requirements

### Lists management (Lists page)
- The app must expose a "Lists" navigation entry that routes to a dedicated Lists page (`/lists`).
- The Lists page must display all custom lists by name, each with its word count.
- The user must be able to create a new list by providing a name; the name must be non-empty and must not duplicate an existing list name (case-insensitive comparison).
- The user must be able to rename any custom list; the same uniqueness constraint applies.
- The user must be able to delete any custom list; deletion removes the list and all its word-list links but must not delete any words.
- "Alle Wörter" must appear on the Lists page (so the user can see it exists) but must not offer rename or delete controls.

### List selector — Words page
- The Words page must display a list selector above the word grid, defaulting to "Alle Wörter" on load.
- When "Alle Wörter" is selected, all words in the database are shown and all stat counts reflect all words.
- When a specific list is selected, only words linked to that list are shown and stat counts reflect only those words.
- The list selector must include "Alle Wörter" as the first option, followed by all custom lists in creation order.

### List selector — Practice page
- The Practice page must display a list selector visible in the idle state (before practice begins), defaulting to "Alle Wörter" on load.
- The selected list is locked in for the duration of a practice session; changing lists requires returning to the idle state.
- When "Alle Wörter" is selected, `GET /api/practice/next` draws from all words (existing behaviour, unchanged).
- When a specific list is selected, `GET /api/practice/next` must draw only from words linked to that list.
- If the selected list contains zero words, the "start practice" button must be disabled and a message such as "no words in this list" must be shown in place of the normal subtitle.

### Word addition
- When a specific list is selected on the Words page and the user adds a new word, the word must be created in the database and immediately linked to the active list.
- When "Alle Wörter" is selected on the Words page and the user adds a new word, the word is created in the database with no list links (it is visible in "Alle Wörter" by virtue of being in the database).

### Word removal / deletion
- Each WordCard must gain a delete control (distinct from the existing edit pencil) visible on hover.
- When "Alle Wörter" is the active list and the user activates delete, a confirmation prompt must be shown. On confirmation, the word is permanently deleted from the database, cascading to all list links and practice session records.
- When a specific list is the active list and the user activates delete, a confirmation prompt must be shown. On confirmation, the word is unlinked from that list only; the word itself and any links to other lists are preserved. The word remains visible in "Alle Wörter" and any other lists it belongs to.
- The confirmation prompt must clearly state the action: "Delete word permanently?" vs "Remove from this list?".

### "Alle Wörter" invariant
- "Alle Wörter" must never be stored as a database row. It is a client/API-level concept resolved at query time to mean "no list filter applied".
- No API route may allow creation, modification, or deletion of a list with the name "Alle Wörter" (case-insensitive).

## UI / UX Requirements

### Navigation
- The NavBar currently has two links: "Words" (`/`) and "Practice" (`/practice`). A third link, "Lists" (`/lists`), must be added between them, following the same active-state styling (gold underline on active route).

### Lists page (`/lists`)
- Displays a page heading ("Lists") consistent with the existing heading style (`font-display`).
- Below the heading, a "+ new list" button (styled like the existing "+ add word" button on the Words page) opens an inline input or modal for entering the list name.
- Each list row shows: list name, word count as a secondary label, and — for custom lists only — rename and delete icon buttons visible on hover (consistent with the hover-reveal pattern used on WordCard).
- "Alle Wörter" row shows the name and total word count with no action controls.
- Deleting a list must show a confirmation prompt stating the list name and noting that words will not be deleted.
- An empty state ("no lists yet — create one to begin") is shown when no custom lists exist.

### Words page — list selector
- Displayed as a segmented control, tab row, or dropdown directly above the stat pills.
- The active selection is visually distinguished (e.g., gold underline or highlighted chip).
- Switching lists immediately re-fetches / re-filters the word grid and stat pills without a full page reload.

### Practice page — list selector
- Displayed in the idle card, between the page title and the "start practice" button.
- A compact selector (e.g., a styled `<select>` or tab row) showing "Alle Wörter" and all custom lists.
- Once practice has started (state is not IDLE), the selector is hidden — the active list is shown as a read-only label near the heading.

### Delete control on WordCard
- A trash / remove icon appears on hover to the right of the existing edit pencil.
- Icon appearance and behaviour follow the same hover-reveal and color conventions as the edit pencil.
- Confirmation is a browser `window.confirm` dialog or a lightweight inline modal — either is acceptable.

## Data Requirements

### New tables (to be added to `packages/shared/src/schema.ts`)

**`lists` table**
- `id`: integer, primary key, auto-increment.
- `name`: text, not null, unique (enforced at DB level).
- `createdAt`: integer (unix epoch), not null, default `unixepoch()`.

**`word_lists` join table**
- `wordId`: integer, not null, foreign key → `words.id` ON DELETE CASCADE.
- `listId`: integer, not null, foreign key → `lists.id` ON DELETE CASCADE.
- Composite primary key: (`wordId`, `listId`).

### Cascade behaviour
- Deleting a word (via the new `DELETE /api/words/:id` endpoint) cascades to `practice_sessions` (already has ON DELETE CASCADE) and to `word_lists` (via the new foreign key).
- Deleting a list cascades to `word_lists` only; words are untouched.

### Existing data
- No migration is needed for existing words. Because "Alle Wörter" is virtual, all existing words are automatically part of it from day one. The `lists` and `word_lists` tables start empty.

### API changes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/lists` | Return all custom lists with word count per list. |
| POST | `/api/lists` | Create a new list. Body: `{ name: string }`. Returns 409 if name already exists. |
| PUT | `/api/lists/:id` | Rename a list. Body: `{ name: string }`. Returns 404 if not found, 409 on name conflict. |
| DELETE | `/api/lists/:id` | Delete a list and its word-list links. Returns 404 if not found. |
| POST | `/api/lists/:id/words/:wordId` | Link a word to a list. Idempotent (no error if already linked). |
| DELETE | `/api/lists/:id/words/:wordId` | Unlink a word from a list. Returns 404 if list or word not found. |
| DELETE | `/api/words/:id` | Permanently delete a word (new endpoint). Cascades to `word_lists` and `practice_sessions`. Returns 404 if not found. |
| GET | `/api/words?listId=` | Existing `GET /api/words` gains an optional `listId` query parameter. When omitted, returns all words. When provided, returns only words linked to that list. |
| GET | `/api/practice/next?listId=` | Existing endpoint gains optional `listId` query parameter. When omitted, selects from all words. When provided, selects only from words in that list. |

### Validation
- List name: non-empty string, max 100 characters, trimmed of leading/trailing whitespace before storage.
- `listId` query parameter on `GET /api/words` and `GET /api/practice/next`: must be a positive integer when present; unknown id returns 404.

## Edge Cases & Error Handling

- **Practising an empty list**: The `GET /api/practice/next?listId=X` endpoint returns `404` with `{ error: "No words available" }` (same shape as the existing no-words error). The frontend handles this identically to the current no-words-in-database case — the "start practice" button is disabled and a message is displayed.
- **Adding a word to a list that has since been deleted**: The `POST /api/lists/:id/words/:wordId` endpoint returns 404. The frontend must handle this gracefully by refreshing the list selector.
- **Renaming a list to the same name it already has**: Treat as a no-op (200 OK, word count and data unchanged).
- **Attempting to rename or delete "Alle Wörter"**: Any `PUT` or `DELETE` to the `lists` route that would affect a list named "Alle Wörter" must return `400` with `{ error: "Cannot modify the default list" }`. The frontend never presents these controls, but the API must enforce this independently.
- **Deleting a word that is in multiple lists**: Permanent deletion from "Alle Wörter" removes the word from all lists (via cascade). This is correct and intentional; no special warning beyond the standard confirmation is required.
- **List name uniqueness conflict**: `POST /api/lists` and `PUT /api/lists/:id` return `409 Conflict` with `{ error: "A list with that name already exists" }`. The frontend must surface this message to the user.
- **Switching lists mid-session (Practice page)**: Changing the list selector while in IDLE state is permitted. Changing it while in any non-IDLE state is prevented by hiding the selector; if a user navigates away and back, the page resets to IDLE and the selector reverts to "Alle Wörter".
- **Network error during list operations**: The Lists page must display an error message consistent with the existing error style (`var(--danger)` colour, `font-mono` text) when any API call fails.
- **`GET /api/words?listId=X` with an unknown listId**: Returns `404` with `{ error: "List not found" }`.
