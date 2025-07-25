"use client"

import { useState, useMemo } from "react"
import { Heart, Download, Share2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { artifacts } from "@/data/artifacts"
import { useLanguage } from "@/hooks/useLanguage"
import { useFavorites } from "@/contexts/favorites-context"
import { ArtifactCard } from "@/components/artifact-card"
import { SearchHeader } from "@/components/search-header"
import { filterArtifacts } from "@/lib/artifact-utils"
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

export default function FavoritesPage() {
  const { t, language } = useLanguage()
  const { favorites, clearFavorites, favoritesCount } = useFavorites()
  const [searchTerm, setSearchTerm] = useState("")

  // 즐겨찾기한 유물들 가져오기
  const favoriteArtifacts = useMemo(() => {
    return artifacts.filter(artifact => favorites.includes(artifact.id))
  }, [favorites])

  // 검색 필터링
  const filteredArtifacts = useMemo(() => {
    if (!searchTerm) return favoriteArtifacts
    return filterArtifacts(favoriteArtifacts, searchTerm, t.all, language, t.all)
  }, [favoriteArtifacts, searchTerm, language, t.all])

  // 즐겨찾기 목록 내보내기
  const handleExport = () => {
    const data = favoriteArtifacts.map(artifact => ({
      id: artifact.id,
      name: artifact.name[language],
      period: artifact.period[language],
      category: artifact.category,
      hall: artifact.hall,
      url: `${window.location.origin}/artifact/${artifact.id}`
    }))

    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `museum-favorites-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 즐겨찾기 목록 공유
  const handleShare = async () => {
    const shareText = favoriteArtifacts
      .map(artifact => `• ${artifact.name[language]}`)
      .join('\n')
    
    const fullText = `국립중앙박물관 명품 100선 - 나의 즐겨찾기 (${favoritesCount}점)\n\n${shareText}\n\n${window.location.origin}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: '나의 즐겨찾기 목록',
          text: fullText,
          url: window.location.href
        })
      } catch (err) {
        // 대체 방법: 클립보드에 복사
        await navigator.clipboard.writeText(fullText)
        alert('링크가 클립보드에 복사되었습니다.')
      }
    } else {
      await navigator.clipboard.writeText(fullText)
      alert('목록이 클립보드에 복사되었습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← 돌아가기
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500 fill-current" />
                <h1 className="text-2xl font-bold text-gray-900">
                  나의 즐겨찾기
                </h1>
                <span className="text-sm text-gray-500">
                  ({favoritesCount}점)
                </span>
              </div>
            </div>
            
            {favoritesCount > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">내보내기</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">공유하기</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">모두 삭제</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>즐겨찾기 모두 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        모든 즐겨찾기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearFavorites}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        모두 삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favoritesCount === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                즐겨찾기가 비어있습니다
              </h2>
              <p className="text-gray-500 mb-6">
                마음에 드는 유물을 즐겨찾기에 추가해보세요
              </p>
              <Link href="/">
                <Button>유물 둘러보기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 검색 */}
            <div className="mb-8">
              <SearchHeader onSearchChange={setSearchTerm} />
            </div>

            {/* 즐겨찾기 목록 */}
            {filteredArtifacts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredArtifacts.map((artifact) => (
                  <ArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-gray-500">
                    검색 결과가 없습니다
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}