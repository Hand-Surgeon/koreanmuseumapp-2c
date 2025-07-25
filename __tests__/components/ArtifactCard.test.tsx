import { render, screen } from '@testing-library/react'
import { ArtifactCard } from '@/components/artifact-card'
import { LanguageProvider } from '@/hooks/useLanguage'
import { Artifact } from '@/types/artifact'

const mockArtifact: Artifact = {
  id: 1,
  name: {
    ko: '청자 상감운학문 매병',
    en: 'Celadon Maebyeong',
    zh: '青瓷象嵌云鹤纹梅瓶',
    ja: '青磁象嵌雲鶴文梅瓶',
    th: 'แจกันเซลาดอน'
  },
  period: {
    ko: '고려',
    en: 'Goryeo',
    zh: '高丽',
    ja: '高麗',
    th: 'โกรยอ'
  },
  category: 'ceramics',
  hall: 'art',
  description: {
    ko: '고려청자의 대표작',
    en: 'Masterpiece of Goryeo celadon',
    zh: '高丽青瓷代表作',
    ja: '高麗青磁の代表作',
    th: 'ผลงานชิ้นเอกของเซลาดอนโกรยอ'
  },
  detailedInfo: {
    ko: '상세 정보',
    en: 'Detailed info',
    zh: '详细信息',
    ja: '詳細情報',
    th: 'ข้อมูลรายละเอียด'
  },
  image: '/test-image.jpg',
  featured: true,
  exhibitionRoom: '3층 도자기실',
  culturalProperty: '국보 제68호'
}

describe('ArtifactCard', () => {
  it('유물 이름을 한국어로 표시한다', () => {
    render(
      <LanguageProvider>
        <ArtifactCard artifact={mockArtifact} />
      </LanguageProvider>
    )
    
    expect(screen.getByText('청자 상감운학문 매병')).toBeInTheDocument()
  })

  it('시대 정보를 표시한다', () => {
    render(
      <LanguageProvider>
        <ArtifactCard artifact={mockArtifact} />
      </LanguageProvider>
    )
    
    expect(screen.getByText('고려')).toBeInTheDocument()
  })

  it('국보 배지를 표시한다', () => {
    render(
      <LanguageProvider>
        <ArtifactCard artifact={mockArtifact} />
      </LanguageProvider>
    )
    
    expect(screen.getByText('국보 제68호')).toBeInTheDocument()
  })

  it('이미지를 표시한다', () => {
    render(
      <LanguageProvider>
        <ArtifactCard artifact={mockArtifact} />
      </LanguageProvider>
    )
    
    const image = screen.getByAltText('청자 상감운학문 매병')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('test-image.jpg'))
  })

  it('링크가 올바른 경로를 가리킨다', () => {
    render(
      <LanguageProvider>
        <ArtifactCard artifact={mockArtifact} />
      </LanguageProvider>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/artifact/1')
  })

  it('featured 상태일 때 추가 스타일이 적용된다', () => {
    const { container } = render(
      <LanguageProvider>
        <ArtifactCard artifact={mockArtifact} featured />
      </LanguageProvider>
    )
    
    const card = container.querySelector('.md\\:col-span-2')
    expect(card).toBeInTheDocument()
  })
})