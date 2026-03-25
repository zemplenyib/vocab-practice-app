---
name: implement-e2e-tests
description: Detect unimplemented E2E test cases in docs/e2e-tests.md and implement them as Playwright tests in apps/e2e/tests/.
argument-hint: (none required)
---

1. Read `docs/e2e-tests.md` and extract all test case IDs (format: `TC-NNN`).
2. Search `apps/e2e/tests/` for files containing `// TC-NNN` comments. Any ID with no matching comment is unimplemented.
3. If all cases are implemented, report "All E2E test cases are implemented." and stop.
4. Report which cases are unimplemented (ID + title).
5. Run the `test-engineer` agent with:
   - The full text of each unimplemented test case from `docs/e2e-tests.md`
   - The Playwright config at `apps/e2e/playwright.config.ts` for context
   - Instruction to write one Playwright `test()` per case in `apps/e2e/tests/`, each file beginning with a `// TC-NNN` comment
   - Instruction to run `npm exec pnpm test:e2e` from the repo root after writing, and report results
