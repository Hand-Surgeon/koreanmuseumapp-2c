// Service Worker with Prefetching
const CACHE_VERSION = 'v1';
const CACHE_NAME = `museum-cache-${CACHE_VERSION}`;
const PRECACHE_NAME = `museum-precache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `museum-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `museum-images-${CACHE_VERSION}`;

// Precache files for offline access
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Add your static assets here
];

// Artifact data for prefetching
const ARTIFACT_IDS = Array.from({ length: 100 }, (_, i) => i + 1);
const CDN_BASE_URL = self.location.origin + '/artworks';

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      return cachedResponse || new Response('Offline', { status: 503 });
    }
  },

  // Cache first, fallback to network
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(RUNTIME_CACHE);
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    });

    return cachedResponse || fetchPromise;
  }
};

// Install event - precache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('museum-') && 
                   !cacheName.includes(CACHE_VERSION);
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with appropriate strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle different types of requests
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
    // Images - cache first
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.match(/\.(js|css)$/i)) {
    // Static assets - stale while revalidate
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
  } else if (url.pathname.includes('/api/')) {
    // API calls - network first
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
  } else {
    // HTML pages - network first
    event.respondWith(CACHE_STRATEGIES.networkFirst(request));
  }
});

// Handle image requests with intelligent prefetching
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Prefetch related images in the background
    prefetchRelatedImages(request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      prefetchRelatedImages(request.url);
    }
    return networkResponse;
  } catch (error) {
    return new Response('Image offline', { status: 503 });
  }
}

// Prefetch related artifact images
async function prefetchRelatedImages(imageUrl) {
  const match = imageUrl.match(/artifact-(\d+)-(main|side|detail|closeup)/);
  if (!match) return;

  const artifactId = parseInt(match[1]);
  const variants = ['main', 'side', 'detail', 'closeup'];
  
  // Prefetch all variants for this artifact
  const cache = await caches.open(IMAGE_CACHE);
  for (const variant of variants) {
    const url = `${CDN_BASE_URL}/artifact-${artifactId}-${variant}.jpg`;
    if (!await cache.match(url)) {
      fetch(url).then(response => {
        if (response.ok) {
          cache.put(url, response);
        }
      }).catch(() => {});
    }
  }

  // Prefetch adjacent artifacts (prev and next)
  const adjacentIds = [artifactId - 1, artifactId + 1].filter(id => id > 0 && id <= 100);
  for (const id of adjacentIds) {
    const mainImageUrl = `${CDN_BASE_URL}/artifact-${id}-main.jpg`;
    if (!await cache.match(mainImageUrl)) {
      fetch(mainImageUrl).then(response => {
        if (response.ok) {
          cache.put(mainImageUrl, response);
        }
      }).catch(() => {});
    }
  }
}

// Message event - handle commands from the app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CACHE_ARTIFACTS':
      cacheArtifacts(payload.artifactIds);
      break;
    
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
    
    case 'PREFETCH_HALL':
      prefetchHallArtifacts(payload.hallName);
      break;
  }
});

// Cache specific artifacts
async function cacheArtifacts(artifactIds) {
  const cache = await caches.open(IMAGE_CACHE);
  const promises = [];

  for (const id of artifactIds) {
    const mainImageUrl = `${CDN_BASE_URL}/artifact-${id}-main.jpg`;
    promises.push(
      fetch(mainImageUrl).then(response => {
        if (response.ok) {
          return cache.put(mainImageUrl, response);
        }
      }).catch(() => {})
    );
  }

  await Promise.all(promises);
}

// Prefetch all artifacts from a specific hall
async function prefetchHallArtifacts(hallName) {
  // This would be enhanced with actual hall-to-artifact mapping
  const hallArtifacts = {
    'archaeology': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'art': [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    'history': [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    'asia': [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    'donation': [41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
  };

  const artifactIds = hallArtifacts[hallName] || [];
  await cacheArtifacts(artifactIds);
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Sync favorites with server
async function syncFavorites() {
  // Implementation would sync local favorites with server
  console.log('Syncing favorites...');
}

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || '새로운 전시 소식이 있습니다!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('국립중앙박물관', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});