---
name: implement-feature
description: Implement a feature end-to-end through a full pipeline of spec, architecture, implementation, tests, docs, and commit. Use when the user wants to build a new feature or change an existing one.
disable-model-invocation: true
argument-hint: <description> | <feature-name>: <description> | resume <feature-name>
---

Implement a feature end-to-end using the following pipeline. The feature is: $ARGUMENTS

## Argument parsing

Parse $ARGUMENTS for the following optional keywords and patterns before doing anything else:

**`resume <feature-name>`** — e.g. `resume word-lists`
- Read `docs/progress/<feature-name>.md` and resume from the first step not marked `completed`. Do not re-run completed steps.
- No mode detection needed — the progress file already contains the mode from the original run.

**`<feature-name>: <description>`** — e.g. `word-lists: add bulk import`
- Use `<feature-name>` (converted to kebab-case) as the feature slug.
- Set `mode: update` immediately. Skip all mode detection below.

**Plain description** — e.g. `add bulk import to word lists`
- Derive the feature slug from the full description text.
- Proceed with mode detection below.

## Mode detection (plain description only)

Check if `docs/specs/<feature-name>.md` already exists.
- If it does: tell the user "A spec already exists for this feature — treating this as a change request." Set `mode: update`.
- If it does not: set `mode: new`.

Create `docs/progress/<feature-name>.md` with all steps marked `pending` and the resolved `mode` field before starting step 1.

## Checkpointing

After each step completes, update the progress file — mark the step `completed` and record its key output (spec file path, architect plan file path, worktree branch name, test results summary, etc.). This allows the pipeline to resume after a session interruption.

## Pipeline

Run steps sequentially. Each agent receives the previous step's output as context.

**Step 1 — Spec**
Run the `spec-definer` agent with the feature description. It checks `docs/specs/` for an existing spec, asks clarifying questions, then writes or updates the spec file. Do not proceed until the spec is written and the user confirms they are happy with it.

After spec-definer completes, run `git status --short docs/specs/` to check whether the spec file is new (`?? ...`) or modified (`M ...`). If modified and the current mode is `new`, upgrade to `mode: update` in the progress file — this corrects the initial detection when the slug didn't match the existing filename.
_Checkpoint: record spec file path and write final `mode` to progress file._

**Step 2 — Architect**
Run the `feature-architect` agent with the feature description, the spec file from step 1, and the `mode` from the progress file. If `mode: update`, instruct the architect to produce a **delta plan** — what changes relative to the existing implementation, not a full redesign. Capture the full implementation plan.
_Checkpoint: record a one-paragraph summary of the plan._

**Step 3 — Implementer**
Run the `feature-implementer` agent in `isolation: "worktree"` with the architect's plan. It writes all code but does not commit.
_Checkpoint: record the worktree branch name and list of files changed._

**Step 4 — Tests**
Run the `test-engineer` agent **in the same worktree as step 3** — do NOT use `isolation: "worktree"` here. Pass the worktree path (recorded in the step 3 checkpoint) as the working directory so the agent sees the implementer's uncommitted changes. The agent:
1. Writes and runs Vitest unit/integration tests. If they fail, ask the user: "Are the tests wrong, or is the implementation wrong?" Route to the appropriate fixer and re-run until passing.
2. Detects any unimplemented E2E cases in `docs/e2e-tests.md`, implements missing Playwright tests in `apps/e2e/tests/`, then runs `npm exec pnpm test:e2e`. E2E failures also block the pipeline — diagnose and fix before proceeding.
_Checkpoint: record Vitest results (pass/fail counts) and E2E results (pass/fail counts)._

**Step 5 — Docs**
Run the `docs-updater` agent with the full diff of changes. It updates `docs/architecture.md`, `docs/specs/`, `CLAUDE.md` if needed, and inline comments.
_Checkpoint: record which docs files were updated._

**Step 6 — Commit**
Run the `/commit-to-git` skill, passing the mode as context: if `mode: update`, suggest commit type `fix` or `refactor`; if `mode: new`, suggest `feat`. It shows staged files and commit message for confirmation before committing, then offers to push.

After a successful commit:
1. Delete the progress file (`docs/progress/<feature-name>.md`) — it is transient scaffolding and no longer needed.
2. If the implementer ran in a worktree (step 3 recorded a branch name), remove it: `git worktree remove <path> --force` then `git branch -d <branch>`. Only do this after the commit is confirmed — if the commit failed or was skipped, leave the worktree intact so work is not lost.

_Checkpoint: record commit hash, then clean up progress file and worktree._
