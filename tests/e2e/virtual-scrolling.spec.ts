import { test, expect } from '@playwright/test';

test.describe('Virtual Scrolling Performance Tests', () => {
  test('should render only visible items in viewport', async ({ page }) => {
    // Navigate to a hall with many artifacts
    await page.goto('/ko/hall/archaeology');
    
    // Wait for virtual list to initialize
    await page.waitForSelector('[data-testid="virtual-list"]');
    
    // Count initially rendered items
    const initialItems = await page.locator('[data-testid="artifact-card"]:visible').count();
    
    // Should render limited items (not all)
    expect(initialItems).toBeLessThan(15);
    expect(initialItems).toBeGreaterThan(0);
  });

  test('should dynamically render items on scroll', async ({ page }) => {
    await page.goto('/ko/hall/archaeology');
    
    const virtualList = page.locator('[data-testid="virtual-list"]');
    await expect(virtualList).toBeVisible();
    
    // Get initial items
    const initialItems = await page.locator('[data-testid="artifact-card"]').allTextContents();
    
    // Scroll down
    await virtualList.evaluate(el => el.scrollTop = el.scrollHeight / 2);
    await page.waitForTimeout(500); // Wait for render
    
    // Get items after scroll
    const afterScrollItems = await page.locator('[data-testid="artifact-card"]').allTextContents();
    
    // Items should be different
    expect(afterScrollItems).not.toEqual(initialItems);
  });

  test('should maintain scroll position on navigation back', async ({ page }) => {
    await page.goto('/ko/hall/archaeology');
    
    const virtualList = page.locator('[data-testid="virtual-list"]');
    
    // Scroll to middle
    await virtualList.evaluate(el => el.scrollTop = 1000);
    await page.waitForTimeout(300);
    
    // Click on an artifact
    await page.locator('[data-testid="artifact-card"]').first().click();
    await page.waitForURL(/\/artifact\/\d+/);
    
    // Go back
    await page.goBack();
    
    // Check scroll position is maintained
    const scrollPosition = await virtualList.evaluate(el => el.scrollTop);
    expect(scrollPosition).toBeGreaterThan(900);
    expect(scrollPosition).toBeLessThan(1100);
  });

  test('should handle rapid scrolling smoothly', async ({ page }) => {
    await page.goto('/ko/hall/archaeology');
    
    const virtualList = page.locator('[data-testid="virtual-list"]');
    
    // Perform rapid scrolling
    for (let i = 0; i < 5; i++) {
      await virtualList.evaluate(el => el.scrollTop += 500);
      await page.waitForTimeout(100);
    }
    
    // Should still have rendered items
    const visibleItems = await page.locator('[data-testid="artifact-card"]:visible').count();
    expect(visibleItems).toBeGreaterThan(0);
    
    // No errors should occur
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    
    await page.waitForTimeout(500);
    expect(consoleErrors).toHaveLength(0);
  });
});