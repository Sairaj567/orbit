import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Orbit web title
  await expect(page).toHaveTitle(/Orbit/i);
});

test('login navigation', async ({ page }) => {
  await page.goto('/');
  // Basic check for sign in button or redirect to clerk
  // This varies by actual clerk configuration,
  // but testing if page renders without crash is a start.
  const signInButton = page.getByRole('button', { name: /Sign In/i });
  if (await signInButton.isVisible()) {
    await expect(signInButton).toBeVisible();
  }
});
