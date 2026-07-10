import Image from "next/image"
import Link from "next/link"
import { Award, Building, ChevronRight, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getCulturalPropertyType } from "@/lib/artifact-utils"
import { getHallConfig } from "@/lib/hall-config"
import type { Artifact } from "@/types/artifact"
import type { Language, Translation } from "@/types/language"

interface ServerArtifactCardProps {
  artifact: Artifact
  language: Language
  translations: Translation
  variant?: "compact" | "featured"
  showDescription?: boolean
  showHall?: boolean
  showPropertyDesignation?: boolean
  priority?: boolean
}

/**
 * 유물 데이터와 현재 언어를 서버에서 받아 렌더링하는 카드입니다.
 * 브라우저 상태나 이벤트를 사용하지 않아 유물 카탈로그가 클라이언트
 * JavaScript 번들로 직렬화되지 않습니다.
 */
export function ServerArtifactCard({
  artifact,
  language,
  translations: t,
  variant = "compact",
  showDescription = false,
  showHall = false,
  showPropertyDesignation = false,
  priority = false,
}: ServerArtifactCardProps) {
  const culturalPropertyType = getCulturalPropertyType(artifact.culturalProperty)
  const culturalPropertyLabel = culturalPropertyType === "nationalTreasure"
    ? t.nationalTreasure
    : culturalPropertyType === "treasure"
      ? t.treasure
      : null
  const displayedPropertyLabel = showPropertyDesignation
    && language === "ko"
    ? artifact.culturalProperty
    : culturalPropertyLabel
  const hallLabel = t[getHallConfig(artifact.hall).translatedName]

  if (variant === "featured") {
    return (
      <Link
        href={`/${language}/artifact/${artifact.id}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="group overflow-hidden rounded-2xl border-0 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardContent className="p-0">
            <div className="relative aspect-video">
              <Image
                src={artifact.image || "/placeholder.svg"}
                alt={artifact.name[language]}
                fill
                className="bg-gray-50 object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={priority}
              />
              <div className="absolute end-3 top-3 flex gap-2">
                {culturalPropertyLabel && (
                  <Badge className="rounded-full bg-red-700 text-xs text-white">
                    <Award className="me-1 h-3 w-3" aria-hidden="true" />
                    {culturalPropertyLabel}
                  </Badge>
                )}
                <Badge className="rounded-full bg-primary text-xs text-primary-foreground">
                  {t.featured}
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{artifact.name[language]}</h3>
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
              </div>
              <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>{artifact.period[language]}</span>
                {language === "ko" && artifact.exhibitionRoom && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {artifact.exhibitionRoom}
                  </span>
                )}
              </div>
              <p className="mb-3 line-clamp-2 text-sm text-gray-700">
                {artifact.description[language]}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full text-xs">
                  {t[artifact.category]}
                </Badge>
                {culturalPropertyLabel && (
                  <Badge variant="outline" className="rounded-full border-red-200 text-xs text-red-700">
                    {language === "ko" ? artifact.culturalProperty : culturalPropertyLabel}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link
      href={`/${language}/artifact/${artifact.id}`}
      className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="group h-full overflow-hidden rounded-2xl border-0 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <CardContent className="p-0">
          <div className="relative aspect-[4/3]">
            <Image
              src={artifact.image || "/placeholder.svg"}
              alt={artifact.name[language]}
              fill
              className="bg-gray-50 object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
            />
            {displayedPropertyLabel && (
              <Badge className="absolute end-2 top-2 max-w-[calc(100%-1rem)] rounded-full bg-red-700 text-xs text-white">
                {displayedPropertyLabel}
              </Badge>
            )}
          </div>
          <div className="p-3">
            <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-900">
              {artifact.name[language]}
            </h3>
            <p className="mb-2 text-xs text-gray-600">{artifact.period[language]}</p>
            {showDescription && (
              <p className="mb-2 line-clamp-2 text-xs text-gray-700">
                {artifact.description[language]}
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="rounded-full text-xs">
                {t[artifact.category]}
              </Badge>
              {showHall && (
                <span className="flex min-w-0 items-center gap-1 text-xs text-gray-500">
                  <Building className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{hallLabel}</span>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
