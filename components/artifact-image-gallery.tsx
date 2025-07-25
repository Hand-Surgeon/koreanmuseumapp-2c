"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ArtifactImage } from './artifact-image'
import { getArtifactImageSet, getImageMetadata } from '@/lib/image-utils'
import { ChevronLeft, ChevronRight, ZoomIn, X, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface ArtifactImageGalleryProps {
  artifactId: number
  artifactName: string
}

export function ArtifactImageGallery({ 
  artifactId, 
  artifactName 
}: ArtifactImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const imageSet = getArtifactImageSet(artifactId)
  const metadata = getImageMetadata(artifactId)
  const variants = metadata.variants
  
  // Variant 한글 라벨
  const variantLabels: Record<string, string> = {
    main: '정면',
    side: '측면',
    detail: '세부',
    closeup: '확대'
  }
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + imageSet.length) % imageSet.length)
  }
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageSet.length)
  }
  
  const handleDownload = async () => {
    const imageUrl = imageSet[currentIndex]
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifactName}-${variants[currentIndex]}.jpg`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artifactName,
          text: `${artifactName} - 국립중앙박물관 소장품`,
          url: window.location.href
        })
      } catch (err) {
        console.error('공유 실패:', err)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* 메인 이미지 */}
      <div className="relative group">
        <ArtifactImage
          artifactId={artifactId}
          artifactName={artifactName}
          variant={variants[currentIndex]}
          size="detail"
          className="w-full rounded-lg overflow-hidden"
          priority
        />
        
        {/* 컨트롤 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 네비게이션 버튼 */}
          {imageSet.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={handlePrevious}
                aria-label="이전 이미지"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={handleNext}
                aria-label="다음 이미지"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
          
          {/* 액션 버튼 */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white"
              onClick={() => setIsFullscreen(true)}
            >
              <ZoomIn className="w-4 h-4 mr-1" />
              확대
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 hover:bg-white"
              onClick={handleDownload}
              aria-label="이미지 다운로드"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 hover:bg-white"
              onClick={handleShare}
              aria-label="공유하기"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 이미지 정보 */}
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-sm font-medium">
              {variantLabels[variants[currentIndex]]} ({currentIndex + 1}/{imageSet.length})
            </p>
            {metadata.credit && (
              <p className="text-xs opacity-75">© {metadata.credit}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 썸네일 네비게이션 */}
      {imageSet.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {variants.map((variant, index) => (
            <button
              key={variant}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                currentIndex === index 
                  ? "border-primary ring-2 ring-primary ring-offset-2" 
                  : "border-gray-200 hover:border-gray-400"
              )}
              aria-label={`${variantLabels[variant]} 이미지 보기`}
            >
              <ArtifactImage
                artifactId={artifactId}
                artifactName={artifactName}
                variant={variant}
                size="thumbnail"
                className="w-24 h-24"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2">
                {variantLabels[variant]}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* 전체화면 모달 */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-screen p-0 h-screen bg-black">
          <VisuallyHidden>
            <DialogTitle>{artifactName} 전체화면 보기</DialogTitle>
          </VisuallyHidden>
          
          <div className="relative w-full h-full flex items-center justify-center">
            <ArtifactImage
              artifactId={artifactId}
              artifactName={artifactName}
              variant={variants[currentIndex]}
              size="full"
              className="max-w-full max-h-full"
            />
            
            {/* 전체화면 컨트롤 */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-lg font-medium">{artifactName}</h3>
                  <p className="text-sm opacity-75">
                    {variantLabels[variants[currentIndex]]} ({currentIndex + 1}/{imageSet.length})
                  </p>
                </div>
                <div className="flex gap-2">
                  {imageSet.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={handlePrevious}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleNext}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsFullscreen(false)}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}