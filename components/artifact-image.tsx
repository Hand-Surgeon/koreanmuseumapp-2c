"use client"

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getArtifactImageUrl, getImageMetadata } from '@/lib/image-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

interface ArtifactImageProps {
  artifactId: number
  artifactName: string
  variant?: 'main' | 'side' | 'detail' | 'closeup'
  size?: 'thumbnail' | 'card' | 'detail' | 'full'
  className?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function ArtifactImage({
  artifactId,
  artifactName,
  variant = 'main',
  size = 'card',
  className,
  priority = false,
  onLoad,
  onError
}: ArtifactImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  const imageUrl = getArtifactImageUrl(artifactId, variant, size)
  const metadata = getImageMetadata(artifactId)
  
  // 이미지 크기 설정
  const imageSizes = {
    thumbnail: { width: 300, height: 300 },
    card: { width: 600, height: 600 },
    detail: { width: 1200, height: 1200 },
    full: { width: 2400, height: 2400 }
  }
  
  const { width, height } = imageSizes[size]
  
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }
  
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // 에러 상태 UI
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center bg-gray-100 text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <AlertCircle className="w-12 h-12 mb-2" />
        <span className="text-sm">이미지를 불러올 수 없습니다</span>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <Skeleton 
          className="absolute inset-0 z-10" 
          style={{ width, height }}
        />
      )}
      
      {/* 이미지 */}
      <Image
        src={imageUrl}
        alt={`${artifactName} - ${variant}`}
        width={width}
        height={height}
        quality={85}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      
      {/* 이미지 크레딧 */}
      {metadata.credit && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-white text-xs opacity-75">
            © {metadata.credit}
          </p>
        </div>
      )}
    </div>
  )
}