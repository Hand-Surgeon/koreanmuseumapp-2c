export const SUPPORTED_LANGUAGES = ["ko", "en", "zh", "ja", "th"] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export type LocalizedText = Record<Language, string>

export function isSupportedLanguage(value: string): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
}

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
  back: string
  searchResults: string

  // 메인 페이지
  subtitle: string
  koreanCulturalHeritage: string
  specialExhibition: string
  preciousCulturalProperties: string
  essenceOfKoreanCulture: string
  collection: string

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
  buddhistArt: string
  craft: string
  science: string
  stonework: string

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

  // 유물 상세 및 사용자 동작
  mainWorks: string
  moreArtifacts: string
  artifactList: string
  relatedArtifacts: string
  detailedInfo: string
  details: string
  material: string
  dimensions: string
  location: string
  exhibitionRoom: string
  artifactNumber: string
  culturalPropertyDesignation: string
  hall: string
  imageExpand: string
  favorites: string
  addFavorite: string
  removeFavorite: string
  share: string
  copyLink: string
  copied: string
}
