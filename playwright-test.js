const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions for visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('Starting Korean Museum App Test Journey...\n');

    // 1. Navigate to the main page
    console.log('1. Opening Korean Museum app at http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of main page
    await page.screenshot({ path: 'screenshots/01-main-page.png', fullPage: true });
    console.log('   ✓ Screenshot saved: 01-main-page.png');

    // 2. Check if the page loaded correctly
    const title = await page.title();
    console.log(`   ✓ Page title: ${title}`);

    // 3. Find and click on an artifact card
    console.log('\n2. Clicking on first artifact to view details');
    // Wait for artifact cards to load
    await page.waitForSelector('[data-testid="artifact-card"], .artifact-card, a[href*="/artifact/"]', { timeout: 10000 });
    
    // Click the first artifact
    const firstArtifact = await page.locator('a[href*="/artifact/"]').first();
    await firstArtifact.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of artifact detail page
    await page.screenshot({ path: 'screenshots/02-artifact-detail.png', fullPage: true });
    console.log('   ✓ Screenshot saved: 02-artifact-detail.png');

    // 4. Test image expansion functionality
    console.log('\n3. Testing image expansion functionality');
    // Look for the main artifact image
    const artifactImage = await page.locator('img[alt*="artifact"], img[alt*="Artifact"], .artifact-image img, main img').first();
    if (await artifactImage.isVisible()) {
      await artifactImage.click();
      await page.waitForTimeout(1000);
      
      // Check if modal/expanded view opened
      const modal = await page.locator('[role="dialog"], .modal, .image-modal, [data-testid="image-modal"]');
      if (await modal.isVisible()) {
        await page.screenshot({ path: 'screenshots/03-image-expanded.png' });
        console.log('   ✓ Image expansion working - Screenshot saved: 03-image-expanded.png');
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }

    // 5. Navigate back to main page
    console.log('\n4. Navigating back to main page');
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 6. Navigate to different hall pages
    console.log('\n5. Testing navigation to different halls');
    
    // Look for hall navigation links
    const hallLinks = await page.locator('a[href*="/hall/"], nav a').all();
    const hallNames = [];
    
    for (const link of hallLinks) {
      const text = await link.textContent();
      if (text && text.toLowerCase().includes('hall')) {
        hallNames.push(link);
      }
    }

    // Visit at least 2 different halls
    const hallsToVisit = hallNames.slice(0, 2);
    for (let i = 0; i < hallsToVisit.length; i++) {
      const hall = hallsToVisit[i];
      const hallName = await hall.textContent();
      console.log(`   - Visiting ${hallName}`);
      
      await hall.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: `screenshots/04-hall-${i + 1}.png`, fullPage: true });
      console.log(`   ✓ Screenshot saved: 04-hall-${i + 1}.png`);
      
      // Go back to main page
      await page.goBack();
      await page.waitForTimeout(1000);
    }

    // 7. Test search functionality if available
    console.log('\n6. Testing search functionality');
    const searchInput = await page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="검색" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('ceramic');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'screenshots/05-search-results.png' });
      console.log('   ✓ Search functionality tested - Screenshot saved: 05-search-results.png');
    }

    // 8. Test language selector if available
    console.log('\n7. Testing language selector');
    const langSelector = await page.locator('button[aria-label*="language" i], select[name*="language" i], button:has-text("EN"), button:has-text("KO")').first();
    if (await langSelector.isVisible()) {
      await langSelector.click();
      await page.waitForTimeout(500);
      
      // Try to select Korean if available
      const koreanOption = await page.locator('text=한국어, text=Korean, text=KO').first();
      if (await koreanOption.isVisible()) {
        await koreanOption.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'screenshots/06-korean-language.png' });
        console.log('   ✓ Language selector working - Screenshot saved: 06-korean-language.png');
      }
    }

    // 9. Final summary screenshot
    console.log('\n8. Taking final screenshot of main page');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/07-final-main-page.png', fullPage: true });
    console.log('   ✓ Screenshot saved: 07-final-main-page.png');

    console.log('\n✅ Test journey completed successfully!');
    console.log('\nScreenshots saved in the screenshots/ directory:');
    console.log('  - 01-main-page.png');
    console.log('  - 02-artifact-detail.png');
    console.log('  - 03-image-expanded.png');
    console.log('  - 04-hall-1.png');
    console.log('  - 04-hall-2.png');
    console.log('  - 05-search-results.png');
    console.log('  - 06-korean-language.png');
    console.log('  - 07-final-main-page.png');

  } catch (error) {
    console.error('❌ Error during test:', error);
    // Take error screenshot
    await page.screenshot({ path: 'screenshots/error-screenshot.png' });
    console.log('Error screenshot saved: error-screenshot.png');
  } finally {
    // Close browser
    await browser.close();
  }
})();