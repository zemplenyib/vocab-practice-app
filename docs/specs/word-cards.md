# Feature: Word Cards

**Status: Implemented**

## Summary
Word Cards are the primary unit of display for vocabulary items throughout the app. Each card shows a single word's Hungarian and German text (with optional gender), its learning category, and — on hover — action controls for editing and deleting/unlinking the word. Cards are composed into a vertical list by the `WordList` container and appear on the Words page, the List Detail page, and nowhere else.

## User Stories
- As a user, I want to see each vocabulary word displayed as a card so that I can scan my word list at a glance.
- As a user, I want the card's left border colour to reflect the word's learning category so that I can identify New, Learning, and Mastered words without reading the badge.
- As a user, I want to see the German article (gender) displayed alongside the German word so that I always know the grammatical gender.
- As a user, I want to edit a word's Hungarian text, German text, and gender via a modal so that I can correct mistakes without losing the word's rating history.
- As a user, I want to delete or unlink a word from a card so that I can remove vocabulary I no longer need.
- As a user, I want action buttons to appear only on hover so that the card list remains uncluttered when I am just reading.

## Scope

**In scope:**
- The `WordCard` component and its visual presentation (layout, colours, animation, hover state).
- The `WordBadge` component that renders the category label inside each card.
- The `WordList` container that renders a vertical stack of `WordCard` items and shows an empty state.
- The `StatPills` component that summarises New / Learning / Mastered counts above the word list.
- The `AddWordModal` for creating new words.
- The `EditWordModal` for updating an existing word's `hungarian`, `german`, and `gender` fields.
- The `useWords` hook that manages word state and exposes add, update, delete, and unlink operations.
- All API interactions involved in listing, adding, updating, and deleting words (`GET /api/words`, `POST /api/words`, `PUT /api/words/:id`, `DELETE /api/words/:id`).
- Context-aware delete behaviour: permanent deletion when "Alle Wörter" is active; unlink from the current list when a specific list is active.

**Out of scope:**
- The List Detail page's specific page-level layout and navigation (covered by the word-lists spec).
- The add-words view (`/lists/:id/add`) — word card display there uses a simplified inline row, not `WordCard`.
- Practice-mode display of words (handled by `PracticeCard`, not `WordCard`).
- The rating system and scoring logic.
- Any sorting or searching of the word list on the Words page.

## Functional Requirements

### WordCard display
- Each card must display the Hungarian word in `font-mono`, `text-base`, `font-medium` with `var(--text-primary)` colour, left-aligned.
- Each card must display the German word in `font-mono`, `text-sm` with `var(--text-secondary)` colour, to the right of the Hungarian word with a `gap-4` gap.
- If the word has a gender (`der`, `die`, or `das`), it must be rendered immediately before the German word using the category accent colour (`var(--new)` for `der`, `var(--danger)` for `die`, `var(--learning)` for `das`). If `word.gender` is null, no gender text is shown.
- The card's left border must be 3 px wide and coloured with the category accent: `var(--new)` for New, `var(--learning)` for Learning, `var(--mastered)` for Mastered.
- Each card must display a `WordBadge` on the right side showing the category as lowercase text (`new`, `learning`, or `mastered`) styled with the matching category colour and dim background.
- Cards must animate in with `animate-fade-up`. When rendered in a list, each card receives a staggered `animationDelay` of `index * 30ms`.
- The card background transitions from `var(--bg-card)` to `var(--bg-card-hover)` and the border transitions from `var(--border)` to `var(--border-accent)` when the pointer enters the card. Both revert when the pointer leaves.

### Hover-reveal action buttons
- The edit (pencil) button and the delete (trash) button are both hidden (`opacity: 0`) when the card is not hovered and visible (`opacity: 1`) when it is, using a 150 ms opacity transition.
- The edit button appears only when an `onEdit` callback prop is provided. The delete button appears only when an `onDelete` callback prop is provided. Either or both may be absent.
- The edit button uses `aria-label="Edit word"`. On hover over the button itself, its colour transitions from `var(--text-muted)` to `var(--text-secondary)`.
- The delete button uses `aria-label="Delete word"`. On hover over the button itself, its colour transitions from `var(--text-muted)` to `var(--danger)`.
- The two buttons are rendered to the right of the `WordBadge`, separated by `gap-3`.

### WordList container
- `WordList` renders a vertical flex column with `gap-1.5` between cards.
- When `words` is empty, `WordList` renders a centred empty-state message: `"no words yet — add one to begin"` in `font-mono text-sm` with `var(--text-muted)` colour and `py-16` vertical padding.
- `WordList` accepts optional `onEdit` and `onDelete` callbacks; if either is provided it is forwarded to each `WordCard`.

