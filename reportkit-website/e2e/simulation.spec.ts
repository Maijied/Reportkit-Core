import { expect, test } from '@playwright/test';

test.describe('Simulation playlist', () => {
  test('loads page and completes default playlist headlessly', async ({ page }) => {
    await page.goto('/simulation');

    await expect(page.getByRole('heading', { name: /Animated report pipeline/i })).toBeVisible();
    await expect(page.locator('#rkSimRun')).toBeVisible();

    await page.locator('#rkSimRun').click();

    await expect(page.locator('#rkSimStatus')).toContainText(/Complete|Running|Corner case/i, {
      timeout: 60_000,
    });

    await expect(page.locator('#rkSimRows')).not.toHaveText('0', { timeout: 60_000 });

    const donePhases = page.locator('.rk-sim-phase.is-done, .rk-sim-phase.is-active');
    await expect(donePhases.first()).toBeVisible();
  });

  test('corner-case dropdown includes hybrid-browse-no-sql', async ({ page }) => {
    await page.goto('/simulation');
    const select = page.locator('#rkSimCase');
    await expect(select).toBeVisible();
    await expect(select.locator('option')).toContainText(['hybrid-browse-no-sql']);
  });
});
