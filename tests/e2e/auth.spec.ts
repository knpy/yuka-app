import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login button when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Check if login button is present
    const loginButton = page.getByRole('button', { name: /googleでログイン/i });
    await expect(loginButton).toBeVisible();
    
    // Check if login button is disabled (since Cognito is not configured yet)
    await expect(loginButton).toBeDisabled();
  });

  test('should have proper button styling', async ({ page }) => {
    await page.goto('/');
    
    const loginButton = page.getByRole('button', { name: /googleでログイン/i });
    await expect(loginButton).toBeVisible();
    
    // Check if button has expected CSS classes
    await expect(loginButton).toHaveClass(/bg-blue-600/);
    await expect(loginButton).toHaveClass(/text-white/);
    await expect(loginButton).toHaveClass(/px-4/);
    await expect(loginButton).toHaveClass(/py-2/);
    await expect(loginButton).toHaveClass(/rounded/);
  });

  test.skip('should redirect to Google OAuth when login button clicked', async ({ page }) => {
    // This test is skipped until Cognito is properly configured
    // Will be enabled after AWS Cognito setup is complete
    
    await page.goto('/');
    
    const loginButton = page.getByRole('button', { name: /googleでログイン/i });
    await expect(loginButton).toBeVisible();
    
    // Click login button and expect redirect to Google OAuth
    await loginButton.click();
    
    // Wait for navigation to OAuth provider
    await page.waitForURL(/accounts\.google\.com/);
    expect(page.url()).toContain('accounts.google.com');
  });

  test.skip('should handle successful authentication', async ({ page }) => {
    // This test is skipped until Cognito is properly configured
    // Will be enabled after AWS Cognito setup is complete
    
    // Mock successful authentication state
    // This will test the logout button functionality
    
    await page.goto('/');
    
    // After successful auth, should show logout button
    const logoutButton = page.getByRole('button', { name: /ログアウト/i });
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toHaveClass(/bg-red-600/);
  });
});