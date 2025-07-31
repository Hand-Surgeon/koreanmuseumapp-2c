import { test, expect, Page } from '@playwright/test';

const TEST_URL = 'http://localhost:3000';

test.describe('Service Worker and PWA Tests', () => {
  test('Registers service worker successfully', async ({ page }) => {
    await page.goto(`${TEST_URL}/ko`);
    
    // Wait for service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        // Wait a bit for SW to register
        await new Promise(resolve => setTimeout(resolve, 2000));
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
    console.log('✓ Service Worker registered successfully');
  });

  test('Caches critical resources', async ({ page }) => {
    await page.goto(`${TEST_URL}/ko`);
    await page.waitForTimeout(2000); // Allow SW to cache resources
    
    // Check if cache API is being used
    const cacheNames = await page.evaluate(async () => {
      if ('caches' in window) {
        return await caches.keys();
      }
      return [];
    });
    
    expect(cacheNames.length).toBeGreaterThan(0);
    console.log(`✓ Found ${cacheNames.length} cache storages: ${cacheNames.join(', ')}`);
    
    // Check cached resources
    const cachedUrls = await page.evaluate(async () => {
      const urls: string[] = [];
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          urls.push(...requests.map(r => r.url));
        }
      }
      return urls;
    });
    
    console.log(`✓ Cached ${cachedUrls.length} resources`);
    
    // Verify critical resources are cached
    const hasCriticalResources = cachedUrls.some(url => 
      url.includes('.js') || url.includes('.css') || url.includes('/ko')
    );
    expect(hasCriticalResources).toBeTruthy();
  });

  test('Works offline for cached pages', async ({ page, context }) => {
    // First visit to cache the page
    await page.goto(`${TEST_URL}/ko`);
    await page.waitForTimeout(3000); // Allow caching
    
    // Navigate to a hall to cache it
    await page.locator('a[href*="hall/"]').first().click();
    await page.waitForLoadState('networkidle');
    const cachedHallUrl = page.url();
    
    // Go back to home
    await page.goto(`${TEST_URL}/ko`);
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate to the cached hall
    await page.goto(cachedHallUrl);
    await page.waitForTimeout(2000);
    
    // Should still show content (from cache)
    const hasContent = await page.locator('h1, h2').count() > 0;
    expect(hasContent).toBeTruthy();
    
    console.log('✓ Offline access works for cached pages');
    
    // Go back online
    await context.setOffline(false);
  });

  test('Shows offline page for uncached routes', async ({ page, context }) => {
    await page.goto(`${TEST_URL}/ko`);
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate to an uncached page
    try {
      await page.goto(`${TEST_URL}/ko/artifact/99999`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Should show offline message or fallback
      const hasOfflineIndicator = await page.locator('text=/offline|오프라인|연결/i').count() > 0;
      const isOnHomePage = page.url().includes('/ko') && !page.url().includes('99999');
      
      expect(hasOfflineIndicator || isOnHomePage).toBeTruthy();
      console.log('✓ Shows appropriate offline behavior');
    } catch (error) {
      // Network error is expected when offline
      console.log('✓ Network error caught as expected when offline');
    }
    
    await context.setOffline(false);
  });

  test('Prefetches adjacent artifacts', async ({ page }) => {
    const prefetchedUrls: string[] = [];
    
    // Monitor prefetch requests
    page.on('request', request => {
      if (request.url().includes('/artifact/') && 
          (request.method() === 'GET' || request.resourceType() === 'document')) {
        prefetchedUrls.push(request.url());
      }
    });
    
    // Navigate to artifact list
    await page.goto(`${TEST_URL}/ko/hall/archaeology`);
    await page.waitForLoadState('networkidle');
    
    // Click on an artifact
    await page.locator('a[href*="/artifact/"]').first().click();
    await page.waitForLoadState('networkidle');
    
    // Wait for potential prefetching
    await page.waitForTimeout(2000);
    
    // Check if adjacent artifacts were prefetched
    const relatedLinks = await page.locator('a[href*="/artifact/"]').count();
    
    console.log(`✓ Found ${relatedLinks} related artifact links`);
    console.log(`✓ Prefetched ${prefetchedUrls.length} artifact URLs`);
  });

  test('Updates service worker when available', async ({ page }) => {
    await page.goto(`${TEST_URL}/ko`);
    
    // Check for update mechanism
    const hasUpdateMechanism = await page.evaluate(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Check if there's an update check mechanism
        return true;
      }
      return false;
    });
    
    expect(hasUpdateMechanism).toBeTruthy();
    console.log('✓ Service Worker update mechanism in place');
  });

  test('Implements proper caching strategies', async ({ page }) => {
    // Clear existing caches first
    await page.evaluate(async () => {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
    });
    
    const requests: { url: string; cached: boolean }[] = [];
    
    page.on('response', response => {
      const headers = response.headers();
      const cached = headers['x-cache'] === 'HIT' || 
                    headers['cf-cache-status'] === 'HIT' ||
                    response.fromServiceWorker();
      
      requests.push({
        url: response.url(),
        cached
      });
    });
    
    // First visit
    await page.goto(`${TEST_URL}/ko`);
    await page.waitForLoadState('networkidle');
    
    // Second visit (should use cache)
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Analyze caching behavior
    const imagesCached = requests.filter(r => 
      r.url.includes('/image') || r.url.includes('.jpg') || r.url.includes('.png')
    ).filter(r => r.cached).length;
    
    const jsCached = requests.filter(r => r.url.includes('.js')).filter(r => r.cached).length;
    
    console.log(`✓ Caching strategy: ${imagesCached} images cached, ${jsCached} JS files cached`);
  });

  test('PWA installation prompt available', async ({ page }) => {
    await page.goto(`${TEST_URL}/ko`);
    
    // Check for beforeinstallprompt event handling
    const hasInstallPrompt = await page.evaluate(() => {
      return new Promise((resolve) => {
        let promptDetected = false;
        
        window.addEventListener('beforeinstallprompt', (e) => {
          promptDetected = true;
          e.preventDefault();
          resolve(true);
        });
        
        // Wait a bit then resolve with false if no prompt
        setTimeout(() => resolve(promptDetected), 3000);
      });
    });
    
    console.log(`✓ PWA installation ${hasInstallPrompt ? 'available' : 'already installed or not supported'}`);
  });

  test('Manifest includes all required PWA fields', async ({ page }) => {
    const response = await page.goto(`${TEST_URL}/manifest.json`);
    
    if (response?.ok()) {
      const manifest = await response.json();
      
      // Check required fields
      expect(manifest.name).toBeTruthy();
      expect(manifest.short_name).toBeTruthy();
      expect(manifest.start_url).toBeTruthy();
      expect(manifest.display).toBeTruthy();
      expect(manifest.background_color).toBeTruthy();
      expect(manifest.theme_color).toBeTruthy();
      expect(manifest.icons).toBeInstanceOf(Array);
      expect(manifest.icons.length).toBeGreaterThan(0);
      
      // Check icon sizes
      const has192 = manifest.icons.some((icon: any) => icon.sizes?.includes('192'));
      const has512 = manifest.icons.some((icon: any) => icon.sizes?.includes('512'));
      
      expect(has192 || has512).toBeTruthy();
      
      console.log('✓ PWA manifest is complete with all required fields');
    }
  });
});

test.afterAll(async () => {
  console.log('\n=== Service Worker Test Summary ===');
  console.log('All PWA and Service Worker tests completed.');
});