// 이미지 관리를 위한 설정
export const imageConfig = {
  // 이미지 기본 경로
  basePath: '/artworks',
  
  // 이미지 포맷
  formats: {
    thumbnail: { width: 300, height: 300, quality: 80 },
    card: { width: 600, height: 600, quality: 85 },
    detail: { width: 1200, height: 1200, quality: 90 },
    hero: { width: 1920, height: 1080, quality: 90 },
  },
  
  // 플레이스홀더 설정
  placeholder: {
    blur: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    shimmer: true,
  },
  
  // 로딩 우선순위
  priority: {
    featured: true,
    card: false,
    detail: true,
  }
}

// 이미지 URL 생성 함수
export function getImageUrl(
  artifactId: number, 
  variant: 'main' | 'side' | 'detail' | 'closeup' = 'main',
  format: keyof typeof imageConfig.formats = 'card'
): string {
  // 실제 이미지가 있는 경우
  const imageName = `artifact-${artifactId}-${variant}`
  const extension = '.jpg' // 또는 webp, avif 등
  
  // CDN을 사용하는 경우
  if (process.env.NEXT_PUBLIC_IMAGE_CDN) {
    const { width, height, quality } = imageConfig.formats[format]
    return `${process.env.NEXT_PUBLIC_IMAGE_CDN}/${imageName}?w=${width}&h=${height}&q=${quality}&fm=webp`
  }
  
  // 로컬 이미지 사용
  return `${imageConfig.basePath}/${imageName}${extension}`
}

// 이미지 세트 생성 함수
export function getImageSet(artifactId: number): string[] {
  return [
    getImageUrl(artifactId, 'main', 'detail'),
    getImageUrl(artifactId, 'side', 'detail'),
    getImageUrl(artifactId, 'detail', 'detail'),
    getImageUrl(artifactId, 'closeup', 'detail'),
  ].filter(url => url !== null)
}

// 블러 데이터 URL 생성 (실제로는 빌드 시 생성)
export function getBlurDataUrl(artifactId: number): string {
  // 실제 구현시 빌드 타임에 생성된 블러 데이터 URL 반환
  return imageConfig.placeholder.blur
}

// 이미지 최적화 옵션
export function getImageProps(
  artifactId: number,
  variant: 'main' | 'side' | 'detail' | 'closeup' = 'main',
  format: keyof typeof imageConfig.formats = 'card'
) {
  const { width, height, quality } = imageConfig.formats[format]
  
  return {
    src: getImageUrl(artifactId, variant, format),
    width,
    height,
    quality,
    placeholder: 'blur' as const,
    blurDataURL: getBlurDataUrl(artifactId),
    loading: imageConfig.priority[format] ? 'eager' : 'lazy' as const,
  }
}