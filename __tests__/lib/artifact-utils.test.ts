import {
  calculateHallStats,
  filterArtifacts,
  getCulturalPropertyType,
} from '@/lib/artifact-utils'
import { Artifact } from '@/types/artifact'

const mockArtifacts: Artifact[] = [
  {
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
    hall: '미술관',
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
    image: '/test1.jpg',
    featured: true,
    exhibitionRoom: '3층',
    culturalProperty: '국보 제68호'
  },
  {
    id: 2,
    name: {
      ko: '금동미륵보살반가사유상',
      en: 'Gilt-bronze Maitreya',
      zh: '金铜弥勒菩萨半跏思惟像',
      ja: '金銅弥勒菩薩半跏思惟像',
      th: 'รูปพระโพธิสัตว์'
    },
    period: {
      ko: '삼국시대',
      en: 'Three Kingdoms',
      zh: '三国时代',
      ja: '三国時代',
      th: 'สามอาณาจักร'
    },
    category: 'sculpture',
    hall: '고고관',
    description: {
      ko: '삼국시대 불교 조각의 걸작',
      en: 'Masterpiece of Three Kingdoms Buddhist sculpture',
      zh: '三国时代佛教雕塑杰作',
      ja: '三国時代仏教彫刻の傑作',
      th: 'ผลงานชิ้นเอกของประติมากรรมพุทธศาสนา'
    },
    detailedInfo: {
      ko: '상세 정보',
      en: 'Detailed info',
      zh: '详细信息',
      ja: '詳細情報',
      th: 'ข้อมูลรายละเอียด'
    },
    image: '/test2.jpg',
    featured: false,
    exhibitionRoom: '2층',
    culturalProperty: '국보 제83호'
  },
  {
    id: 3,
    name: {
      ko: '백자 달항아리',
      en: 'White Porcelain Moon Jar',
      zh: '白瓷月罐',
      ja: '白磁月壺',
      th: 'ไหดวงจันทร์'
    },
    period: {
      ko: '조선',
      en: 'Joseon',
      zh: '朝鲜',
      ja: '朝鮮',
      th: 'โชซอน'
    },
    category: 'ceramics',
    hall: '미술관',
    description: {
      ko: '조선시대 백자의 정수',
      en: 'Essence of Joseon white porcelain',
      zh: '朝鲜白瓷精髓',
      ja: '朝鮮白磁の精髄',
      th: 'แก่นแท้ของเครื่องเคลือบขาวโชซอน'
    },
    detailedInfo: {
      ko: '상세 정보',
      en: 'Detailed info',
      zh: '详细信息',
      ja: '詳細情報',
      th: 'ข้อมูลรายละเอียด'
    },
    image: '/test3.jpg',
    featured: false,
    exhibitionRoom: '3층',
    culturalProperty: '보물 제1437호',
  }
]

describe('artifact-utils', () => {
  describe('calculateHallStats', () => {
    it('유물 수와 문화재 지정 통계를 계산한다', () => {
      const stats = calculateHallStats(mockArtifacts)

      expect(stats).toEqual({
        total: 3,
        nationalTreasures: 2,
        treasures: 1,
      })
    })

    it('빈 배열에 대해 0을 반환한다', () => {
      const stats = calculateHallStats([])

      expect(stats).toEqual({
        total: 0,
        nationalTreasures: 0,
        treasures: 0,
      })
    })
  })

  describe('getCulturalPropertyType', () => {
    it('국보와 보물을 구분한다', () => {
      expect(getCulturalPropertyType('국보 제83호')).toBe('nationalTreasure')
      expect(getCulturalPropertyType('보물 1437호')).toBe('treasure')
    })

    it('지정 유형이 아닌 설명은 분류하지 않는다', () => {
      expect(getCulturalPropertyType('북한 국보급')).toBeNull()
      expect(getCulturalPropertyType('복제품')).toBeNull()
      expect(getCulturalPropertyType(undefined)).toBeNull()
    })
  })

  describe('filterArtifacts', () => {
    it('이름으로 검색한다', () => {
      const filtered = filterArtifacts(mockArtifacts, { searchTerm: '청자', language: 'ko' })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(1)
    })

    it('영어 이름으로 검색한다', () => {
      const filtered = filterArtifacts(mockArtifacts, { searchTerm: 'moon', language: 'en' })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(3)
    })

    it('설명으로 검색한다', () => {
      const filtered = filterArtifacts(mockArtifacts, { searchTerm: '불교', language: 'ko' })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(2)
    })

    it('카테고리로 필터링한다', () => {
      const filtered = filterArtifacts(mockArtifacts, { category: 'ceramics' })

      expect(filtered).toHaveLength(2)
      expect(filtered.map(a => a.id)).toEqual([1, 3])
    })

    it('시대로 필터링한다', () => {
      const filtered = filterArtifacts(mockArtifacts, { period: '고려', language: 'ko' })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(1)
    })

    it('검색어와 필터를 함께 사용한다', () => {
      const filtered = filterArtifacts(mockArtifacts, {
        searchTerm: '백자',
        category: 'ceramics',
        period: '조선',
        language: 'ko',
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(3)
    })

    it('대소문자를 구분하지 않는다', () => {
      const filtered1 = filterArtifacts(mockArtifacts, { searchTerm: 'MOON', language: 'en' })
      const filtered2 = filterArtifacts(mockArtifacts, { searchTerm: 'moon', language: 'en' })

      expect(filtered1).toEqual(filtered2)
    })

    it('필터 조건이 없으면 전체 유물을 반환한다', () => {
      expect(filterArtifacts(mockArtifacts, {})).toEqual(mockArtifacts)
    })

    it('기존 위치 인자 호출도 호환한다', () => {
      const filtered = filterArtifacts(mockArtifacts, 'moon', '전체', 'en', '전체')

      expect(filtered.map((artifact) => artifact.id)).toEqual([3])
    })
  })
})
