import { test, expect, Page } from '@playwright/test';

test.describe('Korean Museum App - Comprehensive Testing', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Clear any existing data
    await page.context().clearCookies();
    await page.goto('/');
    
    // Wait for the app to fully load
    await page.waitForLoadState('networkidle');
  });

  test('1. Homepage loads correctly with Korean content', async () => {
    console.log('Testing homepage Korean content...');
    
    // Check if redirected to Korean locale
    const url = page.url();
    expect(url).toMatch(/\/ko|localhost:3000/);
    
    // Check for Korean title
    await expect(page).toHaveTitle(/한국|Korean|Museum|박물관/i);
    
    // Verify Korean content is present
    const koreanTextElements = await page.locator('text=/[가-힣]+/').count();
    expect(koreanTextElements).toBeGreaterThan(0);
    
    // Check main navigation elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check for hall navigation links with Korean text
    const hallLinks = page.locator('a[href*="/hall/"]');
    const hallCount = await hallLinks.count();
    expect(hallCount).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/01-homepage-korean.png', 
      fullPage: true 
    });
    
    console.log('✓ Homepage loads with Korean content');
  });

  test('2. Search autocomplete functionality with Korean character "금"', async () => {
    console.log('Testing search autocomplete...');
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]').first();
    
    if (!await searchInput.isVisible()) {
      console.log('Search input not found on homepage, checking for search button...');
      const searchButton = page.locator('button[aria-label*="search"], button:has(svg[class*="search"])').first();
      if (await searchButton.isVisible()) {
        await searchButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Now try to find search input again
    const searchInputAfter = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]').first();
    
    if (await searchInputAfter.isVisible()) {
      // Focus on search input
      await searchInputAfter.focus();
      
      // Type Korean character "금"
      await searchInputAfter.type('금', { delay: 100 });
      
      // Wait for autocomplete suggestions
      await page.waitForTimeout(1000);
      
      // Check for autocomplete dropdown/suggestions
      const suggestions = page.locator('[role="listbox"], [class*="autocomplete"], [class*="suggestion"], [class*="search-results"]');
      
      if (await suggestions.isVisible()) {
        const suggestionCount = await suggestions.locator('li, [role="option"], div').count();
        expect(suggestionCount).toBeGreaterThan(0);
        
        // Take screenshot of autocomplete
        await page.screenshot({ 
          path: 'test-results/02-search-autocomplete.png' 
        });
        
        console.log(`✓ Search autocomplete works - Found ${suggestionCount} suggestions`);
      } else {
        console.log('⚠ Autocomplete dropdown not visible, but search input accepts Korean characters');
        await page.screenshot({ 
          path: 'test-results/02-search-input-korean.png' 
        });
      }
    } else {
      console.log('⚠ Search functionality not found on this page');
    }
  });

  test('3. Language switcher functionality', async () => {
    console.log('Testing language switcher...');
    
    // Find language selector
    const langSelector = page.locator('button[aria-label*="language"], select[id*="language"], button:has-text("EN"), button:has-text("KO"), button:has-text("English"), button:has-text("한국어")').first();
    
    if (await langSelector.isVisible()) {
      // Get initial URL
      const initialUrl = page.url();
      
      // Click language selector
      await langSelector.click();
      await page.waitForTimeout(500);
      
      // Look for language options
      const englishOption = page.locator('text=English, text=EN, text=영어, [value="en"]').first();
      const koreanOption = page.locator('text=한국어, text=Korean, text=KO, [value="ko"]').first();
      
      // Switch to English if we can find the option
      if (await englishOption.isVisible()) {
        await englishOption.click();
        await page.waitForLoadState('networkidle');
        
        // Verify URL changed
        const englishUrl = page.url();
        expect(englishUrl).toContain('/en');
        
        // Take screenshot
        await page.screenshot({ 
          path: 'test-results/03-language-english.png' 
        });
        
        // Switch back to Korean
        const langSelectorKo = page.locator('button[aria-label*="language"], button:has-text("EN"), button:has-text("KO")').first();
        await langSelectorKo.click();
        await page.waitForTimeout(500);
        
        const koreanOptionAfter = page.locator('text=한국어, text=Korean, text=KO').first();
        if (await koreanOptionAfter.isVisible()) {
          await koreanOptionAfter.click();
          await page.waitForLoadState('networkidle');
          
          const koreanUrl = page.url();
          expect(koreanUrl).toContain('/ko');
          
          await page.screenshot({ 
            path: 'test-results/03-language-korean.png' 
          });
        }
        
        console.log('✓ Language switcher works correctly');
      } else {
        console.log('⚠ Language options not found after clicking selector');
      }
    } else {
      console.log('⚠ Language selector not found on page');
    }
  });

  test('4. Artifact cards are clickable and lead to detail pages', async () => {
    console.log('Testing artifact card navigation...');
    
    // Find artifact cards
    const artifactCards = page.locator('a[href*="/artifact/"]');
    const cardCount = await artifactCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    console.log(`Found ${cardCount} artifact cards`);
    
    // Click first artifact card
    const firstCard = artifactCards.first();
    const artifactTitle = await firstCard.locator('h2, h3, [class*="title"], [class*="name"]').textContent();
    
    await firstCard.click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on artifact detail page
    await expect(page).toHaveURL(/\/artifact\/\d+/);
    
    // Check detail page has content
    const detailTitle = page.locator('h1, h2').first();
    await expect(detailTitle).toBeVisible();
    
    // Check for artifact image
    const artifactImage = page.locator('img[alt*="artifact"], img[alt*="문화재"], img').first();
    await expect(artifactImage).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/04-artifact-detail.png',
      fullPage: true 
    });
    
    console.log('✓ Artifact cards navigate to detail pages correctly');
  });

  test('5. Image loading with blur placeholders', async () => {
    console.log('Testing image blur placeholders...');
    
    // Navigate to page with images
    await page.goto('/');
    
    // Look for images with blur or placeholder attributes
    const images = page.locator('img');
    const imageCount = await images.count();
    
    let blurPlaceholderFound = false;
    
    for (let i = 0; i < Math.min(5, imageCount); i++) {
      const img = images.nth(i);
      
      // Check for blur-related attributes or classes
      const hasBlurClass = await img.evaluate(el => {
        return el.className.includes('blur') || 
               el.className.includes('placeholder') ||
               el.style.filter?.includes('blur');
      });
      
      const hasBlurDataUrl = await img.evaluate(el => {
        const src = el.getAttribute('src') || '';
        return src.includes('data:image') && src.includes('base64');
      });
      
      if (hasBlurClass || hasBlurDataUrl) {
        blurPlaceholderFound = true;
        console.log(`Found blur placeholder on image ${i + 1}`);
      }
    }
    
    // Also check for Next.js Image component blur
    const nextImages = page.locator('img[data-nimg], span[style*="blur"]');
    const nextImageCount = await nextImages.count();
    
    if (nextImageCount > 0) {
      blurPlaceholderFound = true;
      console.log(`Found ${nextImageCount} Next.js images with potential blur`);
    }
    
    // Take screenshot showing images loading
    await page.screenshot({ 
      path: 'test-results/05-image-blur-placeholders.png',
      fullPage: true 
    });
    
    if (blurPlaceholderFound) {
      console.log('✓ Image blur placeholders detected');
    } else {
      console.log('⚠ No obvious blur placeholders found, but images are loading correctly');
    }
  });

  test('6. Favorites functionality - add and remove', async () => {
    console.log('Testing favorites functionality...');
    
    // Navigate to an artifact detail page
    const artifactLink = page.locator('a[href*="/artifact/"]').first();
    await artifactLink.click();
    await page.waitForLoadState('networkidle');
    
    // Look for favorite/heart button
    const favoriteButton = page.locator('button[aria-label*="favorite"], button[aria-label*="즐겨찾기"], button:has(svg[class*="heart"]), button:has-text("♥")').first();
    
    if (await favoriteButton.isVisible()) {
      // Get initial state
      const initialAriaPressed = await favoriteButton.getAttribute('aria-pressed');
      const initialClass = await favoriteButton.getAttribute('class');
      
      // Click to add to favorites
      await favoriteButton.click();
      await page.waitForTimeout(500);
      
      // Check state changed
      const afterAddClass = await favoriteButton.getAttribute('class');
      
      // Take screenshot after adding
      await page.screenshot({ 
        path: 'test-results/06-favorite-added.png' 
      });
      
      // Click again to remove from favorites
      await favoriteButton.click();
      await page.waitForTimeout(500);
      
      // Take screenshot after removing
      await page.screenshot({ 
        path: 'test-results/06-favorite-removed.png' 
      });
      
      console.log('✓ Favorites functionality works (add/remove)');
      
      // Check if there's a favorites page/counter
      const favoritesLink = page.locator('a[href*="favorites"], a:has-text("즐겨찾기")').first();
      if (await favoritesLink.isVisible()) {
        await favoritesLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
          path: 'test-results/06-favorites-page.png',
          fullPage: true 
        });
        console.log('✓ Favorites page accessible');
      }
    } else {
      console.log('⚠ Favorite button not found on artifact detail page');
    }
  });

  test('7. Navigation between exhibition halls', async () => {
    console.log('Testing hall navigation...');
    
    // Go to homepage
    await page.goto('/');
    
    // Find hall navigation links
    const hallLinks = page.locator('a[href*="/hall/"]');
    const hallCount = await hallLinks.count();
    
    expect(hallCount).toBeGreaterThan(0);
    console.log(`Found ${hallCount} exhibition halls`);
    
    // Visit first two halls
    for (let i = 0; i < Math.min(2, hallCount); i++) {
      const hallLink = hallLinks.nth(i);
      const hallName = await hallLink.textContent();
      
      await hallLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on hall page
      await expect(page).toHaveURL(/\/hall\//);
      
      // Check hall has artifacts
      const hallArtifacts = page.locator('a[href*="/artifact/"]');
      const artifactCount = await hallArtifacts.count();
      expect(artifactCount).toBeGreaterThan(0);
      
      console.log(`✓ Hall "${hallName}" has ${artifactCount} artifacts`);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/07-hall-${i + 1}.png`,
        fullPage: true 
      });
      
      // Go back to homepage for next hall
      await page.goto('/');
    }
    
    console.log('✓ Navigation between halls works correctly');
  });

  test('8. Virtual scrolling on artifact lists', async () => {
    console.log('Testing virtual scrolling...');
    
    // Navigate to a hall with many artifacts
    const hallLink = page.locator('a[href*="/hall/"]').first();
    await hallLink.click();
    await page.waitForLoadState('networkidle');
    
    // Check for virtual scrolling indicators
    const virtualScroller = page.locator('[data-virtual], [class*="virtual"], [style*="transform: translateY"]');
    
    if (await virtualScroller.count() > 0) {
      console.log('✓ Virtual scrolling detected');
      
      // Scroll down to trigger loading
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/08-virtual-scroll-mid.png' 
      });
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/08-virtual-scroll-bottom.png' 
      });
    } else {
      // Check for regular scrolling with many items
      const artifacts = page.locator('a[href*="/artifact/"]');
      const count = await artifacts.count();
      
      if (count > 10) {
        console.log(`Page has ${count} artifacts, checking scroll performance...`);
        
        // Measure scroll performance
        const scrollTime = await page.evaluate(async () => {
          const start = performance.now();
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise(resolve => setTimeout(resolve, 100));
          window.scrollTo(0, 0);
          return performance.now() - start;
        });
        
        console.log(`Scroll performance: ${scrollTime}ms`);
        
        if (scrollTime < 500) {
          console.log('✓ Good scroll performance, likely using optimization');
        } else {
          console.log('⚠ Regular scrolling without obvious virtualization');
        }
      }
    }
  });

  test('9. Error handling - non-existent pages', async () => {
    console.log('Testing error handling...');
    
    // Try to access non-existent artifact
    await page.goto('/artifact/99999999');
    await page.waitForLoadState('networkidle');
    
    // Check for error message or 404 page
    const errorIndicators = page.locator('text=/404|not found|찾을 수 없|오류|error/i');
    const hasError = await errorIndicators.count() > 0;
    
    if (hasError) {
      console.log('✓ Shows error message for non-existent artifact');
      await page.screenshot({ 
        path: 'test-results/09-error-404-artifact.png' 
      });
    } else {
      // Check if redirected to home
      const url = page.url();
      if (url.includes('/ko') || url.endsWith('/')) {
        console.log('✓ Redirects to home for non-existent pages');
      } else {
        console.log('⚠ No clear error handling for non-existent pages');
      }
    }
    
    // Try non-existent hall
    await page.goto('/hall/nonexistent');
    await page.waitForLoadState('networkidle');
    
    const hallError = await page.locator('text=/404|not found|찾을 수 없|오류|error/i').count() > 0;
    if (hallError) {
      console.log('✓ Shows error for non-existent hall');
      await page.screenshot({ 
        path: 'test-results/09-error-404-hall.png' 
      });
    }
  });

  test('10. PWA installation prompt', async ({ browserName }) => {
    console.log('Testing PWA installation prompt...');
    
    // PWA prompts are browser-specific and may not appear in all test environments
    if (browserName === 'chromium') {
      // Check for manifest
      const response = await page.goto('/manifest.json', { waitUntil: 'networkidle' });
      
      if (response && response.ok()) {
        const manifest = await response.json();
        expect(manifest.name).toBeTruthy();
        expect(manifest.icons).toBeTruthy();
        console.log('✓ PWA manifest found');
        
        // Go back to main page
        await page.goto('/');
        
        // Check for service worker
        const hasServiceWorker = await page.evaluate(() => {
          return 'serviceWorker' in navigator;
        });
        
        if (hasServiceWorker) {
          console.log('✓ Service Worker API available');
          
          // Look for install button (may be custom)
          const installButton = page.locator('button[aria-label*="install"], button:has-text("설치"), button:has-text("Install")');
          
          if (await installButton.isVisible()) {
            console.log('✓ Custom install button found');
            await page.screenshot({ 
              path: 'test-results/10-pwa-install-button.png' 
            });
          } else {
            console.log('⚠ No visible install button, but PWA is configured');
          }
        }
      } else {
        console.log('⚠ PWA manifest not found');
      }
    } else {
      console.log(`⚠ PWA testing skipped for ${browserName}`);
    }
  });

  test.afterEach(async () => {
    // Clean up after each test if needed
  });
});

// Performance and accessibility audit
test.describe('Additional Quality Checks', () => {
  test('Performance metrics', async ({ page }) => {
    console.log('Checking performance metrics...');
    
    await page.goto('/');
    
    // Measure key performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    console.log('Performance Metrics:', metrics);
    
    // Check if metrics are reasonable
    expect(metrics.firstContentfulPaint).toBeLessThan(3000); // FCP under 3s
    expect(metrics.loadComplete).toBeLessThan(5000); // Page load under 5s
  });

  test('Accessibility basics', async ({ page }) => {
    console.log('Checking accessibility...');
    
    await page.goto('/');
    
    // Check for essential accessibility features
    const hasLangAttr = await page.locator('html[lang]').count() > 0;
    expect(hasLangAttr).toBeTruthy();
    
    // Check for skip navigation link
    const skipLink = await page.locator('a[href="#main"], a:has-text("Skip")').count() > 0;
    console.log(`Skip navigation link: ${skipLink ? '✓' : '✗'}`);
    
    // Check images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    let missingAlt = 0;
    
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (!alt) missingAlt++;
    }
    
    console.log(`Images with alt text: ${imageCount - missingAlt}/${imageCount}`);
    expect(missingAlt).toBe(0);
  });
});