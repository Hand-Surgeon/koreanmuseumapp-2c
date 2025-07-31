import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from "next/link"
import Image from "next/image"
import { Artifact } from "@/types/artifact"
import { useLanguage } from "@/hooks/useLanguage"
import { CulturalPropertyBadge } from "@/components/cultural-property-badge"
import { hallConfigs } from "@/lib/hall-config"
import { getImageUrl, getImageProps } from "@/lib/image-config"
import { cn } from "@/lib/utils"

interface ArtifactCardProps {
  artifact: Artifact
  featured?: boolean
  priority?: boolean
  basePath?: string
}

export function ArtifactCardOptimized({ artifact, featured = false, priority = false, basePath = "artifact" }: ArtifactCardProps) {
  const { language, t } = useLanguage()
  const hallConfig = hallConfigs[artifact.hall as keyof typeof hallConfigs]
  
  // 이미지 URL 및 속성 가져오기
  const imageUrl = getImageUrl(artifact.image || '', 'main', featured ? 'detail' : 'card')
  const imageProps = getImageProps(artifact.image || '', 'main', featured ? 'detail' : 'card')

  return (
    <Link href={`${basePath}/${artifact.id}`} className="group">
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          featured && "md:col-span-2 md:row-span-2"
        )}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <AspectRatio ratio={featured ? 16 / 9 : 1}>
              <Image
                src={imageUrl}
                alt={artifact.name[language as keyof typeof artifact.name]}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes={featured 
                  ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                }
                priority={priority}
                onError={(e) => {
                  // 이미지 로드 실패 시 플레이스홀더로 대체
                  const target = e.target as HTMLImageElement
                  target.src = `/placeholder.svg?text=${encodeURIComponent(artifact.name[language as keyof typeof artifact.name])}`
                }}
              />
              
              {/* 호버 시 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* 배지들 */}
              <div className="absolute top-2 left-2 flex gap-2">
                {artifact.featured && (
                  <Badge className="bg-yellow-500 text-white border-0">
                    추천
                  </Badge>
                )}
                {artifact.culturalProperty && (
                  <CulturalPropertyBadge
                    type={artifact.culturalProperty.includes("국보") ? "nationalTreasure" : "treasure"}
                    designation={artifact.culturalProperty}
                  />
                )}
              </div>
              
              {/* 전시관 아이콘 */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <span className="text-xl">{hallConfig.icon}</span>
                </div>
              </div>
            </AspectRatio>
          </div>
          
          <div className="p-4">
            <h3 className={cn(
              "font-semibold text-gray-900 line-clamp-2 mb-2",
              featured ? "text-lg md:text-xl" : "text-sm md:text-base"
            )}>
              {artifact.name[language as keyof typeof artifact.name]}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{artifact.period[language as keyof typeof artifact.period]}</span>
              <Badge variant="outline" className="text-xs">
                {t[hallConfig.translatedName]}
              </Badge>
            </div>
            
            {featured && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {artifact.description[language as keyof typeof artifact.description]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}