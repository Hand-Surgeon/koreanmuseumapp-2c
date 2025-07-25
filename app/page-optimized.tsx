"use client"

import { useState, useMemo, useCallback } from "react"
import { Search, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from "next/link"
import Image from "next/image"
import { artifacts } from "@/data/artifacts"
import { useLanguage } from "@/hooks/useLanguage"
import { LanguageSelector } from "@/components/language-selector"
import { ArtifactCard } from "@/components/artifact-card"
import { HallStatistics } from "@/components/hall-statistics"
import { calculateHallStats, filterArtifacts } from "@/lib/artifact-utils"
import { hallConfigs } from "@/lib/hall-config"
import { IMAGE_STYLES } from "@/lib/constants"
import { Translation } from "@/types/language"
import debounce from "lodash.debounce"

export default function Home() {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [selectedHall, setSelectedHall] = useState<string | null>(null)

  // Debounced 검색 함수
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term)
    }, 300),
    []
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = e.target.value.replace(/[<>]/g, '') // XSS 방지
      setInputValue(sanitizedValue)
      debouncedSearch(sanitizedValue)
    },
    [debouncedSearch]
  )

  // 전시관 통계 메모이제이션
  const hallStats = useMemo(() => calculateHallStats(artifacts), [])

  // 필터링된 유물 메모이제이션
  const filteredArtifacts = useMemo(() => {
    if (!searchTerm) return []
    return filterArtifacts(artifacts, searchTerm, t.all, language, t.all)
  }, [searchTerm, language, t.all])

  // 추천 유물 메모이제이션
  const featuredArtifacts = useMemo(() => 
    artifacts.filter((artifact) => artifact.featured).slice(0, 3),
    []
  )

  // 전시관별 유물 메모이제이션
  const hallArtifacts = useMemo(() => {
    if (!selectedHall) return []
    return artifacts.filter((artifact) => artifact.hall === selectedHall).slice(0, 12)
  }, [selectedHall])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{t.museumName}</h1>
              <Badge variant="secondary">{t.treasures100}</Badge>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              className="pl-10"
              value={inputValue}
              onChange={handleSearchChange}
              aria-label={t.searchPlaceholder}
              maxLength={100}
            />
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {t.searchResults} ({filteredArtifacts.length})
            </h2>
            {filteredArtifacts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredArtifacts.map((artifact) => (
                  <ArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">{t.noResults}</p>
            )}
          </div>
        )}

        {/* Main Content - Show when not searching */}
        {!searchTerm && (
          <>
            {/* Hall Statistics */}
            <HallStatistics stats={hallStats} />

            {/* Featured Artifacts */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t.featuredArtifacts}</h2>
                <Link href="/artifacts" className="text-primary hover:underline flex items-center gap-1">
                  {t.viewAll}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArtifacts.map((artifact) => (
                  <ArtifactCard key={artifact.id} artifact={artifact} featured />
                ))}
              </div>
            </section>

            {/* Halls Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.exhibitionHalls}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Object.entries(hallConfigs).map(([key, config]) => (
                  <Card
                    key={key}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedHall(selectedHall === key ? null : key)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{config.icon}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{config.name[language]}</h3>
                            <p className="text-sm text-gray-500">{config.englishName}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{hallStats[key]}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {config.description[language] || 
                         t[`${config.translatedName.replace('Hall', 'Desc')}` as keyof Translation]}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Hall Artifacts */}
              {selectedHall && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">
                    {hallConfigs[selectedHall as keyof typeof hallConfigs].name[language]} {t.collection}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {hallArtifacts.map((artifact) => (
                      <ArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}