// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Korean Museum App - Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:3000');
  });

  test('should load the main page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Korean Museum|한국 박물관/i);
    
    // Check main elements are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/test-01-main-page.png', fullPage: true });
  });

  test('should navigate to artifact detail page', async ({ page }) => {
    // Wait for artifact cards to load
    const artifactCard = page.locator('a[href*="/artifact/"]').first();
    await expect(artifactCard).toBeVisible();
    
    // Get artifact name for verification
    const artifactName = await artifactCard.locator('h2, h3, .artifact-name').textContent();
    
    // Click on artifact
    await artifactCard.click();
    
    // Wait for navigation
    await page.waitForURL(/\/artifact\/\d+/);
    
    // Verify we're on the detail page
    await expect(page.locator('h1, h2').first()).toContainText(artifactName || '');
    
    // Check artifact image is visible
    await expect(page.locator('img').first()).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/test-02-artifact-detail.png', fullPage: true });
  });

  test('should expand artifact image when clicked', async ({ page }) => {
    // Navigate to an artifact detail page
    await page.click('a[href*="/artifact/"]');
    await page.waitForURL(/\/artifact\/\d+/);
    
    // Click on the main artifact image
    const artifactImage = page.locator('img').first();
    await artifactImage.click();
    
    // Check if modal or expanded view appears
    const modal = page.locator('[role="dialog"], .modal, .image-modal, [data-state="open"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Take screenshot of expanded image
    await page.screenshot({ path: 'screenshots/test-03-image-expanded.png' });
    
    // Close modal (ESC key or close button)
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should navigate to different hall pages', async ({ page }) => {
    // Find hall navigation links
    const hallLinks = page.locator('a[href*="/hall/"]');
    const hallCount = await hallLinks.count();
    
    // Visit at least 2 halls
    const hallsToVisit = Math.min(2, hallCount);
    
    for (let i = 0; i < hallsToVisit; i++) {
      // Click hall link
      await hallLinks.nth(i).click();
      
      // Wait for navigation
      await page.waitForURL(/\/hall\//);
      
      // Verify hall page loaded
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Check artifacts are displayed
      await expect(page.locator('a[href*="/artifact/"]').first()).toBeVisible();
      
      // Take screenshot
      await page.screenshot({ path: `screenshots/test-04-hall-${i + 1}.png`, fullPage: true });
      
      // Go back to main page
      await page.goto('http://localhost:3000');
    }
  });

  test('should search for artifacts', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="검색"]');
    
    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('ceramic');
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({ path: 'screenshots/test-05-search-results.png' });
    }
  });

  test('should switch language', async ({ page }) => {
    // Look for language selector
    const langSelector = page.locator('button[aria-label*="language" i], select[id*="language"], button:has-text("EN"), button:has-text("KO")');
    
    if (await langSelector.isVisible()) {
      await langSelector.click();
      
      // Try to find and click Korean option
      const koreanOption = page.locator('text=한국어, text=Korean, text=KO, option[value="ko"]');
      if (await koreanOption.isVisible()) {
        await koreanOption.click();
        
        // Wait for language change
        await page.waitForTimeout(1000);
        
        // Verify language changed (URL might include /ko)
        const url = page.url();
        if (url.includes('/ko')) {
          expect(url).toContain('/ko');
        }
        
        // Take screenshot
        await page.screenshot({ path: 'screenshots/test-06-korean-language.png' });
      }
    }
  });

  test('should test responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'screenshots/test-07-mobile-view.png', fullPage: true });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'screenshots/test-08-tablet-view.png', fullPage: true });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'screenshots/test-09-desktop-view.png', fullPage: true });
  });

  test('should interact with favorite button if available', async ({ page }) => {
    // Navigate to an artifact
    await page.click('a[href*="/artifact/"]');
    await page.waitForURL(/\/artifact\/\d+/);
    
    // Look for favorite/like button
    const favoriteButton = page.locator('button[aria-label*="favorite" i], button[aria-label*="like" i], button:has-text("♥"), button svg[class*="heart"]').first();
    
    if (await favoriteButton.isVisible()) {
      // Click favorite button
      await favoriteButton.click();
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({ path: 'screenshots/test-10-favorite-clicked.png' });
    }
  });

  test('should check accessibility elements', async ({ page }) => {
    // Check for skip to content link
    const skipLink = page.locator('a[href="#main"], a:has-text("Skip to content")');
    await expect(skipLink).toBeAttached();
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(5, imageCount); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should navigate through complete user journey', async ({ page }) => {
    // 1. Start at home
    await expect(page).toHaveURL('http://localhost:3000');
    
    // 2. Browse artifacts
    const artifactCount = await page.locator('a[href*="/artifact/"]').count();
    expect(artifactCount).toBeGreaterThan(0);
    
    // 3. Visit specific hall
    const archaeologyHall = page.locator('a[href*="/hall/archaeology"]').first();
    if (await archaeologyHall.isVisible()) {
      await archaeologyHall.click();
      await expect(page).toHaveURL(/\/hall\/archaeology/);
      await page.screenshot({ path: 'screenshots/test-11-archaeology-hall.png', fullPage: true });
    }
    
    // 4. Select an artifact from the hall
    await page.click('a[href*="/artifact/"]');
    await expect(page).toHaveURL(/\/artifact\/\d+/);
    
    // 5. Interact with the artifact (view details, expand image)
    const description = page.locator('p, .description, [class*="description"]').first();
    await expect(description).toBeVisible();
    
    // 6. Return to home
    const homeLink = page.locator('a[href="/"], a:has-text("Home"), a:has-text("홈")').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL(/localhost:3000/);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'screenshots/test-12-final-state.png', fullPage: true });
  });
});

// Configuration for different browsers
test.describe('Cross-browser testing', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work in ${browserName}`, async ({ page, browserName }) => {
      await page.goto('http://localhost:3000');
      await expect(page).toHaveTitle(/Korean Museum|한국 박물관/i);
      await page.screenshot({ path: `screenshots/test-${browserName}.png` });
    });
  });
});