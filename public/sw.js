const CACHE_VERSION = 'v3'
const PRECACHE_NAME = `museum-shell-${CACHE_VERSION}`
const RUNTIME_CACHE_NAME = `museum-runtime-${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'
const MAX_RUNTIME_ENTRIES = 24
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  const currentCaches = new Set([PRECACHE_NAME, RUNTIME_CACHE_NAME])

  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => !currentCaches.has(name)).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request))
  }
})

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE_NAME)
      await cache.put(request, response.clone())
      await trimCache(cache, MAX_RUNTIME_ENTRIES)
    }
    return response
  } catch {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse

    const offlineResponse = await caches.match(OFFLINE_URL)
    if (offlineResponse) return offlineResponse

    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) return cachedResponse

  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE_NAME)
    await cache.put(request, response.clone())
    await trimCache(cache, MAX_RUNTIME_ENTRIES)
  }
  return response
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys()
  if (keys.length <= maxEntries) return

  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)))
}
