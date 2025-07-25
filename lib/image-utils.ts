import { imageMapping, imageQuality, imageFormats } from '@/data/image-mapping'

// 이미지 URL 생성 (실제 이미지 우선, 없으면 플레이스홀더)
export function getArtifactImageUrl(
  artifactId: number,
  variant: 'main' | 'side' | 'detail' | 'closeup' = 'main',
  size: keyof typeof imageQuality = 'card'
): string {
  const mapping = imageMapping[artifactId]
  
  // 매핑 정보가 있고 해당 variant가 존재하는 경우
  if (mapping?.hasImage && mapping.variants.includes(variant)) {
    return `/artworks/artifact-${artifactId}-${variant}.jpg`
  }
  
  // variant가 없으면 main 이미지로 대체
  if (mapping?.hasImage && variant !== 'main' && mapping.variants.includes('main')) {
    return `/artworks/artifact-${artifactId}-main.jpg`
  }
  
  // 실제 이미지가 없으면 플레이스홀더
  return `https://via.placeholder.com/${imageQuality[size].width}x${imageQuality[size].height}?text=Artifact+${artifactId}`
}

// 이미지 세트 생성 (사용 가능한 모든 variant)
export function getArtifactImageSet(artifactId: number): string[] {
  const mapping = imageMapping[artifactId]
  
  if (!mapping?.hasImage) {
    return [getArtifactImageUrl(artifactId, 'main', 'detail')]
  }
  
  return mapping.variants.map(variant => 
    getArtifactImageUrl(artifactId, variant, 'detail')
  )
}

// srcset 생성 (반응형 이미지)
export function generateSrcSet(
  artifactId: number,
  variant: 'main' | 'side' | 'detail' | 'closeup' = 'main'
): string {
  const baseUrl = getArtifactImageUrl(artifactId, variant, 'full')
  const sizes = Object.entries(imageQuality)
  
  return sizes
    .map(([_, config]) => 
      `${baseUrl}?w=${config.width} ${config.width}w`
    )
    .join(', ')
}

// picture 요소용 sources 생성
export function generatePictureSources(
  artifactId: number,
  variant: 'main' | 'side' | 'detail' | 'closeup' = 'main'
) {
  const baseUrl = getArtifactImageUrl(artifactId, variant, 'full')
  
  return imageFormats.map(format => ({
    type: `image/${format}`,
    srcSet: generateSrcSet(artifactId, variant),
    format
  }))
}

// 이미지 메타데이터 가져오기
export function getImageMetadata(artifactId: number) {
  const mapping = imageMapping[artifactId]
  
  return {
    hasImage: mapping?.hasImage || false,
    variants: mapping?.variants || ['main'],
    credit: mapping?.credit || '국립중앙박물관',
    license: mapping?.license || 'CC BY-NC-SA 4.0'
  }
}

// 이미지 로드 상태 관리를 위한 훅
export function useImageLoadingState() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  
  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages(prev => new Set(prev).add(src))
  }, [])
  
  const handleImageError = useCallback((src: string) => {
    setFailedImages(prev => new Set(prev).add(src))
  }, [])
  
  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src)
  }, [loadedImages])
  
  const isImageFailed = useCallback((src: string) => {
    return failedImages.has(src)
  }, [failedImages])
  
  return {
    handleImageLoad,
    handleImageError,
    isImageLoaded,
    isImageFailed
  }
}

import { useState, useCallback } from 'react'