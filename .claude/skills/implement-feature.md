Implement a feature end-to-end using the following pipeline. The feature is: $ARGUMENTS

## Resume detection

Before starting, check if `docs/progress/<feature-name>.md` exists (derive the feature name as a kebab-case slug from $ARGUMENTS). If it does, read it and skip all steps already marked `completed` — resume from the first step that is not completed.

If no progress file exists, create one at `docs/progress/<feature-name>.md` with all steps marked `pending` before starting step 1.

## Checkpointing

After each step completes, update the progress file — mark the step `completed` and record its key output (spec file path, architect plan file path, worktree branch name, test results summary, etc.). This allows the pipeline to resume after a session interruption.

## Pipeline

Run steps sequentially. Each agent receives the previous step's output as context.

**Step 1 — Spec**
Run the `spec-definer` agent with the feature description. It checks `docs/specs/` for an existing spec, asks clarifying questions, then writes or updates the spec file. Do not proceed until the spec is written and the user confirms they are happy with it.
_Checkpoint: record spec file path._

**Step 2 — Architect**
Run the `feature-architect` agent with the feature description and the spec file from step 1. Capture the full implementation plan.
_Checkpoint: record a one-paragraph summary of the plan._

**Step 3 — Implementer**
Run the `feature-implementer` agent in `isolation: "worktree"` with the architect's plan. It writes all code but does not commit.
_Checkpoint: record the worktree branch name and list of files changed._

**Step 4 — Tests**
Run the `test-engineer` agent with the implemented code. It writes and runs tests. If tests fail, surface the failing tests and the relevant code diff to the user and ask: "Are the tests wrong, or is the implementation wrong?" Route to the appropriate fixer (test-engineer or feature-implementer) and re-run. Repeat until tests pass or the user decides to abort.
_Checkpoint: record test results summary (pass/fail counts)._

**Step 5 — Docs**
Run the `docs-updater` agent with the full diff of changes. It updates `docs/architecture.md`, `docs/specs/`, `CLAUDE.md` if needed, and inline comments.
_Checkpoint: record which docs files were updated._

**Step 6 — Commit**
Run the `/commit-to-git` skill. It shows staged files and commit message for confirmation before committing, then offers to push.
_Checkpoint: record commit hash. Mark pipeline `completed` and delete the progress file._
