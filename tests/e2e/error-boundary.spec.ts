import { test, expect } from '@playwright/test';

test.describe('Error Boundary Tests', () => {
  test('should display error boundary when component crashes', async ({ page }) => {
    // Navigate to a page that will trigger an error
    await page.goto('/ko/artifact/99999999'); // Non-existent artifact
    
    // Check for error message
    const errorMessage = page.locator('text=/문제가 발생했습니다|Something went wrong|错误|エラー/i');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // Check for home button
    const homeButton = page.locator('a[href="/"], button:has-text("홈으로")');
    await expect(homeButton).toBeVisible();
    
    // Check for refresh button
    const refreshButton = page.locator('button:has-text("새로고침"), button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
  });
  
  test('should recover from error when clicking home button', async ({ page }) => {
    // Trigger error
    await page.goto('/ko/artifact/99999999');
    
    // Wait for error boundary
    await page.waitForSelector('text=/문제가 발생했습니다|Something went wrong/i');
    
    // Click home button
    const homeButton = page.locator('a[href="/"]').first();
    await homeButton.click();
    
    // Should be back on home page
    await expect(page).toHaveURL(/\/ko|\/en|\/zh|\/ja|\/th/);
    await expect(page.locator('h1')).toBeVisible();
  });
  
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate
    await page.goto('/ko', { waitUntil: 'domcontentloaded' }).catch(() => {});
    
    // Should show offline message or error
    const offlineMessage = page.locator('text=/offline|오프라인|연결/i');
    const errorMessage = page.locator('text=/error|오류|문제/i');
    
    // At least one should be visible
    const hasOffline = await offlineMessage.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    expect(hasOffline || hasError).toBeTruthy();
    
    // Go back online
    await context.setOffline(false);
  });
  
  test('should handle image loading errors', async ({ page }) => {
    // Navigate to page with images
    await page.goto('/ko');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalHeight === 0).length;
    });
    
    // Should have fallbacks for broken images
    if (brokenImages > 0) {
      // Check for placeholder images
      const placeholders = await page.locator('img[src*="placeholder"]').count();
      expect(placeholders).toBeGreaterThan(0);
    }
  });
});