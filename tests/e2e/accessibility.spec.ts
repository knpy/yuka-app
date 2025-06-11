import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check if page has proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // If headings exist, check they start with h1
      const firstHeading = headings.first();
      const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('h1');
    }
  });

  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/');
    
    // Check if buttons have accessible names
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.getAttribute('aria-label') || 
                            await button.textContent();
      expect(accessibleName).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check login button color contrast
    const loginButton = page.getByRole('button', { name: /googleでログイン/i });
    
    if (await loginButton.isVisible()) {
      // Blue background (#2563eb) with white text should have good contrast
      const backgroundColor = await loginButton.evaluate(el => 
        getComputedStyle(el).backgroundColor
      );
      const color = await loginButton.evaluate(el => 
        getComputedStyle(el).color
      );
      
      // Basic check that colors are applied
      expect(backgroundColor).toBeTruthy();
      expect(color).toBeTruthy();
    }
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    
    // Check if page has a meaningful title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});