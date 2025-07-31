import { test, expect } from '@playwright/test';

test.describe('Korean Museum App - Core Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ko');
  });

  test('should load homepage with all essential elements', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: /국립중앙박물관/i })).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check hall cards
    const hallCards = page.locator('[data-testid="hall-card"]');
    await expect(hallCards).toHaveCount(5);
    
    // Check search functionality
    await expect(page.getByPlaceholder(/검색/i)).toBeVisible();
  });

  test('should navigate between languages', async ({ page }) => {
    // Click language selector
    await page.getByRole('button', { name: /한국어/i }).click();
    
    // Select English
    await page.getByRole('menuitem', { name: /English/i }).click();
    
    // Verify URL changed
    await expect(page).toHaveURL('/en');
    
    // Verify content changed
    await expect(page.getByRole('heading', { name: /National Museum of Korea/i })).toBeVisible();
  });

  test('should search for artifacts', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/검색/i);
    
    // Type search query
    await searchInput.fill('청자');
    
    // Wait for search results
    await page.waitForResponse(response => 
      response.url().includes('/api/artifacts') || response.status() === 200
    );
    
    // Check results appear
    const results = page.locator('[data-testid="artifact-card"]');
    await expect(results.first()).toBeVisible();
  });
});

test.describe('Virtual Scrolling', () => {
  test('should implement virtual scrolling for large artifact lists', async ({ page }) => {
    // Navigate to archaeology hall (has many artifacts)
    await page.goto('/ko/hall/archaeology');
    
    // Check virtual scrolling container exists
    const virtualContainer = page.locator('[data-testid="virtual-list"]');
    await expect(virtualContainer).toBeVisible();
    
    // Scroll down
    await virtualContainer.evaluate(node => node.scrollTop = 1000);
    
    // Check that new items are rendered
    await page.waitForTimeout(500); // Wait for virtual scrolling to update
    
    // Verify performance by checking rendered items count
    const renderedItems = await page.locator('[data-testid="artifact-card"]:visible').count();
    expect(renderedItems).toBeLessThan(20); // Virtual scrolling should limit rendered items
  });
});

test.describe('Image CDN Integration', () => {
  test('should load images from CDN with proper optimization', async ({ page }) => {
    await page.goto('/ko/artifact/1');
    
    // Intercept image requests
    const imageRequests: string[] = [];
    page.on('request', request => {
      if (request.resourceType() === 'image') {
        imageRequests.push(request.url());
      }
    });
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check if images use CDN URLs or optimized formats
    const optimizedImages = imageRequests.filter(url => 
      url.includes('cloudinary') || 
      url.includes('imgix') || 
      url.includes('_next/image') ||
      url.includes('w=') || 
      url.includes('q=')
    );
    
    expect(optimizedImages.length).toBeGreaterThan(0);
  });

  test('should support multiple image variants', async ({ page }) => {
    await page.goto('/ko/artifact/1');
    
    // Check thumbnail images
    const thumbnails = page.locator('[data-testid="image-thumbnail"]');
    await expect(thumbnails).toHaveCount(4); // main, side, detail, closeup
    
    // Click different thumbnails
    await thumbnails.nth(1).click();
    await page.waitForTimeout(300);
    
    // Verify main image changed
    const mainImage = page.locator('[data-testid="main-image"]');
    const imageSrc = await mainImage.getAttribute('src');
    expect(imageSrc).toContain('side');
  });
});

