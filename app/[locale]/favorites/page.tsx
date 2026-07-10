"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Download, Heart, Share2, Trash2 } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"
import { useFavorites } from "@/contexts/favorites-context"
import { FavoriteArtifactCard } from "@/components/favorite-artifact-card"
import { SearchHeader } from "@/components/search-header"
import type { FavoriteArtifactSummary } from "@/types/artifact"
import type { Language } from "@/types/language"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FavoriteCopy {
  export: string
  share: string
  clearAll: string
  clearDescription: string
  cancel: string
  emptyTitle: string
  emptyDescription: string
  browse: string
  exportLabel: string
  shareLabel: string
  clearLabel: string
  shareTitle: string
  shareIntro: (count: string) => string
  copied: string
  copyFailed: string
  loading: string
  loadFailed: string
  retry: string
}

const favoriteCopy: Record<Language, FavoriteCopy> = {
  ko: {
    export: "내보내기",
    share: "공유하기",
    clearAll: "모두 삭제",
    clearDescription: "모든 즐겨찾기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    cancel: "취소",
    emptyTitle: "즐겨찾기가 비어 있습니다",
    emptyDescription: "마음에 드는 유물을 즐겨찾기에 추가해 보세요.",
    browse: "유물 둘러보기",
    exportLabel: "즐겨찾기 목록 내보내기",
    shareLabel: "즐겨찾기 목록 공유하기",
    clearLabel: "즐겨찾기 모두 삭제",
    shareTitle: "나의 즐겨찾기 목록",
    shareIntro: (count) => `국립중앙박물관 대표 유물 - 나의 즐겨찾기 (${count})`,
    copied: "목록을 클립보드에 복사했습니다.",
    copyFailed: "목록을 복사하지 못했습니다.",
    loading: "즐겨찾기를 불러오는 중입니다.",
    loadFailed: "즐겨찾기를 불러오지 못했습니다.",
    retry: "다시 시도",
  },
  en: {
    export: "Export",
    share: "Share",
    clearAll: "Clear all",
    clearDescription: "Remove every favorite? This action cannot be undone.",
    cancel: "Cancel",
    emptyTitle: "Your favorites are empty",
    emptyDescription: "Add artifacts you would like to revisit.",
    browse: "Browse artifacts",
    exportLabel: "Export favorites",
    shareLabel: "Share favorites",
    clearLabel: "Clear all favorites",
    shareTitle: "My favorites",
    shareIntro: (count) => `National Museum of Korea masterpieces - My favorites (${count})`,
    copied: "The list was copied to the clipboard.",
    copyFailed: "The list could not be copied.",
    loading: "Loading favorites.",
    loadFailed: "Favorites could not be loaded.",
    retry: "Try again",
  },
  zh: {
    export: "导出",
    share: "分享",
    clearAll: "全部删除",
    clearDescription: "是否删除所有收藏？此操作无法撤销。",
    cancel: "取消",
    emptyTitle: "收藏夹为空",
    emptyDescription: "将您喜欢的文物加入收藏夹。",
    browse: "浏览文物",
    exportLabel: "导出收藏列表",
    shareLabel: "分享收藏列表",
    clearLabel: "删除所有收藏",
    shareTitle: "我的收藏",
    shareIntro: (count) => `韩国国立中央博物馆精品 - 我的收藏 (${count})`,
    copied: "列表已复制到剪贴板。",
    copyFailed: "无法复制列表。",
    loading: "正在加载收藏。",
    loadFailed: "无法加载收藏。",
    retry: "重试",
  },
  ja: {
    export: "書き出し",
    share: "共有",
    clearAll: "すべて削除",
    clearDescription: "お気に入りをすべて削除しますか？この操作は元に戻せません。",
    cancel: "キャンセル",
    emptyTitle: "お気に入りは空です",
    emptyDescription: "また見たい遺物をお気に入りに追加しましょう。",
    browse: "遺物を見る",
    exportLabel: "お気に入り一覧を書き出す",
    shareLabel: "お気に入り一覧を共有",
    clearLabel: "お気に入りをすべて削除",
    shareTitle: "私のお気に入り",
    shareIntro: (count) => `韓国国立中央博物館の名品 - 私のお気に入り (${count})`,
    copied: "一覧をクリップボードにコピーしました。",
    copyFailed: "一覧をコピーできませんでした。",
    loading: "お気に入りを読み込んでいます。",
    loadFailed: "お気に入りを読み込めませんでした。",
    retry: "再試行",
  },
  th: {
    export: "ส่งออก",
    share: "แชร์",
    clearAll: "ลบทั้งหมด",
    clearDescription: "ลบรายการโปรดทั้งหมดหรือไม่ การกระทำนี้ยกเลิกไม่ได้",
    cancel: "ยกเลิก",
    emptyTitle: "ยังไม่มีรายการโปรด",
    emptyDescription: "เพิ่มโบราณวัตถุที่คุณต้องการกลับมาชมอีกครั้ง",
    browse: "ชมโบราณวัตถุ",
    exportLabel: "ส่งออกรายการโปรด",
    shareLabel: "แชร์รายการโปรด",
    clearLabel: "ลบรายการโปรดทั้งหมด",
    shareTitle: "รายการโปรดของฉัน",
    shareIntro: (count) => `ผลงานชิ้นเอกแห่งชาติเกาหลี - รายการโปรด (${count})`,
    copied: "คัดลอกรายการไปยังคลิปบอร์ดแล้ว",
    copyFailed: "ไม่สามารถคัดลอกรายการได้",
    loading: "กำลังโหลดรายการโปรด",
    loadFailed: "ไม่สามารถโหลดรายการโปรดได้",
    retry: "ลองใหม่",
  },
}

