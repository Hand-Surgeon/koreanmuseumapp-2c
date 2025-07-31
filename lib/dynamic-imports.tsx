import dynamic from 'next/dynamic';

// Dynamic imports for heavy components to reduce initial bundle size

// Virtual scrolling component - only loaded when needed
export const VirtualArtifactList = dynamic(
  () => import('@/components/virtual-artifact-list').then(mod => mod.VirtualArtifactList),
  {
    loading: () => <div className="h-[calc(100vh-200px)] animate-pulse bg-gray-100" />,
    ssr: false, // Disable SSR for virtual scrolling
  }
);

// Image modal - only loaded when user clicks to expand
export const ImageModal = dynamic(
  () => import('@/components/image-modal').then(mod => mod.ImageModal),
  {
    loading: () => null,
    ssr: false,
  }
);

// PWA install prompt - only loaded on client
export const PWAInstallPrompt = dynamic(
  () => import('@/components/pwa-install-prompt').then(mod => mod.PWAInstallPrompt),
  {
    loading: () => null,
    ssr: false,
  }
);

// Analytics provider - only loaded if analytics enabled
export const AnalyticsProvider = dynamic(
  () => import('@/components/analytics-provider').then(mod => mod.AnalyticsProvider),
  {
    loading: () => null,
    ssr: false,
  }
);


// Loading skeletons for better UX
export const ArtifactCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

export const ArtifactDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white shadow-sm border-b h-16 animate-pulse" />
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);