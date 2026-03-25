---
name: run-e2e-tests
description: Run all Playwright E2E tests and report results. Starts the app first if it is not already running.
argument-hint: (none required)
---

1. Check if the app is running by probing `http://localhost:3000/api/lists` and `http://localhost:5173`. Use `curl -s -o /dev/null -w "%{http_code}"` for each. If either returns a non-2xx code or fails to connect, use the `start-app` skill to start the servers before continuing.

2. Run the E2E suite from the repo root:
   ```bash
   cd /d/repos/vocab-practice-app && npm exec pnpm test:e2e
   ```

3. Report the full results: how many tests passed, how many failed, and the failure details (test name + error message) for any failures.
