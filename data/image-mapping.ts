// 유물별 실제 이미지 매핑
// 실제 이미지 파일명은 artifact-{id}-{variant}.jpg 형식을 따름

export const imageMapping: Record<number, {
  hasImage: boolean
  variants: ('main' | 'side' | 'detail' | 'closeup')[]
  credit?: string
  license?: string
}> = {
  // 청자 상감운학문 매병 (국보 제68호)
  1: {
    hasImage: true,
    variants: ['main', 'side', 'detail', 'closeup'],
    credit: '국립중앙박물관',
    license: 'CC BY-NC-SA 4.0'
  },
  // 금동미륵보살반가사유상 (국보 제83호)
  2: {
    hasImage: true,
    variants: ['main', 'side', 'detail'],
    credit: '국립중앙박물관',
    license: 'CC BY-NC-SA 4.0'
  },
  // 백자 달항아리 (국보 제309호)
  3: {
    hasImage: true,
    variants: ['main', 'side'],
    credit: '국립중앙박물관',
    license: 'CC BY-NC-SA 4.0'
  },
  // 훈민정음 해례본 (국보 제70호)
  4: {
    hasImage: true,
    variants: ['main', 'detail'],
    credit: '국립중앙박물관',
    license: 'CC BY-NC-SA 4.0'
  },
  // 팔만대장경 (국보 제32호)
  5: {
    hasImage: true,
    variants: ['main', 'detail', 'closeup'],
    credit: '국립중앙박물관',
    license: 'CC BY-NC-SA 4.0'
  },
  // 나머지 유물들은 기본 이미지만 제공
  ...Array.from({ length: 95 }, (_, i) => ({
    [i + 6]: {
      hasImage: true,
      variants: ['main'] as ('main')[],
      credit: '국립중앙박물관',
      license: 'CC BY-NC-SA 4.0'
    }
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
}

// 이미지 품질 설정
export const imageQuality = {
  thumbnail: { width: 300, height: 300, quality: 80 },
  card: { width: 600, height: 600, quality: 85 },
  detail: { width: 1200, height: 1200, quality: 90 },
  full: { width: 2400, height: 2400, quality: 95 },
}

// 이미지 포맷별 우선순위
export const imageFormats = ['avif', 'webp', 'jpg'] as const

// 블러 플레이스홀더 데이터 (빌드 시 생성)
export const blurDataUrls: Record<number, string> = {
  1: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  2: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  3: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  // ... 나머지 유물
}