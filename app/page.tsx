"use client"

import { useState } from "react"
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

export default function HomePage() {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")

  // 전시관별 데이터 준비
  const halls = Object.entries(hallConfigs).map(([hallName, config]) => {
    const hallArtifacts = artifacts.filter(a => a.hall === hallName)
    const stats = calculateHallStats(hallArtifacts)
    const featured = hallArtifacts.filter(a => a.featured).slice(0, 2)
    
    return {
      name: hallName,
      translatedName: t[config.translatedName],
      description: t[`${config.translatedName.replace('Hall', 'Desc')}` as keyof Translation],
      icon: config.icon,
      color: `bg-gradient-to-br from-${config.color.split(' ')[0].replace('bg-', '')} to-${config.color.split(' ')[0].replace('bg-', '').replace('50', '100')} ${config.color.split(' ')[1]}`,
      textColor: config.textColor,
      stats,
      featured,
    }
  })

  // 검색어에 따른 유물 필터링
  const filteredArtifacts = searchTerm
    ? filterArtifacts(artifacts, searchTerm, t.all, language, t.all)
    : []

  // 대표 유물 (featured artifacts)
  const featuredArtifacts = artifacts.filter(a => a.featured).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.nationalMuseum}</h1>
              <p className="text-gray-600 text-sm">{t.koreanCulturalHeritage}</p>
            </div>
            <LanguageSelector />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 border-0 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Search Results */}
        {searchTerm && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t.search} ({filteredArtifacts.length})
            </h2>
            {filteredArtifacts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredArtifacts.map((artifact) => (
                  <ArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{t.noResults}</p>
              </div>
            )}
          </div>
        )}

        {/* Featured Artifacts */}
        {!searchTerm && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{t.featured}</h2>
                <Badge className="rounded-full">{t.featured}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {featuredArtifacts.map((artifact) => (
                  <ArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </div>
            </div>

            {/* Exhibition Halls */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.specialExhibition}</h2>
              <div className="space-y-4">
                {halls.map((hall) => (
                  <Link key={hall.name} href={`/hall/${encodeURIComponent(hall.name)}`}>
                    <Card className={`${hall.color} hover:shadow-lg transition-all duration-300 border rounded-2xl group`}>
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="flex-1 p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-3xl">{hall.icon}</div>
                              <div>
                                <h3 className={`text-xl font-bold ${hall.textColor}`}>{hall.translatedName}</h3>
                                <p className="text-sm text-gray-600 mt-1">{hall.description}</p>
                              </div>
                            </div>
                            <div className="mb-4">
                              <HallStatistics stats={hall.stats} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                {hall.featured.map((artifact, index) => (
                                  <div key={artifact.id} className="relative">
                                    <AspectRatio ratio={1} className="w-12">
                                      <Image
                                        src={artifact.image || "/placeholder.svg"}
                                        alt={artifact.name[language]}
                                        fill
                                        className={IMAGE_STYLES.preview}
                                        sizes="48px"
                                      />
                                    </AspectRatio>
                                    {artifact.culturalProperty && (
                                      <div className="absolute -top-1 -right-1">
                                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8" />
    </div>
  )
}