### StatPills
- `StatPills` accepts an array of `WordWithCategory` and renders three pills side-by-side: New (count), Learning (count), Mastered (count).
- Each pill shows the integer count in `font-mono text-2xl font-semibold` and the category label in `font-mono text-xs`, both in the category colour. The pill background is the dim variant of that colour with a translucent border (`${color}33`).
- `StatPills` are shown only when words have loaded without error and the word list is non-empty.

### AddWordModal
- Opens as a full-screen overlay (semi-transparent backdrop with 4 px blur) centred on screen.
- Contains fields for `hungarian` (required, autofocused), `german` (required), and `gender` (optional).
- Gender is selected via three toggle buttons: `der` (blue, `var(--new)`), `die` (red, `var(--danger)`), `das` (yellow, `var(--learning)`). Clicking an already-active gender deselects it. Clicking outside the modal (on the backdrop) closes it without saving.
- The submit button label is `"add word"` during idle and `"adding..."` while the request is in flight; it is disabled while submitting.
- On success, the modal closes and the new word is prepended to the word list in the UI without a full re-fetch.
- On API error, an inline error message is displayed in `font-mono text-xs` with `var(--danger)` colour.
- Input fields highlight their border to `var(--gold-dim)` on focus and revert to `var(--border)` on blur.

