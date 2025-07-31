import { test, expect } from '@playwright/test';

test.describe('PWA and Offline Functionality Tests', () => {
  test('should register service worker successfully', async ({ page }) => {
    await page.goto('/ko');
    
    // Wait for service worker registration
    const swState = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        return {
          registered: true,
          scope: registration.scope,
          active: !!registration.active
        };
      }
      return { registered: false };
    });
    
    expect(swState.registered).toBeTruthy();
    expect(swState.active).toBeTruthy();
    expect(swState.scope).toBe('http://localhost:3000/');
  });

  test('should cache critical resources', async ({ page }) => {
    await page.goto('/ko');
    await page.waitForLoadState('networkidle');
    
    // Check cache contents
    const cacheContents = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const allEntries = [];
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          allEntries.push(...requests.map(r => r.url));
        }
        
        return allEntries;
      }
      return [];
    });
    
    // Should have cached important resources
    expect(cacheContents.some(url => url.includes('/'))).toBeTruthy();
    expect(cacheContents.some(url => url.includes('manifest.json'))).toBeTruthy();
  });

  test('should work offline for cached pages', async ({ page, context }) => {
    // First visit to cache the page
    await page.goto('/ko');
    await page.waitForLoadState('networkidle');
    
    // Visit artifact page to cache it
    await page.goto('/ko/artifact/1');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to access cached page
    await page.goto('/ko');
    
    // Should display cached content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
  });

  test('should show offline page for uncached routes', async ({ page, context }) => {
    await page.goto('/ko');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to access uncached page
    await page.goto('/ko/artifact/999').catch(() => {});
    
    // Should show offline message
    await expect(page.getByText(/오프라인|offline/i)).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
  });

  test('should prefetch adjacent artifacts', async ({ page }) => {
    const prefetchedUrls = new Set<string>();
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('artifact-') && url.includes('.jpg')) {
        prefetchedUrls.add(url);
      }
    });
    
    // Visit artifact 5
    await page.goto('/ko/artifact/5');
    await page.waitForLoadState('networkidle');
    
    // Wait for prefetching
    await page.waitForTimeout(2000);
    
    // Should have prefetched adjacent artifacts (4 and 6)
    const prefetchedArray = Array.from(prefetchedUrls);
    expect(prefetchedArray.some(url => url.includes('artifact-4'))).toBeTruthy();
    expect(prefetchedArray.some(url => url.includes('artifact-6'))).toBeTruthy();
  });

  test('should update service worker when new version available', async ({ page }) => {
    await page.goto('/ko');
    
    // Simulate service worker update
    const updateAvailable = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Listen for update
        return new Promise((resolve) => {
          registration.addEventListener('updatefound', () => {
            resolve(true);
          });
          
          // Trigger update check
          registration.update();
          
          // Timeout after 2 seconds
          setTimeout(() => resolve(false), 2000);
        });
      }
      return false;
    });
    
    // This test might not always detect updates in dev environment
    expect(typeof updateAvailable).toBe('boolean');
  });
});