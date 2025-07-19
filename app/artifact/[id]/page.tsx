"use client"

import { ArrowLeft, Share, Heart, Clock, MapPin, Award, Building, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { artifacts } from "@/data/artifacts"
import { useLanguage } from "@/hooks/useLanguage"

export default async function ArtifactDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  return <ArtifactDetailClient id={resolvedParams.id} />
}

function ArtifactDetailClient({ id }: { id: string }) {
  const { t, language } = useLanguage()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  const artifact = artifacts.find((a) => a.id === Number.parseInt(id))

  if (!artifact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">유물을 찾을 수 없습니다</h2>
          <Link href="/">
            <Button>{t.backToHome}</Button>
          </Link>
        </div>
      </div>
    )
  }

  // 관련 유물 (같은 카테고리 또는 같은 시대)
  const relatedArtifacts = artifacts
    .filter(
      (a) =>
        a.id !== artifact.id &&
        (a.category === artifact.category ||
          a.period[language] === artifact.period[language] ||
          a.hall === artifact.hall),
    )
    .slice(0, 3)

  const images = [
    artifact.image,
    artifact.image.replace("&text=", "&text=측면+"),
    artifact.image.replace("&text=", "&text=세부+"),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsLiked(!isLiked)}>
              <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Image Gallery */}
        <Card className="overflow-hidden bg-white shadow-sm border-0 rounded-2xl mb-6">
          <CardContent className="p-0">
            <div className="relative">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src={images[currentImageIndex] || "/placeholder.svg?height=600&width=800&text=Museum+Artifact"}
                  alt={artifact.name[language]}
                  fill
                  className="object-contain bg-gray-50 cursor-zoom-in"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                  onClick={() => setIsImageExpanded(true)}
                />
              </AspectRatio>

              {/* Image Controls */}
              <div className="absolute top-4 left-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-white/80 backdrop-blur-sm"
                  onClick={() => setIsImageExpanded(true)}
                >
                  <ZoomIn className="w-4 h-4 mr-1" />
                  확대
                </Button>
              </div>

              {artifact.culturalProperty && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-500/90 text-white rounded-full backdrop-blur-sm">
                    <Award className="w-3 h-3 mr-1" />
                    {artifact.culturalProperty}
                  </Badge>
                </div>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all backdrop-blur-sm ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expanded Image Modal */}
        {isImageExpanded && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsImageExpanded(false)}
          >
            <div className="relative max-w-4xl max-h-full">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src={images[currentImageIndex] || "/placeholder.svg?height=800&width=1200&text=Museum+Artifact"}
                  alt={artifact.name[language]}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </AspectRatio>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 rounded-full"
                onClick={() => setIsImageExpanded(false)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <Card className="bg-white shadow-sm border-0 rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                <Badge className="rounded-full">{artifact.category}</Badge>
                <Badge variant="outline" className="rounded-full">
                  <Building className="w-3 h-3 mr-1" />
                  {artifact.hall}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{artifact.name[language]}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {artifact.period[language]}
                </div>
                {artifact.exhibitionRoom && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {artifact.exhibitionRoom}
                  </div>
                )}
              </div>
              {artifact.culturalProperty && (
                <div className="mb-3">
                  <Badge variant="outline" className="rounded-full text-red-600 border-red-200">
                    <Award className="w-3 h-3 mr-1" />
                    {artifact.culturalProperty}
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed">{artifact.description[language]}</p>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Card className="bg-white shadow-sm border-0 rounded-2xl mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.detailedInfo}</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.period}</span>
                <span className="text-gray-900 font-medium">{artifact.period[language]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.category}</span>
                <span className="text-gray-900 font-medium">{artifact.category}</span>
              </div>
              {artifact.material && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.material}</span>
                  <span className="text-gray-900 font-medium">{artifact.material[language]}</span>
                </div>
              )}
              {artifact.dimensions && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.dimensions}</span>
                  <span className="text-gray-900 font-medium">{artifact.dimensions}</span>
                </div>
              )}
              {artifact.location && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.location}</span>
                  <span className="text-gray-900 font-medium">{artifact.location[language]}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t.exhibitionRoom}</span>
                <span className="text-gray-900 font-medium">{artifact.exhibitionRoom}</span>
              </div>
              {artifact.artifactNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.artifactNumber}</span>
                  <span className="text-gray-900 font-medium">{artifact.artifactNumber}</span>
                </div>
              )}
              {artifact.culturalProperty && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.culturalPropertyDesignation}</span>
                  <span className="text-red-600 font-medium">{artifact.culturalProperty}</span>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <p className="text-gray-700 leading-relaxed">{artifact.detailedInfo[language]}</p>
            </div>
          </CardContent>
        </Card>

        {/* Related Artifacts */}
        {relatedArtifacts.length > 0 && (
          <Card className="bg-white shadow-sm border-0 rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.relatedArtifacts}</h2>
              <div className="space-y-3">
                {relatedArtifacts.map((related) => (
                  <Link key={related.id} href={`/artifact/${related.id}`}>
                    <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="relative flex-shrink-0">
                        <AspectRatio ratio={1} className="w-16">
                          <Image
                            src={related.image || "/placeholder.svg?height=100&width=100&text=Artifact"}
                            alt={related.name[language]}
                            fill
                            className="object-contain bg-gray-100 rounded-lg"
                            sizes="64px"
                          />
                        </AspectRatio>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{related.name[language]}</h3>
                        <p className="text-sm text-gray-600">{related.period[language]}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="rounded-full text-xs">
                            {related.category}
                          </Badge>
                          {related.culturalProperty && (
                            <Badge variant="outline" className="rounded-full text-xs text-red-600 border-red-200">
                              {related.culturalProperty.includes("국보") ? t.nationalTreasure : t.treasure}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-8"></div>
    </div>
  )
}
