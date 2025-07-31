# Korean Museum App - Comprehensive Testing and Fixing Plan

## Overview
This document outlines a detailed plan for testing the Korean Museum App with Playwright, identifying issues, and implementing fixes iteratively until all tests pass.

## Phase 1: Environment Setup and Initial Assessment

### 1.1 Verify Application Status
```bash
# Check if app is running
curl http://localhost:3000

# If not running, start the app
npm install
npm run dev
```

### 1.2 Install Playwright Dependencies
```bash
# Install Playwright browsers
npm run playwright:install

# Install any missing dependencies
npm install -D @playwright/test
```

### 1.3 Initial Test Run
```bash
# Run all tests to get baseline
npm run test:e2e

# Generate HTML report
npx playwright show-report
```

## Phase 2: Issue Analysis and Prioritization

Based on the test report analysis, here are the issues categorized by priority:

### High Priority (Critical for functionality)
1. **PWA Manifest Missing** - Returns 404
   - Impact: PWA installation not possible
   - Fix: Create manifest.json in public directory

2. **Service Worker Caching** - Needs verification
   - Impact: Offline functionality may not work
   - Fix: Test and update service worker implementation

3. **Accessibility Issues** - Need comprehensive audit
   - Impact: User accessibility
   - Fix: Run axe-core tests and fix violations

### Medium Priority (Feature completion)
4. **Language Switcher Test** - Selector mismatch
   - Impact: Test reliability
   - Fix: Update test selectors to match implementation

5. **Artifact Navigation Test** - Uses wrong navigation pattern
   - Impact: Test doesn't reflect actual UX
   - Fix: Update test to use hall-based navigation

6. **Favorites Test** - Navigation failure
   - Impact: Can't test favorites feature
   - Fix: Ensure proper navigation to artifact detail

7. **Virtual Scrolling Performance** - Needs comprehensive testing
   - Impact: Performance on large lists
   - Fix: Create specific virtual scroll tests

8. **React Query Caching** - Not tested
   - Impact: Data management efficiency
   - Fix: Add React Query specific tests

### Low Priority (Enhancements)
9. **Search Autocomplete Visibility** - No dropdown shown
   - Impact: UX enhancement
   - Fix: Improve autocomplete implementation

10. **Loading States** - Could be enhanced
    - Impact: Perceived performance
    - Fix: Add skeleton screens

## Phase 3: Implementation Plan

### Step 1: Fix PWA Manifest (High Priority)
```javascript
// public/manifest.json
{
  "name": "국립중앙박물관",
  "short_name": "중앙박물관",
  "description": "한국 문화유산 디지털 전시관",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Step 2: Update Test Selectors (Medium Priority)

#### Language Switcher Test Fix
```typescript
// Find the actual language button implementation
const langButton = page.locator('button[aria-label*="language"], button:has(svg[class*="globe"])');

// Update dropdown selection
await page.locator('[role="menu"] button:has-text("English")').click();
```

#### Artifact Navigation Test Fix
```typescript
// Navigate through hall structure
await page.goto('/ko');
await page.locator('a[href*="/hall/archaeology"]').click();
await page.waitForSelector('a[href*="/artifact/"]');
await page.locator('a[href*="/artifact/"]').first().click();
```

### Step 3: Create Virtual Scrolling Test Suite
```typescript
// tests/e2e/virtual-scrolling-enhanced.spec.ts
test('Virtual scroll maintains performance with 100+ items', async ({ page }) => {
  // Navigate to hall with many artifacts
  await page.goto('/ko/hall/art');
  
  // Measure initial render performance
  const metrics = await page.evaluate(() => performance.now());
  
  // Check visible item count
  const visibleItems = await page.locator('[data-testid="artifact-card"]:visible').count();
  expect(visibleItems).toBeLessThan(20); // Should use virtual scrolling
  
  // Test scroll performance
  await page.evaluate(() => window.scrollTo(0, 5000));
  
  // Verify smooth scrolling
  const fps = await page.evaluate(() => {
    return new Promise(resolve => {
      let frames = 0;
      const start = performance.now();
      
      function count() {
        frames++;
        if (performance.now() - start < 1000) {
          requestAnimationFrame(count);
        } else {
          resolve(frames);
        }
      }
      
      requestAnimationFrame(count);
    });
  });
  
  expect(fps).toBeGreaterThan(30); // Should maintain 30+ FPS
});
```

### Step 4: React Query Testing
```typescript
// tests/e2e/react-query-enhanced.spec.ts
test('React Query caches data between navigations', async ({ page }) => {
  // Monitor network requests
  const apiCalls = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiCalls.push(request.url());
    }
  });
  
  // First navigation
  await page.goto('/ko/hall/art');
  const initialCalls = apiCalls.length;
  
  // Navigate away and back
  await page.goto('/ko');
  await page.goto('/ko/hall/art');
  
  // Should use cached data (no new API calls)
  expect(apiCalls.length).toBe(initialCalls);
});
```

### Step 5: Service Worker Testing
```typescript
// tests/e2e/service-worker-enhanced.spec.ts
test('Service worker provides offline functionality', async ({ page, context }) => {
  // Load page to register SW
  await page.goto('/ko');
  await page.waitForTimeout(2000); // Allow SW to register
  
  // Go offline
  await context.setOffline(true);
  
  // Navigate to cached page
  await page.goto('/ko/hall/art');
  
  // Should still load from cache
  await expect(page.locator('h1')).toBeVisible();
  
  // Test offline fallback
  await page.goto('/ko/uncached-page');
  await expect(page.locator('text=/offline/i')).toBeVisible();
});
```

### Step 6: Accessibility Testing
```typescript
// tests/e2e/accessibility-enhanced.spec.ts
import { injectAxe, checkA11y } from 'axe-playwright';

