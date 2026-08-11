import { expect, test } from '@playwright/test';

test.describe('Simulation page', () => {
  test('landing animation and interactive lab load', async ({ page }) => {
    await page.goto('/simulation');

    await expect(page.getByRole('heading', { name: /How ReportKit runs end-to-end/i })).toBeVisible();
    await expect(page.locator('[data-prepare-sequence]')).toBeVisible();
    await expect(page.locator('[data-flow-title]')).not.toHaveText('Starting…', { timeout: 30_000 });

    await expect(page.getByRole('heading', { name: /Animated report playlist/i })).toBeVisible();
    await expect(page.locator('#rkSimRun')).toBeVisible();
  });

  test('completes default playlist headlessly', async ({ page }) => {
    await page.goto('/simulation');
    await page.locator('#rkSimRun').click();

    await expect(page.locator('#rkSimStatus')).toContainText(/Complete|Running|Corner case/i, {
      timeout: 60_000,
    });

    await expect(page.locator('#rkSimRows')).not.toHaveText('0', { timeout: 60_000 });
  });

  test('corner-case dropdown includes hybrid-browse-no-sql', async ({ page }) => {
    await page.goto('/simulation');
    const select = page.locator('#rkSimCase');
    await expect(select).toBeVisible();
    await expect(select.locator('option')).toContainText(['hybrid-browse-no-sql']);
  });
});

test.describe('Landing hero animation', () => {
  test('home page mounts prepare sequence', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-prepare-sequence]')).toBeVisible();
    await expect(page.getByRole('link', { name: /Watch pipeline simulation/i })).toBeVisible();
  });
});
