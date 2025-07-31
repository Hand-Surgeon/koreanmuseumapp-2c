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
    thumbnail: false,
    hero: true,
  }
}

// CDN 타입 확인
function getCDNType(): 'cloudinary' | 'imgix' | 'custom' | 'local' {
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) return 'cloudinary'
  if (process.env.NEXT_PUBLIC_IMGIX_DOMAIN) return 'imgix'
  if (process.env.NEXT_PUBLIC_IMAGE_CDN_URL) return 'custom'
  return 'local'
}

// 이미지 URL 생성 함수
export function getImageUrl(
  imagePath: string, 
  variant: 'main' | 'side' | 'detail' | 'closeup' = 'main',
  format: keyof typeof imageConfig.formats = 'card'
): string {
  // 실제 이미지 경로를 사용 (variant는 _2 suffix로 처리)
  let actualImagePath = imagePath
  
  // variant가 main이 아닌 경우, _2 버전의 이미지를 사용
  if (variant !== 'main' && imagePath.includes('.jpg')) {
    actualImagePath = imagePath.replace('.jpg', '_2.jpg')
  }
  
  const { width, height, quality } = imageConfig.formats[format]
  
  const cdnType = getCDNType()
  
  // 파일명만 추출 (경로 제거)
  const imageName = actualImagePath.split('/').pop()?.replace('.jpg', '') || ''
  
  switch (cdnType) {
    case 'cloudinary':
      // Cloudinary URL 형식
      return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_limit,q_${quality},f_auto/${imageName}`
    
    case 'imgix':
      // Imgix URL 형식
      return `https://${process.env.NEXT_PUBLIC_IMGIX_DOMAIN}/${imageName}.jpg?w=${width}&h=${height}&q=${quality}&auto=format,compress`
    
    case 'custom':
      // 커스텀 CDN URL 형식
      return `${process.env.NEXT_PUBLIC_IMAGE_CDN_URL}/${imageName}?w=${width}&h=${height}&q=${quality}&fm=webp`
    
    default:
      // 로컬 이미지 사용 - 실제 경로 그대로 사용
      return actualImagePath
  }
}

// 이미지 세트 생성 함수
export function getImageSet(imagePath: string): string[] {
  return [
    getImageUrl(imagePath, 'main', 'detail'),
    getImageUrl(imagePath, 'side', 'detail'),
    getImageUrl(imagePath, 'detail', 'detail'),
    getImageUrl(imagePath, 'closeup', 'detail'),
  ].filter(url => url !== null)
}

// 블러 데이터 URL 생성 (실제로는 빌드 시 생성)
export function getBlurDataUrl(imagePath: string): string {
  // 실제 구현시 빌드 타임에 생성된 블러 데이터 URL 반환
  return imageConfig.placeholder.blur
}

// 이미지 최적화 옵션
export function getImageProps(
  imagePath: string,
  variant: 'main' | 'side' | 'detail' | 'closeup' = 'main',
  format: keyof typeof imageConfig.formats = 'card',
  useFill = false
) {
  const { width, height, quality } = imageConfig.formats[format]
  
  const baseProps = {
    src: getImageUrl(imagePath, variant, format),
    quality,
    placeholder: 'blur' as const,
    blurDataURL: getBlurDataUrl(imagePath),
    loading: (imageConfig.priority[format] ? 'eager' : 'lazy') as 'eager' | 'lazy',
  }
  
  // fill 속성을 사용하는 경우 width/height를 제거
  if (useFill) {
    return baseProps
  }
  
  // 일반적인 경우 width/height 포함
  return {
    ...baseProps,
    width,
    height,
  }
}