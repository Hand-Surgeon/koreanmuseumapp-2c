"use client"

import { ArrowLeft, Share, Heart, Clock, MapPin, Award, Building, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useLanguage } from "@/hooks/useLanguage"
import { Artifact } from "@/types/artifact"
import { hallConfigs } from "@/lib/hall-config"
import { CulturalPropertyBadge } from "@/components/cultural-property-badge"
import { ArtifactCard } from "@/components/artifact-card"
import { getImageSet, getImageProps } from "@/lib/image-config"
import { usePrefetch } from "@/hooks/usePrefetch"
import { ImageModal } from "@/lib/dynamic-imports"
import { BlurImage } from "@/components/blur-image"

interface ArtifactDetailClientProps {
  artifact: Artifact
  relatedArtifacts: Artifact[]
}

export default function ArtifactDetailClient({ artifact, relatedArtifacts }: ArtifactDetailClientProps) {
  const { t, language } = useLanguage()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isImageExpanded, setIsImageExpanded] = useState(false)
  const { prefetchAdjacentArtifacts } = usePrefetch()
  
  // 디버깅용
  console.log('Component rendered, isImageExpanded:', isImageExpanded)
  
  // Prefetch adjacent artifacts when component mounts
  useEffect(() => {
    prefetchAdjacentArtifacts(artifact.id)
  }, [artifact.id, prefetchAdjacentArtifacts])

  // 이미지 세트 가져오기 (main, side, detail, closeup)
  const images = getImageSet(artifact.image || '')

  const hallConfig = hallConfigs[artifact.hall as keyof typeof hallConfigs]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="../../">
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
            {/* 테스트 버튼 */}
            <Button 
              onClick={() => {
                console.log('Test button clicked, current state:', isImageExpanded);
                setIsImageExpanded(!isImageExpanded);
              }}
              className="mb-4 w-full"
            >
              테스트: 이미지 확대 토글 (현재: {isImageExpanded ? '확대됨' : '일반'})
            </Button>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <AspectRatio ratio={1} className="bg-gray-100">
                    <BlurImage
                      {...getImageProps(artifact.image || '', currentImageIndex === 0 ? 'main' : currentImageIndex === 1 ? 'side' : currentImageIndex === 2 ? 'detail' : 'closeup', 'detail', true)}
                      alt={artifact.name[language as keyof typeof artifact.name]}
                      fill
                      className="object-contain"
                      priority
                    />
                  </AspectRatio>
                  {/* 클릭 가능한 오버레이 */}
                  <div 
                    className="absolute inset-0 cursor-zoom-in"
                    onClick={() => {
                      console.log('Image clicked');
                      setIsImageExpanded(true);
                    }}
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-4 right-4 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Zoom button clicked');
                      setIsImageExpanded(true);
                    }}
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
                        <BlurImage
                          {...getImageProps(artifact.image || '', index === 0 ? 'main' : index === 1 ? 'side' : index === 2 ? 'detail' : 'closeup', 'thumbnail', true)}
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
                <h1 className="text-3xl font-bold text-gray-900">{artifact.name[language as keyof typeof artifact.name]}</h1>
                {artifact.culturalProperty && (
                  <CulturalPropertyBadge
                    type={artifact.culturalProperty.includes('국보') ? 'nationalTreasure' : 'treasure'}
                    designation={artifact.culturalProperty}
                  />
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">{artifact.period[language as keyof typeof artifact.period]}</p>
              <p className="text-gray-700 leading-relaxed">{artifact.description[language as keyof typeof artifact.description]}</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t.detailedInfo}</h2>
                <dl className="grid grid-cols-1 gap-4">
                  {artifact.material && (
                    <div className="flex items-center gap-3">
                      <dt className="text-gray-500 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {t.material}:
                      </dt>
                      <dd className="text-gray-900">{artifact.material![language as keyof typeof artifact.material]}</dd>
                    </div>
                  )}
                  {artifact.dimensions && (
                    <div className="flex items-center gap-3">
                      <dt className="text-gray-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {t.dimensions}:
                      </dt>
                      <dd className="text-gray-900">{artifact.dimensions}</dd>
                    </div>
                  )}
                  {artifact.location && (
                    <div className="flex items-center gap-3">
                      <dt className="text-gray-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {t.location}:
                      </dt>
                      <dd className="text-gray-900">{artifact.location[language as keyof typeof artifact.location]}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <dt className="text-gray-500 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {t.exhibitionRoom}:
                    </dt>
                    <dd>
                      <Badge variant="outline" className="gap-1">
                        <span className="text-lg">{hallConfig.icon}</span>
                        {t[hallConfig.translatedName]}
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
                <ArtifactCard key={relatedArtifact.id} artifact={relatedArtifact} basePath="." />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 이미지 확대 모달 */}
      <ImageModal
        isOpen={isImageExpanded}
        onClose={() => setIsImageExpanded(false)}
        imageSrc={images[currentImageIndex]}
        imageAlt={artifact.name[language as keyof typeof artifact.name]}
      />
    </div>
  )
}