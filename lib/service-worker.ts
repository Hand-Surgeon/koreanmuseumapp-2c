// Service Worker 등록 및 관리

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker를 지원하지 않는 브라우저입니다.')
    return
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    console.log('Service Worker 등록 성공:', registration.scope)

    // 업데이트 확인
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 새 버전이 설치되었지만 아직 활성화되지 않음
            showUpdateNotification()
          }
        })
      }
    })

    // 주기적으로 업데이트 확인 (1시간마다)
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

    return registration
  } catch (error) {
    console.error('Service Worker 등록 실패:', error)
  }
}

// 업데이트 알림 표시
function showUpdateNotification() {
  const updateBanner = document.createElement('div')
  updateBanner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 text-center z-50'
  updateBanner.innerHTML = `
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <span>새로운 버전이 준비되었습니다.</span>
      <button 
        onclick="window.location.reload()" 
        class="ml-4 px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100"
      >
        업데이트
      </button>
    </div>
  `
  document.body.appendChild(updateBanner)
}

// Service Worker 메시지 전송
export function sendMessageToSW(message: any) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message)
  }
}

// 캐시 크기 계산
export async function getCacheSize(): Promise<number> {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return 0
  }

  try {
    const { usage = 0 } = await navigator.storage.estimate()
    return usage
  } catch {
    return 0
  }
}

// 캐시 삭제
export async function clearCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
  }
}

// 오프라인 상태 감지
export function setupOfflineDetection(
  onOnline: () => void,
  onOffline: () => void
) {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  // 초기 상태 확인
  if (!navigator.onLine) {
    onOffline()
  }

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

// 백그라운드 동기화 요청
export async function requestBackgroundSync(tag: string) {
  if ('sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      await (registration as any).sync.register(tag)
      console.log(`백그라운드 동기화 등록: ${tag}`)
    } catch (error) {
      console.error('백그라운드 동기화 실패:', error)
    }
  }
}

// 푸시 알림 권한 요청
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('이 브라우저는 알림을 지원하지 않습니다.')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 푸시 구독
export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    // 서버에 구독 정보 전송
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })

    return subscription
  } catch (error) {
    console.error('푸시 구독 실패:', error)
    return null
  }
}