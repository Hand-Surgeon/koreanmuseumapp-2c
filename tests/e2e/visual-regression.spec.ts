import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko');
    await page.waitForLoadState('networkidle');
  });

  test('search autocomplete dropdown visual test', async ({ page }) => {
    // Find and focus search input
    const searchInput = page.locator('input[type="search"]').first();
    await searchInput.focus();
    
    // Type to trigger autocomplete
    await searchInput.type('금', { delay: 100 });
    
    // Wait for dropdown to appear
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    
    // Take screenshot of autocomplete dropdown
    await page.screenshot({ 
      path: 'screenshots/search-autocomplete-dropdown.png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 400,
        height: 600
      }
    });
    
    // Verify dropdown is visible
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();
    
    // Check suggestion items
    const suggestions = page.locator('[role="option"]');
    const count = await suggestions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('blur placeholder transitions visual test', async ({ page }) => {
    // Navigate to artifact detail page
    const artifactLink = page.locator('a[href*="/artifact/"]').first();
    await artifactLink.click();
    
    // Wait for navigation
    await page.waitForURL(/\/artifact\/\d+/);
    
    // Find images with blur placeholders
    const images = page.locator('img[data-nimg]');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Take screenshot during loading
      await page.screenshot({ 
        path: 'screenshots/blur-placeholder-loading.png',
        fullPage: false
      });
      
      // Wait for images to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Take screenshot after loading
      await page.screenshot({ 
        path: 'screenshots/blur-placeholder-loaded.png',
        fullPage: false
      });
    }
  });

  test('virtual scrolling performance visual test', async ({ page }) => {
    // Navigate to archaeology hall which has many artifacts
    await page.goto('/ko/hall/archaeology');
    await page.waitForLoadState('networkidle');
    
    // Check if virtual scrolling is active
    const virtualList = page.locator('[data-testid="virtual-list"]');
    const hasVirtualScrolling = await virtualList.isVisible().catch(() => false);
    
    if (hasVirtualScrolling) {
      // Take initial screenshot
      await page.screenshot({ 
        path: 'screenshots/virtual-scroll-initial.png',
        fullPage: false
      });
      
      // Scroll to middle
      await virtualList.evaluate(el => el.scrollTop = el.scrollHeight / 2);
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'screenshots/virtual-scroll-middle.png',
        fullPage: false
      });
      
      // Scroll to bottom
      await virtualList.evaluate(el => el.scrollTop = el.scrollHeight);
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'screenshots/virtual-scroll-bottom.png',
        fullPage: false
      });
      
      // Verify only visible items are rendered
      const visibleItems = await page.locator('[data-testid="artifact-card"]:visible').count();
      expect(visibleItems).toBeLessThan(20); // Should render limited items
    } else {
      // Regular scrolling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'screenshots/regular-scroll-performance.png',
        fullPage: true
      });
    }
  });

  test('responsive design breakpoints', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/ko');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: `screenshots/responsive-${viewport.name}.png`,
        fullPage: true
      });
    }
  });

  test('dark mode visual test', async ({ page }) => {
    // Check if dark mode is available
    const darkModeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="theme"]');
    
    if (await darkModeToggle.isVisible()) {
      // Take light mode screenshot
      await page.screenshot({ 
        path: 'screenshots/theme-light.png',
        fullPage: true
      });
      
      // Toggle dark mode
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      // Take dark mode screenshot
      await page.screenshot({ 
        path: 'screenshots/theme-dark.png',
        fullPage: true
      });
    }
  });
});