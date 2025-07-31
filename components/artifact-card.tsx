"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Building } from "lucide-react"
import Link from "next/link"
import { Artifact } from "@/types/artifact"
import { useLanguage } from "@/hooks/useLanguage"
import { getCulturalPropertyType } from "@/lib/artifact-utils"
import { CARD_STYLES, IMAGE_STYLES, ASPECT_RATIOS } from "@/lib/constants"
import { CulturalPropertyBadge } from "./cultural-property-badge"
import { getImageProps } from "@/lib/image-config"
import { usePrefetch } from "@/hooks/usePrefetch"
import { BlurImage } from "@/components/blur-image"

interface ArtifactCardProps {
  artifact: Artifact
  featured?: boolean
  showHall?: boolean
  basePath?: string
  'data-testid'?: string
}

export function ArtifactCard({ artifact, featured = false, showHall = true, basePath = "", 'data-testid': dataTestId }: ArtifactCardProps) {
  const { language } = useLanguage()
  const culturalPropertyType = getCulturalPropertyType(artifact.culturalProperty)
  const { prefetchOnHover } = usePrefetch()

  const cardClassName = `${CARD_STYLES.base} ${featured ? CARD_STYLES.featured : CARD_STYLES.regular}`

  const handleMouseEnter = () => {
    prefetchOnHover(artifact.id)
  }

  return (
    <Link href={`${basePath ? basePath + '/' : ''}artifact/${artifact.id}`}>
      <Card 
        className={cardClassName}
        onMouseEnter={handleMouseEnter}
        data-artifact-id={artifact.id}
        data-testid={dataTestId}>
        <CardContent className="p-0">
          <div className="relative">
            <AspectRatio ratio={ASPECT_RATIOS.card}>
              <BlurImage
                src={artifact.image || '/placeholder.svg'}
                alt={artifact.name[language as keyof typeof artifact.name]}
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
              {artifact.name[language as keyof typeof artifact.name]}
            </h3>
            <p className={`text-gray-600 mb-2 ${featured ? 'text-sm' : 'text-xs'}`}>
              {artifact.period[language as keyof typeof artifact.period]}
            </p>
            {featured && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {artifact.description[language as keyof typeof artifact.description]}
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