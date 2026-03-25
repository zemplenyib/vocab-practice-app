// TC-001
import { test, expect } from '@playwright/test';

test.describe('TC-001: Clicking a list navigates to its word view', () => {
  test.beforeEach(async ({ page }) => {
    // Create a list via the API so we have a known list to click
    await page.goto('/');

    const listName = `E2E-TC001-${Date.now()}`;
    const response = await page.request.post('http://localhost:3000/api/lists', {
      data: { name: listName },
    });
    expect(response.ok()).toBeTruthy();
    const list = await response.json() as { id: number; name: string };

    // Store for use in the test
    (page as any)._tc001ListId = list.id;
    (page as any)._tc001ListName = list.name;
  });

  test.afterEach(async ({ page }) => {
    // Clean up the list created during this test
    const id = (page as any)._tc001ListId;
    if (id) {
      await page.request.delete(`http://localhost:3000/api/lists/${id}`).catch(() => {});
    }
  });

  test('clicking a list row navigates to the list detail view showing its name', async ({ page }) => {
    const listName: string = (page as any)._tc001ListName;

    // Navigate to the lists view
    await page.goto('/lists');
    await page.waitForLoadState('networkidle');

    // The list row should be visible
    const listLink = page.getByRole('link', { name: listName });
    await expect(listLink).toBeVisible();

    // Click on the list
    await listLink.click();

    // Verify we've navigated to the list detail view
    await page.waitForLoadState('networkidle');

    // The list name should be visible as the page heading
    const heading = page.getByRole('heading', { name: listName });
    await expect(heading).toBeVisible();

    // The URL should contain the list id
    const listId = (page as any)._tc001ListId;
    await expect(page).toHaveURL(new RegExp(`/lists/${listId}`));
  });
});