export default function FavoritesPage() {
  const { t, language } = useLanguage()
  const { favorites, clearFavorites, favoritesCount } = useFavorites()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [favoriteArtifacts, setFavoriteArtifacts] = useState<FavoriteArtifactSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [retryToken, setRetryToken] = useState(0)
  const copy = favoriteCopy[language]
  const formattedCount = new Intl.NumberFormat(language).format(favoritesCount)

  useEffect(() => {
    if (favorites.length === 0) {
      setFavoriteArtifacts([])
      setIsLoading(false)
      setLoadError(false)
      return
    }

    const controller = new AbortController()
    const query = new URLSearchParams({
      ids: favorites.join(","),
      locale: language,
    })

    setIsLoading(true)
    setLoadError(false)

    void fetch(`/api/artifacts?${query}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Artifact request failed: ${response.status}`)

        const data: unknown = await response.json()
        if (!Array.isArray(data)) throw new Error("Invalid artifact response")
        setFavoriteArtifacts(data as FavoriteArtifactSummary[])
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setFavoriteArtifacts([])
        setLoadError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [favorites, language, retryToken])

  const filteredArtifacts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase(language)
    if (!normalizedSearch) return favoriteArtifacts

    return favoriteArtifacts.filter((artifact) => (
      [artifact.name, artifact.period, artifact.description, artifact.category, artifact.hall]
        .some((value) => value.toLocaleLowerCase(language).includes(normalizedSearch))
    ))
  }, [favoriteArtifacts, language, searchTerm])

  const handleExport = () => {
    const data = favoriteArtifacts.map((artifact) => ({
      id: artifact.id,
      name: artifact.name,
      period: artifact.period,
      category: artifact.category,
      hall: artifact.hall,
      url: `${window.location.origin}/${language}/artifact/${artifact.id}`,
      provenance: artifact.provenance,
    }))
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    )
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `museum-favorites-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const copyShareText = async (text: string) => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable")
      await navigator.clipboard.writeText(text)
      setStatusMessage(copy.copied)
    } catch {
      setStatusMessage(copy.copyFailed)
    }
  }

  const handleShare = async () => {
    const itemList = favoriteArtifacts
      .map((artifact) => (
        `• ${artifact.name}${artifact.provenance ? ` — ${artifact.provenance.attribution}` : ""}`
      ))
      .join("\n")
    const fullText = `${copy.shareIntro(formattedCount)}\n\n${itemList}\n\n${window.location.origin}/${language}`

    if (!navigator.share) {
      await copyShareText(fullText)
      return
    }

    try {
      await navigator.share({
        title: copy.shareTitle,
        text: fullText,
        url: window.location.href,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      await copyShareText(fullText)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${language}`}>← {t.back}</Link>
              </Button>
              <div className="flex items-center gap-2">
                <Heart aria-hidden="true" className="h-6 w-6 fill-current text-red-700" />
                <h1 className="text-2xl font-bold text-gray-900">{t.favorites}</h1>
                <span className="text-sm text-gray-500">({formattedCount})</span>
              </div>
            </div>

            {favoritesCount > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || favoriteArtifacts.length === 0} className="gap-2" aria-label={copy.exportLabel}>
                  <Download aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden sm:inline">{copy.export}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} disabled={isLoading || favoriteArtifacts.length === 0} className="gap-2" aria-label={copy.shareLabel}>
                  <Share2 aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden sm:inline">{copy.share}</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-red-700 hover:bg-red-50" aria-label={copy.clearLabel}>
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                      <span className="hidden sm:inline">{copy.clearAll}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{copy.clearAll}</AlertDialogTitle>
                      <AlertDialogDescription>{copy.clearDescription}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={clearFavorites} className="bg-red-700 hover:bg-red-800">
                        {copy.clearAll}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          <p role="status" aria-live="polite" className="sr-only">{statusMessage}</p>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 outline-none sm:px-6 lg:px-8">
        {favoritesCount === 0 ? (
          <Card className="p-6 text-center sm:p-12">
            <CardContent>
              <Heart aria-hidden="true" className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">{copy.emptyTitle}</h2>
              <p className="mb-6 text-gray-500">{copy.emptyDescription}</p>
              <Button asChild>
                <Link href={`/${language}`}>{copy.browse}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <SearchHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </div>
            {isLoading ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <p role="status" className="text-gray-600">{copy.loading}</p>
                </CardContent>
              </Card>
            ) : loadError ? (
              <Card className="p-8 text-center">
                <CardContent className="space-y-4">
                  <p role="alert" className="text-gray-700">{copy.loadFailed}</p>
                  <Button variant="outline" onClick={() => setRetryToken((value) => value + 1)}>
                    {copy.retry}
                  </Button>
                </CardContent>
              </Card>
            ) : filteredArtifacts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredArtifacts.map((artifact) => (
                  <FavoriteArtifactCard key={artifact.id} artifact={artifact} language={language} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-gray-500">{t.noResults}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
