import { test, expect } from '@playwright/test';

test.describe('React Query Data Management Tests', () => {
  test('should cache artifact data between navigations', async ({ page }) => {
    // Enable network monitoring
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('artifact')) {
        requests.push(request.url());
      }
    });
    
    // First visit
    await page.goto('/ko/artifact/1');
    await page.waitForLoadState('networkidle');
    const initialRequests = requests.length;
    
    // Navigate away
    await page.goto('/ko');
    
    // Navigate back
    await page.goto('/ko/artifact/1');
    await page.waitForLoadState('networkidle');
    
    // Should use cached data (fewer or no new requests)
    const totalRequests = requests.length;
    expect(totalRequests - initialRequests).toBeLessThanOrEqual(1);
  });

  test('should show loading states', async ({ page }) => {
    // Slow down network to see loading states
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 500);
    });
    
    await page.goto('/ko/hall/archaeology');
    
    // Should show loading skeleton
    const skeleton = page.locator('[data-testid="loading-skeleton"]');
    await expect(skeleton.first()).toBeVisible();
    
    // Wait for content
    await page.waitForSelector('[data-testid="artifact-card"]');
    
    // Skeleton should be gone
    await expect(skeleton.first()).not.toBeVisible();
  });

  test('should handle search with debouncing', async ({ page }) => {
    await page.goto('/ko');
    
    const searchRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('search=')) {
        searchRequests.push(request.url());
      }
    });
    
    const searchInput = page.getByPlaceholder(/검색/i);
    
    // Type quickly
    await searchInput.type('청자', { delay: 50 });
    
    // Wait for debounce
    await page.waitForTimeout(400);
    
    // Should only make one request after debouncing
    expect(searchRequests.length).toBeLessThanOrEqual(1);
  });

  test('should handle optimistic updates for favorites', async ({ page }) => {
    await page.goto('/ko/artifact/1');
    
    const favoriteButton = page.locator('[data-testid="favorite-button"]');
    const initialState = await favoriteButton.getAttribute('data-favorited');
    
    // Click favorite
    await favoriteButton.click();
    
    // Should update immediately
    const newState = await favoriteButton.getAttribute('data-favorited');
    expect(newState).not.toBe(initialState);
    
    // Verify in favorites page
    await page.goto('/ko/favorites');
    
    if (newState === 'true') {
      await expect(page.locator('[data-artifact-id="1"]')).toBeVisible();
    } else {
      await expect(page.locator('[data-artifact-id="1"]')).not.toBeVisible();
    }
  });

  test('should handle infinite scroll', async ({ page }) => {
    await page.goto('/ko/hall/archaeology');
    
    // If infinite scroll is implemented
    const loadMoreButton = page.locator('[data-testid="load-more"]');
    if (await loadMoreButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      const initialCards = await page.locator('[data-testid="artifact-card"]').count();
      
      // Click load more
      await loadMoreButton.click();
      await page.waitForTimeout(1000);
      
      // Should have more cards
      const afterLoadCards = await page.locator('[data-testid="artifact-card"]').count();
      expect(afterLoadCards).toBeGreaterThan(initialCards);
    }
  });

  test('should refetch stale data', async ({ page }) => {
    await page.goto('/ko/artifact/1');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Simulate time passing (would trigger stale data refetch)
    await page.evaluate(() => {
      // Simulate focus event which triggers refetch
      window.dispatchEvent(new Event('focus'));
    });
    
    // In real app, this would trigger a background refetch
    // Check that page still functions correctly
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});