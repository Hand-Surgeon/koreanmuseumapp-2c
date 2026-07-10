"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Locale } from "@/i18n.config"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  locale?: Locale
}

interface State {
  hasError: boolean
  error?: Error
}

const errorCopy: Record<Locale, {
  title: string
  description: string
  developerInfo: string
  reload: string
  home: string
}> = {
  ko: {
    title: "문제가 발생했습니다",
    description: "페이지를 불러오는 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    developerInfo: "개발자용 오류 정보",
    reload: "페이지 새로고침",
    home: "홈으로 이동",
  },
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred while loading this page. Please try again shortly.",
    developerInfo: "Developer error details",
    reload: "Reload page",
    home: "Go to home",
  },
  zh: {
    title: "出现问题",
    description: "加载页面时发生意外错误。请稍后重试。",
    developerInfo: "开发者错误详情",
    reload: "重新加载",
    home: "返回首页",
  },
  ja: {
    title: "問題が発生しました",
    description: "ページの読み込み中に予期しないエラーが発生しました。しばらくしてからもう一度お試しください。",
    developerInfo: "開発者向けエラー情報",
    reload: "ページを再読み込み",
    home: "ホームへ移動",
  },
  th: {
    title: "เกิดข้อผิดพลาด",
    description: "เกิดข้อผิดพลาดที่ไม่คาดคิดระหว่างโหลดหน้า โปรดลองใหม่อีกครั้งในอีกสักครู่",
    developerInfo: "รายละเอียดข้อผิดพลาดสำหรับนักพัฒนา",
    reload: "โหลดหน้าใหม่",
    home: "ไปยังหน้าหลัก",
  },
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback

    const locale = this.props.locale ?? "ko"
    const copy = errorCopy[locale]

    return (
      <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-gray-50 p-4 outline-none">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertTriangle aria-hidden="true" className="h-12 w-12 text-red-700" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
            <p className="text-gray-600">{copy.description}</p>
          </div>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="rounded-lg bg-gray-100 p-4 text-start">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                {copy.developerInfo}
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-gray-600">
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              {copy.reload}
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/${locale}`}>
                <Home aria-hidden="true" className="h-4 w-4" />
                {copy.home}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }
}