### EditWordModal
- Opens the same overlay layout as `AddWordModal`, pre-populated with the word's current `hungarian`, `german`, and `gender` values.
- Hungarian field is autofocused.
- Gender toggle behaves identically to `AddWordModal`.
- The submit button label is `"save changes"` during idle and `"saving..."` while the request is in flight.
- `PUT /api/words/:id` updates only `hungarian`, `german`, and `gender`; `rating`, `createdAt`, and `lastPracticedAt` are not modified.
- On success, the card in the list is updated in place (the word's `category` and other unchanged fields are preserved in the returned response) and the modal closes.
- Clicking outside the modal closes it without saving. On API error, an inline error message is shown.

### Delete / unlink behaviour (Words page)
- When "Alle Wörter" is the active list (`activeListId === null`), clicking the delete button triggers `window.confirm('Permanently delete "${word.hungarian}"?')`. On confirmation, `DELETE /api/words/:id` is called and the card is removed from the list.
- When a specific list is active, clicking the delete button triggers `window.confirm('Remove "${word.hungarian}" from this list?')`. On confirmation, `DELETE /api/lists/:listId/words/:wordId` is called and the card is removed from the list view; the word itself remains in the database.
- The card is removed from the local list state immediately after the API call resolves (not optimistically).

### Delete / unlink behaviour (List Detail page)
- The List Detail page always performs an unlink (never a permanent delete), regardless of any global list context. The confirmation prompt is `'Remove "${word.hungarian}" from this list?'`.
- After unlinking, the List Detail page re-fetches the word list for that list from the API.

### useWords hook
- Exposes: `words`, `loading`, `error`, `refetch(listId?)`, `addWord(input)`, `updateWord(id, input)`, `deleteWord(id)`, `unlinkWord(listId, wordId)`.
- `refetch` accepts an optional `listId`; when provided it calls `GET /api/words?listId={listId}`, otherwise `GET /api/words`.
- `addWord` calls `POST /api/words` and prepends the returned word to the local `words` array.
- `updateWord` calls `PUT /api/words/:id` and replaces the matching entry in the local `words` array.
- `deleteWord` calls `DELETE /api/words/:id` and filters the deleted word out of the local `words` array.
- `unlinkWord` calls `DELETE /api/lists/:listId/words/:wordId` and filters the unlinked word out of the local `words` array.

## UI / UX Requirements

### Layout within a card
```
[ Hungarian (primary, mono)    ] [ gender+German (secondary, mono) ]   [ badge ] [ edit ] [ trash ]
```
- Hungarian and German text form a left-aligned flex row (`items-baseline gap-4`).
- Badge and action buttons form a right-aligned flex row (`items-center gap-3`).
- The card itself is `flex items-center justify-between` with `px-5 py-4` padding and `rounded-lg`.

### Colour tokens used
| Token | Used for |
|---|---|
| `var(--new)` | New category accent; `der` gender; New badge text |
| `var(--new-dim)` | New badge background |
| `var(--learning)` | Learning category accent; `das` gender; Learning badge text |
| `var(--learning-dim)` | Learning badge background |
| `var(--mastered)` | Mastered category accent; Mastered badge text |
| `var(--mastered-dim)` | Mastered badge background |
| `var(--danger)` | `die` gender; delete button hover colour; error messages |
| `var(--bg-card)` | Card default background |
| `var(--bg-card-hover)` | Card hovered background |
| `var(--border)` | Card default border |
| `var(--border-accent)` | Card hovered border |
| `var(--text-primary)` | Hungarian word text |
| `var(--text-secondary)` | German word text; edit button hover colour |
| `var(--text-muted)` | Edit/delete button default colour; empty state text |
| `var(--gold)` | "Add word" / "save changes" button fill |
| `var(--gold-dim)` | "Add word" button resting background; input focus border |

### Modal overlay
- Fixed full-screen overlay, z-index 50, with `rgba(0,0,0,0.7)` background and `backdrop-filter: blur(4px)`.
- Modal panel: `max-w-md`, `rounded-xl`, `p-6`, background `var(--bg-card)`, border `var(--border-accent)`.
- Heading: `font-display text-xl font-semibold`.
- Animates in with `animate-fade-up`.

### Words page integration
- The heading area shows `"Vocabulary"` (`font-display text-3xl font-semibold`) with a word count subtitle below it.
- A `"+ add word"` button sits top-right, styled with `var(--gold-dim)` background and `var(--gold)` text at rest, inverting to solid gold on hover.
- `ListSelector` appears below the heading area.
- `StatPills` appears below `ListSelector`, only when the word list is non-empty and loaded without error.
- `WordList` appears below `StatPills` (or directly below `ListSelector` if the list is empty).
- A loading state renders `"loading..."` in `font-mono text-sm` centred in `py-12` vertical space.
- An error state renders the error message in `var(--danger)` with the same centred layout.

## Data Requirements

### `words` table (existing)
| Column | Type | Constraints |
|---|---|---|
| `id` | integer | primary key, auto-increment |
| `hungarian` | text | not null |
| `german` | text | not null |
| `gender` | text (`'der'` \| `'die'` \| `'das'`) | nullable |
| `rating` | integer | not null, default 0 |
| `createdAt` | integer (unix epoch) | not null, default `unixepoch()` |
| `lastPracticedAt` | integer (unix epoch) | nullable |

### `WordWithCategory` type
`Word & { category: 'New' | 'Learning' | 'Mastered' }` — derived at query time by `getCategory(rating)`:
- `rating === 0` → `'New'`
- `rating 1–6` → `'Learning'`
- `rating 7–10` → `'Mastered'`

### `AddWordInput` validation (shared schema)
- `hungarian`: string, min 1, max 200 characters.
- `german`: string, min 1, max 200 characters.
- `gender`: `'der' | 'die' | 'das'` or `null` / omitted.

### API endpoints used by word cards

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/words` | Fetch all words, ordered by `createdAt` descending. |
| `GET` | `/api/words?listId={id}` | Fetch words belonging to the specified list, ordered by `createdAt` descending. Returns 400 for a non-positive integer `listId`; returns 404 if the list does not exist. |
| `POST` | `/api/words` | Create a word. Body validated against `AddWordSchema`. Returns 201 with the created `WordWithCategory`. |
| `PUT` | `/api/words/:id` | Update `hungarian`, `german`, `gender` of an existing word. Body validated against `AddWordSchema`. Returns 404 if the word does not exist. Returns the updated `WordWithCategory`. |
| `DELETE` | `/api/words/:id` | Permanently delete a word. Cascades to `practice_sessions` and `word_lists`. Returns 404 if not found; returns `{ ok: true }` on success. |

Unlinking (removing a word from a list without deleting it) uses `DELETE /api/lists/:listId/words/:wordId`, documented fully in the word-lists spec.

## Edge Cases & Error Handling

- **Empty word list**: `WordList` renders the empty-state string `"no words yet — add one to begin"` rather than an empty container. `StatPills` is not rendered.
- **Loading state**: While `useWords` is fetching, the Words page renders `"loading..."` and suppresses both `StatPills` and `WordList`.
- **API error on load**: `useWords` sets `error` to the error message string. The Words page renders the error message in `var(--danger)` and suppresses `StatPills` and `WordList`.
- **API error in AddWordModal / EditWordModal**: The modal stays open and displays the error inline. Submitting can be retried immediately.
- **User dismisses confirmation dialog**: The delete or unlink API call is not made; the card remains in the list.
- **Word not found on PUT**: The API returns 404. `updateWord` propagates the error; `EditWordModal` displays it inline.
- **Word not found on DELETE**: The API returns 404. `deleteWord` propagates the error; since the modal is already dismissed before the call, the error is currently unhandled in the UI (the card will remain visible until the next refetch).
- **Gender is null**: The gender portion of the German text span is simply absent. The edit modal initialises the gender toggle with no button active. Submitting without selecting a gender sends `gender: null` to the API.
- **Add word while a specific list is active**: After `POST /api/words` succeeds, the new word is immediately linked to the active list via `POST /api/lists/:listId/words/:wordId`, then the word list is re-fetched scoped to that list. The new word appears in the list.
- **Add word while "Alle Wörter" is active**: No list-link call is made. The new word is prepended to the local state immediately from the `POST /api/words` response and is visible in "Alle Wörter" by virtue of being in the database.
- **Staggered animation**: The `animationDelay` is computed from the card's index in the rendered list. Re-ordering or filtering the list reassigns indices and thus resets animation delays; this is expected and intentional.
