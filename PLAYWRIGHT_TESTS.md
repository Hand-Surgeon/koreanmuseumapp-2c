# Playwright Tests for Korean Museum App

This directory contains Playwright tests for the Korean Museum application. The tests cover the complete user journey through the application including navigation, artifact viewing, image expansion, and language switching.

## Test Files

1. **playwright-test.js** - Standalone script that runs a complete user journey test
2. **e2e/korean-museum.spec.js** - Comprehensive test suite using Playwright Test Runner
3. **playwright.config.js** - Configuration for Playwright Test Runner

## Prerequisites

1. Install Playwright:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

2. Make sure the Korean Museum app is running on http://localhost:3000:
```bash
npm run dev
```

## Running Tests

### Option 1: Run the standalone test script
```bash
node playwright-test.js
```

This will:
- Open a browser window
- Navigate through the app
- Take screenshots at each step
- Save screenshots in the `screenshots/` directory

### Option 2: Run the Playwright Test Suite
```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Run tests in a specific browser
npx playwright test --project=chromium

# Run tests with UI mode (interactive)
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

## Test Coverage

The tests cover the following user journeys:

1. **Main Page Navigation**
   - Load the application
   - Verify main elements are visible
   - Check page title and structure

2. **Artifact Detail View**
   - Click on artifact cards
   - Navigate to artifact detail pages
   - Verify artifact information is displayed

3. **Image Expansion**
   - Click on artifact images
   - Verify modal/expanded view opens
   - Test closing the expanded view

4. **Hall Navigation**
   - Navigate to different museum halls
   - Verify hall-specific artifacts are shown
   - Test navigation between halls

5. **Search Functionality**
   - Use the search feature
   - Verify search results

6. **Language Switching**
   - Switch between English and Korean
   - Verify UI updates with language change

7. **Responsive Design**
   - Test on mobile viewport
   - Test on tablet viewport
   - Test on desktop viewport

8. **Accessibility**
   - Check for skip links
   - Verify heading hierarchy
   - Check image alt texts

9. **Cross-browser Testing**
   - Run tests in Chromium
   - Run tests in Firefox
   - Run tests in WebKit (Safari)

## Screenshots

Screenshots are saved in the `screenshots/` directory with descriptive names:
- `01-main-page.png` - Homepage
- `02-artifact-detail.png` - Artifact detail page
- `03-image-expanded.png` - Expanded image modal
- `04-hall-*.png` - Different hall pages
- `05-search-results.png` - Search functionality
- `06-korean-language.png` - Korean language view
- `07-mobile-view.png` - Mobile responsive view
- etc.

## Debugging

If tests fail:
1. Check if the app is running on http://localhost:3000
2. Review the error messages in the console
3. Check the screenshots in the `screenshots/` directory
4. Use `--debug` flag to run tests in debug mode
5. Use Playwright's trace viewer for detailed debugging:
   ```bash
   npx playwright test --trace on
   npx playwright show-trace
   ```

## CI/CD Integration

The tests are configured to work in CI environments:
- Automatic retries on failure
- Headless mode by default
- Parallel execution disabled in CI
- Screenshots and videos on failure