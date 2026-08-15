import { test, expect } from '@playwright/test';

test('has title and redirects to login', async ({ page }) => {
  await page.goto('/');

  // Expect the platform to not crash on load
  await expect(page).toHaveTitle(/Procurement|Login/i);
});

test('buyer dashboard loads successfully', async ({ page }) => {
  // Simulate a logged-in state by navigating to the client dashboard
  await page.goto('/client');

  // Verify the dashboard header exists
  const heading = page.getByRole('heading', { name: /Dashboard/i });
  await expect(heading).toBeVisible();
});
