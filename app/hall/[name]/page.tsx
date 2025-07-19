"use client"

import { useState } from "react"
import { ArrowLeft, Search, Filter, ChevronRight, Award, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from "next/link"
import Image from "next/image"
import { artifacts } from "@/data/artifacts"
import { useLanguage } from "@/hooks/useLanguage"

export default function HallPage({ params }: { params: { name: string } }) {
  const { t, language } = useLanguage()
  const hallName = decodeURIComponent(params.name)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(t.all)
  const [showFilters, setShowFilters] = useState(false)

  // 해당 전시관의 유물들 필터링
  const hallArtifacts = artifacts.filter((artifact) => artifact.hall === hallName)

  const filteredArtifacts = hallArtifacts.filter((artifact) => {
    const matchesSearch =
      artifact.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.description[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.period[language].toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === t.all || artifact.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredArtifacts = filteredArtifacts.filter((artifact) => artifact.featured)
  const regularArtifacts = filteredArtifacts.filter((artifact) => !artifact.featured)

  // 해당 전시관에서 사용되는 카테고리들만 추출
  const hallCategories = [t.all, ...new Set(hallArtifacts.map((a) => a.category))]

  // 전시관별 설정
  const hallConfig = {
    고고관: {
      translatedName: t.archaeologyHall,
      icon: "🏺",
      color: "bg-amber-50 border-amber-200",
      textColor: "text-amber-800",
      badgeColor: "bg-amber-500",
    },
    미술관: {
      translatedName: t.artHall,
      icon: "🎨",
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-800",
      badgeColor: "bg-blue-500",
    },
    역사관: {
      translatedName: t.historyHall,
      icon: "📜",
      color: "bg-green-50 border-green-200",
      textColor: "text-green-800",
      badgeColor: "bg-green-500",
    },
    아시아관: {
      translatedName: t.asiaHall,
      icon: "🌏",
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-800",
      badgeColor: "bg-purple-500",
    },
    기증관: {
      translatedName: t.donationHall,
      icon: "🎁",
      color: "bg-gray-50 border-gray-200",
      textColor: "text-gray-800",
      badgeColor: "bg-gray-500",
    },
  }

  const config = hallConfig[hallName as keyof typeof hallConfig] || hallConfig["고고관"]

  // 통계
  const nationalTreasures = hallArtifacts.filter((a) => a.culturalProperty?.includes("국보")).length
  const treasures = hallArtifacts.filter((a) => a.culturalProperty?.includes("보물")).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${config.color} border-b sticky top-0 z-50`}>
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{config.icon}</div>
              <div>
                <h1 className={`text-xl font-bold ${config.textColor}`}>{config.translatedName}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>총 {filteredArtifacts.length}점</span>
                  {nationalTreasures > 0 && (
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-red-500" />
                      <span>
                        {t.nationalTreasure} {nationalTreasures}점
                      </span>
                    </div>
                  )}
                  {treasures > 0 && (
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-orange-500" />
                      <span>
                        {t.treasure} {treasures}점
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={`${t.search}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 border-0 rounded-xl"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="rounded-full">
              <Filter className="w-4 h-4 mr-2" />
              {t.filter}
            </Button>
            {selectedCategory !== t.all && (
              <Badge variant="secondary" className="rounded-full">
                {selectedCategory}
              </Badge>
            )}
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="pb-2">
              <div className="flex gap-2 overflow-x-auto">
                {hallCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Featured Section */}
        {featuredArtifacts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.mainWorks}</h2>
            <div className="space-y-4">
              {featuredArtifacts.map((artifact) => (
                <Link key={artifact.id} href={`/artifact/${artifact.id}`}>
                  <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0 rounded-2xl group">
                    <CardContent className="p-0">
                      <div className="relative">
                        <AspectRatio ratio={16 / 9}>
                          <Image
                            src={artifact.image || "/placeholder.svg?height=400&width=600&text=Museum+Artifact"}
                            alt={artifact.name[language]}
                            fill
                            className="object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                          />
                        </AspectRatio>
                        <div className="absolute top-3 right-3 flex gap-2">
                          {artifact.culturalProperty && (
                            <Badge className="bg-red-500/90 text-white rounded-full text-xs backdrop-blur-sm">
                              <Award className="w-3 h-3 mr-1" />
                              {artifact.culturalProperty.includes("국보") ? t.nationalTreasure : t.treasure}
                            </Badge>
                          )}
                          <Badge className={`${config.badgeColor}/90 text-white rounded-full backdrop-blur-sm`}>
                            {t.featured}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{artifact.name[language]}</h3>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>{artifact.period[language]}</span>
                          {artifact.exhibitionRoom && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {artifact.exhibitionRoom}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{artifact.description[language]}</p>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="rounded-full text-xs">
                            {artifact.category}
                          </Badge>
                          {artifact.culturalProperty && (
                            <Badge variant="outline" className="rounded-full text-xs text-red-600 border-red-200">
                              {artifact.culturalProperty}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Artifacts Grid */}
        {regularArtifacts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {featuredArtifacts.length > 0 ? t.moreArtifacts : t.artifactList}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {regularArtifacts.map((artifact) => (
                <Link key={artifact.id} href={`/artifact/${artifact.id}`}>
                  <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0 rounded-2xl group">
                    <CardContent className="p-0">
                      <div className="relative">
                        <AspectRatio ratio={4 / 3}>
                          <Image
                            src={artifact.image || "/placeholder.svg?height=300&width=400&text=Museum+Artifact"}
                            alt={artifact.name[language]}
                            fill
                            className="object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </AspectRatio>
                        {artifact.culturalProperty && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-500/90 text-white rounded-full text-xs backdrop-blur-sm">
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
                        <p className="text-xs text-gray-700 line-clamp-2 mb-2">{artifact.description[language]}</p>
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {artifact.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredArtifacts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2 text-4xl">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noResults}</h3>
            <p className="text-gray-600 mb-4">{t.noResultsDesc}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory(t.all)
              }}
              className="rounded-full"
            >
              {t.resetFilters}
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  )
}
