Review, stage, and commit the current changes to git.

**Steps:**

1. Run `git diff --stat` and `git status` to identify all changed files.
2. Check the user's intent: $ARGUMENTS
3. Stage only the files related to the change. Avoid `git add .`. Exclude anything that looks unintentional (unexpectedly changed lock files, `.env`, etc.) and flag those to the user.
4. Draft a concise commit message following conventional commits format: `type(scope): description` (e.g. `feat(api): add spaced repetition endpoint`). Types: feat, fix, test, docs, chore, refactor.
5. Show the user the staged files list and commit message. Ask for confirmation before committing.
6. On confirmation: `git commit -m "<message>"`.
7. Ask the user if they want to push to remote. If yes, run `git push`.
