export interface Artifact {
  id: number
  name: {
    ko: string
    en: string
    zh: string
    ja: string
    th: string
  }
  period: {
    ko: string
    en: string
    zh: string
    ja: string
    th: string
  }
  category: string
  description: {
    ko: string
    en: string
    zh: string
    ja: string
    th: string
  }
  detailedInfo: {
    ko: string
    en: string
    zh: string
    ja: string
    th: string
  }
  image: string
  featured: boolean
  hall: string
  culturalProperty?: string
  exhibitionRoom: string
  artifactNumber?: string
  material?: {
    ko: string
    en: string
    zh: string
    ja: string
    th: string
  }
  dimensions?: string
  location?: {
    ko: string
    en: string
    zh: string
    ja: string
    th: string
  }
}

export type Language = "ko" | "en" | "zh" | "ja" | "th"

export interface Translation {
  // 공통
  nationalMuseum: string
  masterpieces100: string
  totalItems: string
  nationalTreasure: string
  treasure: string
  featured: string
  search: string
  filter: string
  category: string
  period: string
  all: string
  noResults: string
  noResultsDesc: string
  resetFilters: string
  backToHome: string

  // 메인 페이지
  subtitle: string
  koreanCulturalHeritage: string
  specialExhibition: string
  preciousCulturalProperties: string
  essenceOfKoreanCulture: string

  // 전시관
  archaeologyHall: string
  artHall: string
  historyHall: string
  asiaHall: string
  donationHall: string

  // 전시관 설명
  archaeologyDesc: string
  artDesc: string
  historyDesc: string
  asiaDesc: string
  donationDesc: string

  // 카테고리
  pottery: string
  bronze: string
  metalcraft: string
  ceramics: string
  sculpture: string
  calligraphy: string
  painting: string
  jewelry: string
  architecture: string
  stoneTools: string
  weapons: string
  printing: string
  maps: string
  documents: string
  books: string
  lacquerware: string
  buddhistPainting: string

  // 시대
  paleolithic: string
  neolithic: string
  bronzeAge: string
  threeKingdoms: string
  unifiedSilla: string
  goryeo: string
  joseon: string
  china: string
  japan: string
  centralAsia: string
  southeastAsia: string

  // 기타
  mainWorks: string
  moreArtifacts: string
  artifactList: string
  relatedArtifacts: string
  detailedInfo: string
  material: string
  dimensions: string
  location: string
  exhibitionRoom: string
  artifactNumber: string
  culturalPropertyDesignation: string
}
