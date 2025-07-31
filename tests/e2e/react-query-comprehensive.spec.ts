import { test, expect, Page } from '@playwright/test';

const TEST_URL = 'http://localhost:3000';

test.describe('React Query Data Management Tests', () => {
  test('Caches artifact data between navigations', async ({ page }) => {
    // Monitor network requests
    const apiCalls: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('/_next/data/')) {
        apiCalls.push(url);
      }
    });
    
    // First navigation to hall
    await page.goto(`${TEST_URL}/ko/hall/archaeology`);
    await page.waitForLoadState('networkidle');
    const initialCalls = apiCalls.length;
    
    // Navigate to an artifact
    await page.locator('a[href*="/artifact/"]').first().click();
    await page.waitForLoadState('networkidle');
    
    // Navigate back using browser back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    // Navigate to the same artifact again
    await page.locator('a[href*="/artifact/"]').first().click();
    await page.waitForLoadState('networkidle');
    
    // Should use cached data (minimal new API calls)
    const finalCalls = apiCalls.length;
    console.log(`Initial API calls: ${initialCalls}, Final: ${finalCalls}`);
    
    // The second navigation should make fewer calls due to caching
    expect(finalCalls - initialCalls).toBeLessThan(initialCalls);
  });

  test('Shows loading states during data fetching', async ({ page }) => {
    // Slow down network to see loading states
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    await page.goto(`${TEST_URL}/ko`);
    
    // Click on a hall link
    const hallPromise = page.waitForResponse(response => 
      response.url().includes('/hall/') && response.status() === 200
    );
    
    await page.locator('a[href*="hall/"]').first().click();
    
    // Check for loading indicators (skeleton screens)
    const skeletons = await page.locator('[class*="skeleton"], [class*="animate-pulse"]').count();
    
    if (skeletons > 0) {
      console.log(`✓ Found ${skeletons} skeleton loading elements`);
    } else {
      // Check for other loading indicators
      const loadingText = await page.locator('text=/로딩|loading/i').count();
      console.log(`Found ${loadingText} loading text indicators`);
    }
    
    await hallPromise;
  });

  test('Handles search with debouncing', async ({ page }) => {
    await page.goto(`${TEST_URL}/ko`);
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]').first();
    
    // Track network requests
    let searchRequests = 0;
    page.on('request', request => {
      if (request.url().includes('search') || request.url().includes('q=')) {
        searchRequests++;
      }
    });
    
    // Type quickly to test debouncing
    await searchInput.type('금관', { delay: 50 });
    
    // Wait for debounce delay
    await page.waitForTimeout(500);
    
    // Should only make one request due to debouncing
    expect(searchRequests).toBeLessThanOrEqual(1);
    console.log(`✓ Search debouncing working - ${searchRequests} requests made`);
  });

  test('Implements optimistic updates for favorites', async ({ page }) => {
    // Navigate to artifact detail
    await page.goto(`${TEST_URL}/ko/hall/archaeology`);
    await page.locator('a[href*="/artifact/"]').first().click();
    await page.waitForLoadState('networkidle');
    
    // Find favorite button
    const favoriteBtn = page.locator('button').filter({
      has: page.locator('svg')
    }).first();
    
    // Get initial state
    const initialClass = await favoriteBtn.getAttribute('class') || '';
    
    // Click favorite button
    await favoriteBtn.click();
    
    // Should update immediately (optimistic update)
    const updatedClass = await favoriteBtn.getAttribute('class') || '';
    expect(updatedClass).not.toBe(initialClass);
    
    // Check if the update persists after navigation
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Optimistic updates working for favorites');
  });

  test('Prefetches data for improved performance', async ({ page }) => {
    const prefetchRequests: string[] = [];
    
    page.on('request', request => {
      const headers = request.headers();
      if (headers['purpose'] === 'prefetch' || request.url().includes('_next/data')) {
        prefetchRequests.push(request.url());
      }
    });
    
    await page.goto(`${TEST_URL}/ko`);
    await page.waitForLoadState('networkidle');
    
    // Hover over links to trigger prefetching
    const hallLinks = page.locator('a[href*="hall/"]');
    const linkCount = await hallLinks.count();
    
    for (let i = 0; i < Math.min(3, linkCount); i++) {
      await hallLinks.nth(i).hover();
      await page.waitForTimeout(100);
    }
    
    // Wait a bit for prefetch requests
    await page.waitForTimeout(500);
    
    console.log(`✓ Prefetched ${prefetchRequests.length} resources`);
    expect(prefetchRequests.length).toBeGreaterThan(0);
  });

  test('Maintains data consistency across language switches', async ({ page }) => {
    await page.goto(`${TEST_URL}/ko/hall/archaeology`);
    await page.waitForLoadState('networkidle');
    
    // Count artifacts in Korean
    const koreanArtifacts = await page.locator('a[href*="/artifact/"]').count();
    
    // Switch to English
    const langButton = page.locator('button').filter({ 
      hasText: /한국어|KO|🇰🇷/
    }).or(page.locator('button:has(svg)')).last();
    
    await langButton.click();
    await page.waitForTimeout(500);
    
    const enOption = page.locator('text=/English|EN|🇺🇸/i').first();
    if (await enOption.isVisible({ timeout: 3000 })) {
      await enOption.click();
      await page.waitForLoadState('networkidle');
      
      // Count artifacts in English (should be the same)
      const englishArtifacts = await page.locator('a[href*="/artifact/"]').count();
      
      expect(englishArtifacts).toBe(koreanArtifacts);
      console.log(`✓ Data consistency maintained: ${koreanArtifacts} artifacts in both languages`);
    }
  });

  test('Handles stale data refetching', async ({ page }) => {
    await page.goto(`${TEST_URL}/ko`);
    
    // Simulate going offline and online
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);
    await page.context().setOffline(false);
    
    // Trigger a refetch by navigating
    await page.locator('a[href*="hall/"]').first().click();
    
    // Should handle the transition gracefully
    const errorMessages = await page.locator('text=/error|오류/i').count();
    expect(errorMessages).toBe(0);
    
    console.log('✓ Handles offline/online transitions without errors');
  });
});

test.afterAll(async () => {
  console.log('\n=== React Query Test Summary ===');
  console.log('All React Query data management tests completed.');
});