test.describe('Service Worker & PWA', () => {
  test('should register service worker', async ({ page }) => {
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
  });

  test('should show PWA install prompt', async ({ page }) => {
    // Wait for PWA prompt (might not show if already installed)
    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');
    
    // If prompt appears, test it
    if (await installPrompt.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check install button
      await expect(installPrompt.getByRole('button', { name: /설치/i })).toBeVisible();
      
      // Dismiss prompt
      await installPrompt.getByRole('button', { name: /나중에/i }).click();
      await expect(installPrompt).not.toBeVisible();
    }
  });

  test('should prefetch adjacent artifacts', async ({ page }) => {
    await page.goto('/ko/artifact/5');
    
    // Monitor network requests
    const prefetchedUrls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('artifact-') && request.url().includes('.jpg')) {
        prefetchedUrls.push(request.url());
      }
    });
    
    // Wait for prefetching
    await page.waitForTimeout(2000);
    
    // Check if adjacent artifacts were prefetched
    const adjacentPrefetched = prefetchedUrls.some(url => 
      url.includes('artifact-4') || url.includes('artifact-6')
    );
    
    expect(adjacentPrefetched).toBeTruthy();
  });
});

test.describe('React Query Integration', () => {
  test('should cache artifact data', async ({ page }) => {
    // First visit
    await page.goto('/ko/artifact/1');
    await page.waitForLoadState('networkidle');
    
    // Navigate away and back
    await page.goto('/ko');
    await page.goto('/ko/artifact/1');
    
    // Should load faster due to cache
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="artifact-title"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(500); // Should be fast due to cache
  });

  test('should handle favorites with optimistic updates', async ({ page }) => {
    await page.goto('/ko/artifact/1');
    
    const favoriteButton = page.getByRole('button', { name: /좋아요|favorite/i });
    
    // Click favorite
    await favoriteButton.click();
    
    // Should update immediately (optimistic update)
    await expect(favoriteButton).toHaveAttribute('data-favorited', 'true');
    
    // Navigate to favorites page
    await page.goto('/ko/favorites');
    
    // Should see the favorited item
    await expect(page.locator('[data-artifact-id="1"]')).toBeVisible();
  });
});

test.describe('Performance Optimizations', () => {
  test('should lazy load heavy components', async ({ page }) => {
    await page.goto('/ko');
    
    // Check that modal is not loaded initially
    const modalScript = await page.evaluate(() => {
      return Array.from(document.scripts).some(script => 
        script.src.includes('image-modal')
      );
    });
    
    expect(modalScript).toBeFalsy();
    
    // Click on artifact to trigger modal
    await page.locator('[data-testid="artifact-card"]').first().click();
    await page.waitForLoadState('networkidle');
    
    // Click expand image
    await page.getByRole('button', { name: /확대|zoom/i }).click();
    
    // Now modal should be loaded
    await expect(page.locator('[data-testid="image-modal"]')).toBeVisible();
  });

  test('should implement hover prefetching', async ({ page }) => {
    await page.goto('/ko');
    
    const prefetchRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('artifact-') && request.method() === 'GET') {
        prefetchRequests.push(request.url());
      }
    });
    
    // Hover over artifact card
    const artifactCard = page.locator('[data-testid="artifact-card"]').first();
    await artifactCard.hover();
    
    // Wait for prefetch
    await page.waitForTimeout(500);
    
    // Should have triggered prefetch
    expect(prefetchRequests.length).toBeGreaterThan(0);
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/ko');
    
    // Check skip to content link
    const skipLink = page.getByRole('link', { name: /본문으로 건너뛰기/i });
    await expect(skipLink).toBeVisible({ visible: false }); // Hidden but available
    
    // Check landmarks
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    
    // Check image alt texts
    const images = page.locator('img[alt]');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/ko');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focused element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Navigate with arrow keys in gallery
    await page.goto('/ko/hall/archaeology');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Select first artifact
    
    await expect(page).toHaveURL(/\/artifact\/\d+/);
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/ko/artifact/999999');
    
    // Should show 404 page
    await expect(page.getByText(/찾을 수 없|not found/i)).toBeVisible();
  });

  test('should work offline with service worker', async ({ page, context }) => {
    // First visit to cache resources
    await page.goto('/ko');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate
    await page.goto('/ko');
    
    // Should still show content (from cache)
    await expect(page.getByRole('heading', { name: /국립중앙박물관/i })).toBeVisible();
    
    // Restore online
    await context.setOffline(false);
  });
});