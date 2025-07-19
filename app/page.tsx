"use client"

import { useState } from "react"
import { Search, ChevronRight, Award, Building, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from "next/link"
import Image from "next/image"
import { artifacts } from "@/data/artifacts"
import { useLanguage } from "@/hooks/useLanguage"
import { LanguageSelector } from "@/components/language-selector"

export default function HomePage() {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")

  // 전시관별 통계 계산
  const hallStats = {
    고고관: {
      total: artifacts.filter((a) => a.hall === "고고관").length,
      nationalTreasures: artifacts.filter((a) => a.hall === "고고관" && a.culturalProperty?.includes("국보")).length,
      treasures: artifacts.filter((a) => a.hall === "고고관" && a.culturalProperty?.includes("보물")).length,
    },
    미술관: {
      total: artifacts.filter((a) => a.hall === "미술관").length,
      nationalTreasures: artifacts.filter((a) => a.hall === "미술관" && a.culturalProperty?.includes("국보")).length,
      treasures: artifacts.filter((a) => a.hall === "미술관" && a.culturalProperty?.includes("보물")).length,
    },
    역사관: {
      total: artifacts.filter((a) => a.hall === "역사관").length,
      nationalTreasures: artifacts.filter((a) => a.hall === "역사관" && a.culturalProperty?.includes("국보")).length,
      treasures: artifacts.filter((a) => a.hall === "역사관" && a.culturalProperty?.includes("보물")).length,
    },
    아시아관: {
      total: artifacts.filter((a) => a.hall === "아시아관").length,
      nationalTreasures: artifacts.filter((a) => a.hall === "아시아관" && a.culturalProperty?.includes("국보")).length,
      treasures: artifacts.filter((a) => a.hall === "아시아관" && a.culturalProperty?.includes("보물")).length,
    },
    기증관: {
      total: artifacts.filter((a) => a.hall === "기증관").length,
      nationalTreasures: artifacts.filter((a) => a.hall === "기증관" && a.culturalProperty?.includes("국보")).length,
      treasures: artifacts.filter((a) => a.hall === "기증관" && a.culturalProperty?.includes("보물")).length,
    },
  }

  // 전시관 설정
  const halls = [
    {
      name: "고고관",
      translatedName: t.archaeologyHall,
      description: t.archaeologyDesc,
      icon: "🏺",
      color: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
      textColor: "text-amber-800",
      stats: hallStats.고고관,
      featured: artifacts.filter((a) => a.hall === "고고관" && a.featured).slice(0, 2),
    },
    {
      name: "미술관",
      translatedName: t.artHall,
      description: t.artDesc,
      icon: "🎨",
      color: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
      textColor: "text-blue-800",
      stats: hallStats.미술관,
      featured: artifacts.filter((a) => a.hall === "미술관" && a.featured).slice(0, 2),
    },
    {
      name: "역사관",
      translatedName: t.historyHall,
      description: t.historyDesc,
      icon: "📜",
      color: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
      textColor: "text-green-800",
      stats: hallStats.역사관,
      featured: artifacts.filter((a) => a.hall === "역사관" && a.featured).slice(0, 2),
    },
    {
      name: "아시아관",
      translatedName: t.asiaHall,
      description: t.asiaDesc,
      icon: "🌏",
      color: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200",
      textColor: "text-purple-800",
      stats: hallStats.아시아관,
      featured: artifacts.filter((a) => a.hall === "아시아관" && a.featured).slice(0, 2),
    },
    {
      name: "기증관",
      translatedName: t.donationHall,
      description: t.donationDesc,
      icon: "🎁",
      color: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200",
      textColor: "text-gray-800",
      stats: hallStats.기증관,
      featured: artifacts.filter((a) => a.hall === "기증관" && a.featured).slice(0, 2),
    },
  ]

  // 검색 필터링
  const filteredHalls = halls.filter(
    (hall) =>
      hall.translatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hall.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 주요 유물들 (featured)
  const featuredArtifacts = artifacts.filter((artifact) => artifact.featured).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.nationalMuseum}</h1>
              <p className="text-gray-600 text-sm">{t.subtitle}</p>
            </div>
            <LanguageSelector />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={`${t.search}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 border-0 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Featured Artifacts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{t.masterpieces100}</h2>
            <Badge className="rounded-full">{t.featured}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {featuredArtifacts.map((artifact) => (
              <Link key={artifact.id} href={`/artifact/${artifact.id}`}>
                <Card className="overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 border-0 rounded-2xl group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <AspectRatio ratio={4 / 3}>
                        <Image
                          src={artifact.image || "/placeholder.svg?height=300&width=400&text=Museum+Artifact"}
                          alt={artifact.name[language]}
                          fill
                          className="object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          priority
                        />
                      </AspectRatio>
                      {artifact.culturalProperty && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500/90 text-white rounded-full text-xs backdrop-blur-sm">
                            <Award className="w-3 h-3 mr-1" />
                            {artifact.culturalProperty.includes("국보") ? t.nationalTreasure : t.treasure}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                        {artifact.name[language]}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{artifact.period[language]}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {artifact.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Building className="w-3 h-3" />
                          {artifact.hall}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Exhibition Halls */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.koreanCulturalHeritage}</h2>
          <div className="space-y-4">
            {filteredHalls.map((hall) => (
              <Link key={hall.name} href={`/hall/${encodeURIComponent(hall.name)}`}>
                <Card
                  className={`overflow-hidden ${hall.color} hover:shadow-lg transition-all duration-300 border rounded-2xl group`}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Hall Info */}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-3xl">{hall.icon}</div>
                          <div>
                            <h3 className={`text-xl font-bold ${hall.textColor}`}>{hall.translatedName}</h3>
                            <p className="text-sm text-gray-600 mt-1">{hall.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {t.totalItems} {hall.stats.total}점
                            </span>
                          </div>
                          {hall.stats.nationalTreasures > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-gray-700">
                                {t.nationalTreasure} {hall.stats.nationalTreasures}점
                              </span>
                            </div>
                          )}
                          {hall.stats.treasures > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-orange-500" />
                              <span className="text-sm text-gray-700">
                                {t.treasure} {hall.stats.treasures}점
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {hall.featured.slice(0, 2).map((artifact, index) => (
                              <div key={artifact.id} className="relative">
                                <AspectRatio ratio={1} className="w-12">
                                  <Image
                                    src={artifact.image || "/placeholder.svg?height=100&width=100&text=Artifact"}
                                    alt={artifact.name[language]}
                                    fill
                                    className="object-contain bg-white/50 rounded-lg"
                                    sizes="48px"
                                  />
                                </AspectRatio>
                                {artifact.culturalProperty && (
                                  <div className="absolute -top-1 -right-1">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
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

        {/* No Results */}
        {filteredHalls.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2 text-4xl">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noResults}</h3>
            <p className="text-gray-600">{t.noResultsDesc}</p>
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  )
}
