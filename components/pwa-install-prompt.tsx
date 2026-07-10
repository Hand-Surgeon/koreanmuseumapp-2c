"use client"

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/hooks/useLanguage'
import type { Language } from '@/types/language'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const installCopy: Record<Language, {
  title: string
  description: string
  install: string
  later: string
  close: string
}> = {
  ko: {
    title: '앱으로 설치하기',
    description: '홈 화면에 추가해 더 빠르고 편리하게 이용하세요.',
    install: '설치하기',
    later: '나중에',
    close: '설치 안내 닫기',
  },
  en: {
    title: 'Install the app',
    description: 'Add it to your home screen for faster, easier access.',
    install: 'Install',
    later: 'Not now',
    close: 'Close install prompt',
  },
  zh: {
    title: '安装应用',
    description: '添加到主屏幕，更快更方便地访问。',
    install: '安装',
    later: '稍后',
    close: '关闭安装提示',
  },
  ja: {
    title: 'アプリをインストール',
    description: 'ホーム画面に追加して、より快適にご利用いただけます。',
    install: 'インストール',
    later: '後で',
    close: 'インストール案内を閉じる',
  },
  th: {
    title: 'ติดตั้งแอป',
    description: 'เพิ่มลงในหน้าจอหลักเพื่อเข้าถึงได้รวดเร็วยิ่งขึ้น',
    install: 'ติดตั้ง',
    later: 'ไว้ภายหลัง',
    close: 'ปิดคำแนะนำการติดตั้ง',
  },
}

export function PWAInstallPrompt() {
  const { language } = useLanguage()
  const copy = installCopy[language]
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | undefined

    // PWA 설치 상태 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // 설치 프롬프트 이벤트 처리
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // 사용자가 이전에 거절했는지 확인
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        // 3초 후 프롬프트 표시
        showTimer = setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    // 앱 설치 성공 이벤트
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowPrompt(false)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      if (showTimer) clearTimeout(showTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome !== 'accepted') {
        localStorage.setItem('pwa-install-dismissed', 'true')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('PWA 설치 오류:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 md:inset-x-auto md:end-4 md:w-96">
      <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="bg-white/20 p-3 rounded-lg">
                <Smartphone aria-hidden="true" className="h-6 w-6" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                {copy.title}
              </h3>
              <p className="text-sm text-white/90 mb-3">
                {copy.description}
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="bg-white text-blue-700 hover:bg-gray-100"
                >
                  <Download aria-hidden="true" className="me-1 h-4 w-4" />
                  {copy.install}
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {copy.later}
                </Button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white/80 hover:text-white"
              aria-label={copy.close}
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
