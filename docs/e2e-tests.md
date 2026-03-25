# E2E Test Cases

User-defined end-to-end test scenarios. Each case is implemented as a Playwright test in `apps/e2e/tests/`.

Add new cases here, then run `/implement-e2e-tests` to generate Playwright tests for any unimplemented cases.

## Format

Each test case must have:
- **ID**: `TC-NNN` (sequential, never reuse an ID)
- **Title**: one line describing the scenario
- **Precondition**: app state required before the test runs
- **Steps**: numbered user actions
- **Expected**: observable outcome that confirms success

The corresponding Playwright test must begin with a `// TC-NNN` comment so gap detection works.

---

## TC-001: Clicking a list navigates to its word view

**Precondition:** At least one word list exists in the app.
**Steps:**
1. Open the app.
2. Navigate to the lists view.
3. Click on a list.
**Expected:** The word list view for that list is shown — the list name is visible and only words belonging to that list are displayed.
