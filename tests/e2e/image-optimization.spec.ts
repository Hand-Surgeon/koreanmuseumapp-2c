import { test, expect } from '@playwright/test';

test.describe('Image CDN and Optimization Tests', () => {
  test('should load optimized images with proper formats', async ({ page }) => {
    const imageRequests: { url: string; size: number }[] = [];
    
    page.on('response', response => {
      if (response.request().resourceType() === 'image') {
        imageRequests.push({
          url: response.url(),
          size: Number(response.headers()['content-length'] || 0)
        });
      }
    });
    
    await page.goto('/ko/artifact/1');
    await page.waitForLoadState('networkidle');
    
    // Check if images are optimized
    const optimizedImages = imageRequests.filter(img => 
      img.url.includes('w=') || 
      img.url.includes('q=') ||
      img.url.includes('.webp') ||
      img.url.includes('.avif')
    );
    
    expect(optimizedImages.length).toBeGreaterThan(0);
    
    // Check image sizes are reasonable
    const largeSizeImages = imageRequests.filter(img => img.size > 500000); // 500KB
    expect(largeSizeImages.length).toBe(0);
  });

  test('should use responsive images', async ({ page }) => {
    await page.goto('/ko');
    
    // Check srcset attribute
    const images = page.locator('img[srcset]');
    const imageCount = await images.count();
    
    expect(imageCount).toBeGreaterThan(0);
    
    // Verify srcset contains multiple sizes
    const firstImageSrcset = await images.first().getAttribute('srcset');
    expect(firstImageSrcset).toContain('640w');
    expect(firstImageSrcset).toContain('1200w');
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/ko/hall/archaeology');
    
    // Check loading attribute
    const lazyImages = page.locator('img[loading="lazy"]');
    const lazyCount = await lazyImages.count();
    
    expect(lazyCount).toBeGreaterThan(0);
    
    // Verify images below fold are not loaded initially
    const imageRequests: string[] = [];
    page.on('request', request => {
      if (request.resourceType() === 'image') {
        imageRequests.push(request.url());
      }
    });
    
    await page.waitForTimeout(1000);
    const initialRequestCount = imageRequests.length;
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // More images should load
    expect(imageRequests.length).toBeGreaterThan(initialRequestCount);
  });

  test('should show blur placeholders', async ({ page }) => {
    await page.goto('/ko/artifact/1');
    
    // Check for blur data URL
    const imagesWithBlur = page.locator('img[style*="background-image"]');
    const blurCount = await imagesWithBlur.count();
    
    expect(blurCount).toBeGreaterThan(0);
    
    // Verify blur placeholder is base64
    const firstImageStyle = await imagesWithBlur.first().getAttribute('style');
    expect(firstImageStyle).toContain('data:image');
  });

  test('should support multiple image variants', async ({ page }) => {
    await page.goto('/ko/artifact/1');
    
    // Check thumbnail navigation
    const thumbnails = page.locator('[data-testid="image-thumbnail"]');
    await expect(thumbnails).toHaveCount(4);
    
    // Click through variants
    const mainImage = page.locator('[data-testid="main-image"]');
    const initialSrc = await mainImage.getAttribute('src');
    
    await thumbnails.nth(1).click();
    await page.waitForTimeout(300);
    
    const newSrc = await mainImage.getAttribute('src');
    expect(newSrc).not.toBe(initialSrc);
    expect(newSrc).toContain('side');
  });
});