"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Building } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Artifact } from "@/types/artifact"
import { useLanguage } from "@/hooks/useLanguage"
import { getCulturalPropertyType } from "@/lib/artifact-utils"
import { CARD_STYLES, IMAGE_STYLES, ASPECT_RATIOS } from "@/lib/constants"
import { CulturalPropertyBadge } from "./cultural-property-badge"

interface ArtifactCardProps {
  artifact: Artifact
  featured?: boolean
  showHall?: boolean
}

export function ArtifactCard({ artifact, featured = false, showHall = true }: ArtifactCardProps) {
  const { language } = useLanguage()
  const culturalPropertyType = getCulturalPropertyType(artifact.culturalProperty)

  const cardClassName = `${CARD_STYLES.base} ${featured ? CARD_STYLES.featured : CARD_STYLES.regular}`

  return (
    <Link href={`/artifact/${artifact.id}`}>
      <Card className={cardClassName}>
        <CardContent className="p-0">
          <div className="relative">
            <AspectRatio ratio={ASPECT_RATIOS.card}>
              <Image
                src={artifact.image || "/placeholder.svg?height=300&width=400&text=Museum+Artifact"}
                alt={artifact.name[language]}
                fill
                className={IMAGE_STYLES.base}
                sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 33vw"}
                priority={featured}
              />
            </AspectRatio>
            {culturalPropertyType && (
              <div className="absolute top-2 right-2">
                <CulturalPropertyBadge type={culturalPropertyType} designation={artifact.culturalProperty} />
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className={`font-semibold text-gray-900 mb-1 line-clamp-1 ${featured ? 'text-base' : 'text-sm'}`}>
              {artifact.name[language]}
            </h3>
            <p className={`text-gray-600 mb-2 ${featured ? 'text-sm' : 'text-xs'}`}>
              {artifact.period[language]}
            </p>
            {featured && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {artifact.description[language]}
              </p>
            )}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-full text-xs">
                {artifact.category}
              </Badge>
              {showHall && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Building className="w-3 h-3" />
                  {artifact.hall}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}