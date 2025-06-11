import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/Yuka App/);
    
    // Check if Next.js default content is present (until we implement our own)
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport meta tag for mobile responsiveness
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1');
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    await page.goto('/');
    
    if (isMobile) {
      // Check mobile-specific behavior
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
      
      // Ensure content is not horizontally scrollable
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowInnerWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 1); // +1 for rounding
    }
  });
});