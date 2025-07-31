import { useEffect, useCallback } from 'react';
import { sendMessageToSW } from '@/lib/service-worker';

interface PrefetchOptions {
  artifactIds?: number[];
  hallName?: string;
  strategy?: 'aggressive' | 'moderate' | 'conservative';
}

export function usePrefetch() {
  // Prefetch artifact images
  const prefetchArtifacts = useCallback((artifactIds: number[]) => {
    if ('serviceWorker' in navigator) {
      sendMessageToSW({
        type: 'CACHE_ARTIFACTS',
        payload: { artifactIds }
      });
    }
  }, []);

  // Prefetch hall artifacts
  const prefetchHall = useCallback((hallName: string) => {
    if ('serviceWorker' in navigator) {
      sendMessageToSW({
        type: 'PREFETCH_HALL',
        payload: { hallName }
      });
    }
  }, []);

  // Prefetch adjacent artifacts when viewing a specific one
  const prefetchAdjacentArtifacts = useCallback((currentId: number) => {
    const adjacentIds = [
      currentId - 2,
      currentId - 1,
      currentId + 1,
      currentId + 2
    ].filter(id => id > 0 && id <= 100);

    prefetchArtifacts(adjacentIds);
  }, [prefetchArtifacts]);

  // Prefetch based on user interaction patterns
  const prefetchOnHover = useCallback((artifactId: number) => {
    // Use requestIdleCallback for non-critical prefetching
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchArtifacts([artifactId]);
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        prefetchArtifacts([artifactId]);
      }, 100);
    }
  }, [prefetchArtifacts]);

  // Prefetch based on scroll position
  const prefetchOnScroll = useCallback((visibleArtifactIds: number[]) => {
    // Prefetch the next batch of artifacts
    const maxId = Math.max(...visibleArtifactIds);
    const nextBatch = Array.from({ length: 5 }, (_, i) => maxId + i + 1)
      .filter(id => id <= 100);

    if (nextBatch.length > 0) {
      prefetchArtifacts(nextBatch);
    }
  }, [prefetchArtifacts]);

  return {
    prefetchArtifacts,
    prefetchHall,
    prefetchAdjacentArtifacts,
    prefetchOnHover,
    prefetchOnScroll
  };
}

// Hook for intelligent prefetching based on connection type
export function useAdaptivePrefetch() {
  const { prefetchArtifacts } = usePrefetch();

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updatePrefetchStrategy = () => {
        const { effectiveType, saveData } = connection;

        // Don't prefetch if user has data saver enabled
        if (saveData) return;

        // Adjust prefetch strategy based on connection quality
        switch (effectiveType) {
          case '4g':
            // Aggressive prefetching on fast connections
            console.log('Fast connection detected, enabling aggressive prefetching');
            // Prefetch popular artifacts
            prefetchArtifacts([1, 2, 3, 4, 5, 11, 21, 31, 41, 51]);
            break;
          
          case '3g':
            // Moderate prefetching
            console.log('Moderate connection detected, limited prefetching');
            // Only prefetch top 5 artifacts
            prefetchArtifacts([1, 2, 3, 4, 5]);
            break;
          
          case '2g':
          case 'slow-2g':
            // No automatic prefetching on slow connections
            console.log('Slow connection detected, prefetching disabled');
            break;
        }
      };

      updatePrefetchStrategy();
      connection.addEventListener('change', updatePrefetchStrategy);

      return () => {
        connection.removeEventListener('change', updatePrefetchStrategy);
      };
    }
  }, [prefetchArtifacts]);
}

// Hook for intersection observer based prefetching
export function usePrefetchOnVisible(
  artifactId: number,
  options?: IntersectionObserverInit
) {
  const { prefetchOnHover } = usePrefetch();

  useEffect(() => {
    const element = document.querySelector(`[data-artifact-id="${artifactId}"]`);
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetchOnHover(artifactId);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [artifactId, prefetchOnHover]);
}