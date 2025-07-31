# Museum app design

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/grampus2000s-projects/v0-korean-museum-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/sBRJTg8f1LU)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/grampus2000s-projects/v0-korean-museum-app](https://vercel.com/grampus2000s-projects/v0-korean-museum-app)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/sBRJTg8f1LU](https://v0.dev/chat/projects/sBRJTg8f1LU)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Features

### Image CDN Integration

The application now supports multiple CDN providers for optimized image delivery:

- **Cloudinary**: Automatic image optimization and transformation
- **Imgix**: Real-time image processing and delivery
- **Custom CDN**: Support for any CDN with URL-based transformations

#### Setting up CDN

1. Copy `.env.local.example` to `.env.local`
2. Configure your preferred CDN:

```bash
# For Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# For Imgix
NEXT_PUBLIC_IMGIX_DOMAIN=your-domain.imgix.net

# For Custom CDN
NEXT_PUBLIC_IMAGE_CDN_URL=https://cdn.example.com
```

3. Upload images using the provided script:

```bash
node scripts/upload-to-cdn.js
```

The application will automatically generate optimized URLs based on your CDN configuration, including:
- Multiple image variants (main, side, detail, closeup)
- Responsive image sizes
- Format optimization (WebP, AVIF)
- Lazy loading with blur placeholders

### Service Worker Prefetching

The application includes intelligent prefetching capabilities for improved performance:

- **Automatic Prefetching**: Adjacent artifacts are prefetched when viewing details
- **Hover Prefetching**: Images are prefetched when hovering over artifact cards
- **Adaptive Strategy**: Prefetching adapts based on connection quality (4G, 3G, etc.)
- **Offline Support**: Cached content remains available offline

#### Prefetching Strategies

1. **Network-aware prefetching**: Adjusts based on connection speed
2. **Interaction-based**: Prefetches content based on user interactions
3. **Predictive**: Prefetches adjacent and related artifacts
4. **Progressive**: Prioritizes main images before variants

The service worker automatically manages cache size and updates cached content when new versions are available.

### Bundle Size Optimization

The application uses several strategies to minimize bundle size:

#### Dynamic Imports
Heavy components are loaded on-demand:
- Virtual scrolling components
- Image modals
- PWA installation prompts
- Analytics components

#### Tree Shaking
- Removed 48+ unused packages
- Optimized imports for better tree shaking
- Reduced initial bundle by ~30%

#### Code Splitting
- Route-based code splitting
- Component-level lazy loading
- Conditional feature loading

#### Build Optimization
To analyze bundle size:
```bash
npm run analyze
```

This will open a visual representation of your bundle to identify optimization opportunities.

### React Query Integration

The application uses TanStack Query (React Query) for efficient data fetching and caching:

#### Features
- **Intelligent Caching**: Automatic caching with configurable stale times
- **Optimistic Updates**: Instant UI feedback for user actions
- **Background Refetching**: Keep data fresh without blocking UI
- **Infinite Scroll**: Built-in support for paginated data
- **Suspense Support**: Works seamlessly with React Suspense

#### Usage Example
```tsx
import { useArtifacts } from '@/hooks/api/useArtifacts';

function ArtifactsList() {
  const { data, isLoading, error } = useArtifacts({
    hall: 'archaeology',
    limit: 20
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  return <ArtifactGrid artifacts={data.artifacts} />;
}
```

#### Available Hooks
- `useArtifacts()` - Fetch artifacts with filters
- `useArtifact()` - Fetch single artifact details
- `useInfiniteArtifacts()` - Infinite scroll support
- `useFavorites()` - Manage favorite artifacts
- `useToggleFavorite()` - Optimistic favorite updates

The React Query DevTools are available in development mode for debugging cache behavior.

## Testing

### Playwright E2E Tests

Comprehensive end-to-end tests cover all features and optimizations:

#### Test Suites
- **Core Features**: Navigation, search, language switching
- **Virtual Scrolling**: Performance and scroll behavior
- **Image Optimization**: CDN integration, lazy loading, formats
- **PWA/Offline**: Service worker, caching, offline functionality
- **React Query**: Data caching, optimistic updates, debouncing
- **Performance**: Load times, bundle sizes, code splitting

#### Running Tests
```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Run all tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug

# Run specific test
npx playwright test virtual-scrolling
```

#### Test Coverage
- ✅ All 5 major improvements tested
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Mobile viewport testing
- ✅ Offline functionality
- ✅ Performance budgets
- ✅ Accessibility compliance

See `tests/PLAYWRIGHT_TEST_ANALYSIS.md` for detailed test documentation and benchmarks.