test('Homepage meets WCAG 2.1 AA standards', async ({ page }) => {
  await page.goto('/ko');
  await injectAxe(page);
  
  // Check for violations
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  });
});

test('Keyboard navigation works throughout app', async ({ page }) => {
  await page.goto('/ko');
  
  // Tab through interactive elements
  await page.keyboard.press('Tab');
  const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedElement).toBeTruthy();
  
  // Test skip link
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  
  // Should skip to main content
  const mainFocused = await page.evaluate(() => 
    document.activeElement?.closest('main') !== null
  );
  expect(mainFocused).toBeTruthy();
});
```

## Phase 4: Fix Implementation

### Fix 1: Create PWA Manifest
1. Create manifest.json in public directory
2. Generate app icons (192x192, 512x512)
3. Update app metadata

### Fix 2: Update Service Worker
1. Review current sw.js implementation
2. Add comprehensive caching strategies
3. Implement offline fallback page

### Fix 3: Fix Test Selectors
1. Inspect actual DOM structure
2. Update all failing test selectors
3. Add data-testid attributes where needed

### Fix 4: Enhance Search Autocomplete
1. Add debouncing to search input
2. Implement visible dropdown with results
3. Add keyboard navigation support

### Fix 5: Add Loading States
1. Create skeleton components
2. Implement loading states for:
   - Artifact lists
   - Image loading
   - Data fetching

## Phase 5: Continuous Testing Loop

### Testing Workflow
```bash
# 1. Run specific test suite
npm run test:e2e -- --grep "PWA"

# 2. Fix identified issues
# ... implement fixes ...

# 3. Re-run tests
npm run test:e2e

# 4. Check coverage
npm run test:e2e -- --reporter=html

# 5. Repeat until all pass
```

### CI/CD Integration
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Phase 6: Performance Optimization

### Metrics to Monitor
1. **First Contentful Paint (FCP)**: < 1.5s
2. **Largest Contentful Paint (LCP)**: < 2.5s
3. **Time to Interactive (TTI)**: < 3.5s
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **First Input Delay (FID)**: < 100ms

### Performance Test Suite
```typescript
test('Core Web Vitals meet targets', async ({ page }) => {
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const vitals = {
          lcp: entries.find(e => e.entryType === 'largest-contentful-paint')?.startTime,
          fid: entries.find(e => e.entryType === 'first-input')?.processingStart,
          cls: entries.filter(e => e.entryType === 'layout-shift')
            .reduce((sum, entry) => sum + entry.value, 0)
        };
        resolve(vitals);
      }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    });
  });
  
  expect(metrics.lcp).toBeLessThan(2500);
  expect(metrics.cls).toBeLessThan(0.1);
});
```

## Phase 7: Final Validation

### Checklist
- [ ] All Playwright tests pass
- [ ] PWA installation works
- [ ] Offline functionality verified
- [ ] Search autocomplete visible and functional
- [ ] Language switching works correctly
- [ ] Virtual scrolling performs well
- [ ] React Query caching optimized
- [ ] Accessibility audit passes
- [ ] Performance metrics meet targets
- [ ] Cross-browser testing complete

### Final Test Run
```bash
# Run all tests with multiple browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Generate final report
npx playwright show-report
```

## Deliverables

1. **Fixed Application** with all issues resolved
2. **Updated Test Suite** with comprehensive coverage
3. **Performance Report** showing improvements
4. **Accessibility Report** confirming WCAG compliance
5. **Documentation** of all changes made

## Success Criteria

- 100% of Playwright tests passing
- All high-priority issues fixed
- Performance metrics within target ranges
- Accessibility audit shows no violations
- PWA scores 90+ in Lighthouse

## Timeline Estimate

- Phase 1-2: 2 hours (Setup and Analysis)
- Phase 3-4: 6 hours (Implementation)
- Phase 5-6: 3 hours (Testing and Optimization)
- Phase 7: 1 hour (Final Validation)

Total: ~12 hours of focused work

## Next Steps

1. Start with Phase 1 - Environment Setup
2. Run initial test suite
3. Begin fixing high-priority issues
4. Iterate through testing and fixing
5. Complete final validation

This plan provides a systematic approach to achieving 100% test coverage and a fully functional Korean Museum App.