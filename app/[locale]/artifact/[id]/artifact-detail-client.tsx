"use client"

import { ArrowLeft, Share, Heart, Clock, MapPin, Award, Building, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useLanguage } from "@/hooks/useLanguage"
import { Artifact } from "@/types/artifact"
import { hallConfigs } from "@/lib/hall-config"
import { CulturalPropertyBadge } from "@/components/cultural-property-badge"
import { ArtifactCard } from "@/components/artifact-card"

interface ArtifactDetailClientProps {
  artifact: Artifact
  relatedArtifacts: Artifact[]
}

export default function ArtifactDetailClient({ artifact, relatedArtifacts }: ArtifactDetailClientProps) {
  const { t, language } = useLanguage()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  const images = [
    artifact.image,
    artifact.image.replace("&text=", "&text=측면+"),
    artifact.image.replace("&text=", "&text=세부+"),
  ]

  const hallConfig = hallConfigs[artifact.hall as keyof typeof hallConfigs]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToHome}
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 이미지 섹션 */}
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <AspectRatio ratio={1} className="bg-gray-100">
                    <Image
                      src={images[currentImageIndex]}
                      alt={artifact.name[language]}
                      fill
                      className="object-contain cursor-zoom-in"
                      onClick={() => setIsImageExpanded(true)}
                      priority
                    />
                  </AspectRatio>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-4 right-4"
                    onClick={() => setIsImageExpanded(true)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                          currentImageIndex === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <Image
                          src={images[index]}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 정보 섹션 */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{artifact.name[language]}</h1>
                {artifact.culturalProperty && (
                  <CulturalPropertyBadge
                    type={artifact.culturalProperty.type}
                    number={artifact.culturalProperty.number}
                  />
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">{artifact.period[language]}</p>
              <p className="text-gray-700 leading-relaxed">{artifact.description[language]}</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t.details}</h2>
                <dl className="grid grid-cols-1 gap-4">
                  {artifact.material && (
                    <div className="flex items-center gap-3">
                      <dt className="text-gray-500 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {t.material}:
                      </dt>
                      <dd className="text-gray-900">{artifact.material[language]}</dd>
                    </div>
                  )}
                  {artifact.size && (
                    <div className="flex items-center gap-3">
                      <dt className="text-gray-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {t.size}:
                      </dt>
                      <dd className="text-gray-900">{artifact.size[language]}</dd>
                    </div>
                  )}
                  {artifact.excavationSite && (
                    <div className="flex items-center gap-3">
                      <dt className="text-gray-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {t.excavationSite}:
                      </dt>
                      <dd className="text-gray-900">{artifact.excavationSite[language]}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <dt className="text-gray-500 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {t.hall}:
                    </dt>
                    <dd>
                      <Badge variant="outline" className="gap-1">
                        <span className="text-lg">{hallConfig.icon}</span>
                        {hallConfig.name[language]}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 관련 유물 */}
        {relatedArtifacts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">{t.relatedArtifacts}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArtifacts.map((relatedArtifact) => (
                <ArtifactCard key={relatedArtifact.id} artifact={relatedArtifact} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 이미지 확대 모달 */}
      {isImageExpanded && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setIsImageExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.imageExpand}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setIsImageExpanded(false)}
            >
              <span className="text-2xl">&times;</span>
            </Button>
            <div className="relative max-w-6xl max-h-full">
              <Image
                src={images[currentImageIndex]}
                alt={artifact.name[language]}
                width={1200}
                height={1200}
                className="object-contain max-h-screen"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}