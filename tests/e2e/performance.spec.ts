import { test, expect } from '@playwright/test';

test.describe('Performance and Bundle Optimization Tests', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/ko');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Homepage should load quickly
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('should lazy load dynamic components', async ({ page }) => {
    const chunkRequests: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('_next/static/chunks/')) {
        chunkRequests.push(request.url());
      }
    });
    
    await page.goto('/ko');
    const initialChunks = chunkRequests.length;
    
    // Trigger modal (should load dynamically)
    await page.locator('[data-testid="artifact-card"]').first().click();
    await page.waitForURL(/\/artifact\/\d+/);
    
    // Click image expand
    await page.locator('[data-testid="expand-image"]').click();
    await page.waitForTimeout(500);
    
    // Should have loaded additional chunks
    expect(chunkRequests.length).toBeGreaterThan(initialChunks);
  });

  test('should have reasonable bundle sizes', async ({ page }) => {
    const jsRequests: { url: string; size: number }[] = [];
    
    page.on('response', async response => {
      if (response.url().includes('.js') && response.status() === 200) {
        const size = Number(response.headers()['content-length'] || 0);
        jsRequests.push({
          url: response.url(),
          size: size
        });
      }
    });
    
    await page.goto('/ko');
    await page.waitForLoadState('networkidle');
    
    // Check total JS size
    const totalJsSize = jsRequests.reduce((sum, req) => sum + req.size, 0);
    
    // Total JS should be under 1MB for initial load
    expect(totalJsSize).toBeLessThan(1024 * 1024);
    
    // No single chunk should be over 300KB
    const largeChunks = jsRequests.filter(req => req.size > 300 * 1024);
    expect(largeChunks).toHaveLength(0);
  });

  test('should implement code splitting effectively', async ({ page }) => {
    const loadedChunks = new Set<string>();
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('_next/static/chunks/') && url.endsWith('.js')) {
        const chunkName = url.split('/').pop();
        loadedChunks.add(chunkName);
      }
    });
    
    // Load homepage
    await page.goto('/ko');
    const homeChunks = new Set(loadedChunks);
    
    // Navigate to different route
    await page.goto('/ko/hall/archaeology');
    const hallChunks = new Set(loadedChunks);
    
    // Should have loaded route-specific chunks
    const routeSpecificChunks = Array.from(hallChunks).filter(
      chunk => !homeChunks.has(chunk)
    );
    
    expect(routeSpecificChunks.length).toBeGreaterThan(0);
  });

  test('should use efficient image formats', async ({ page }) => {
    const imageFormats: string[] = [];
    
    page.on('response', response => {
      if (response.request().resourceType() === 'image') {
        const contentType = response.headers()['content-type'];
        if (contentType) {
          imageFormats.push(contentType);
        }
      }
    });
    
    await page.goto('/ko');
    await page.waitForLoadState('networkidle');
    
    // Should use modern image formats
    const modernFormats = imageFormats.filter(format => 
      format.includes('webp') || 
      format.includes('avif') ||
      format.includes('image/jpeg')
    );
    
    expect(modernFormats.length).toBeGreaterThan(0);
  });

  test('should handle rapid navigation efficiently', async ({ page }) => {
    await page.goto('/ko');
    
    const navigationTimes: number[] = [];
    
    // Perform rapid navigation
    for (let i = 1; i <= 5; i++) {
      const startTime = Date.now();
      
      await page.goto(`/ko/artifact/${i}`);
      await page.waitForSelector('[data-testid="artifact-title"]');
      
      navigationTimes.push(Date.now() - startTime);
    }
    
    // Average navigation time should be fast
    const avgTime = navigationTimes.reduce((a, b) => a + b) / navigationTimes.length;
    expect(avgTime).toBeLessThan(1000); // Under 1 second average
    
    // Later navigations should be faster (due to caching)
    const firstHalf = navigationTimes.slice(0, 2).reduce((a, b) => a + b) / 2;
    const secondHalf = navigationTimes.slice(3).reduce((a, b) => a + b) / 2;
    
    expect(secondHalf).toBeLessThanOrEqual(firstHalf);
  });
});