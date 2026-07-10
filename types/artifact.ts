import type { Language, LocalizedText } from "./language"
import type { HallName } from "./hall"

export const ARTIFACT_CATEGORIES = [
  "pottery",
  "bronze",
  "metalcraft",
  "ceramics",
  "sculpture",
  "calligraphy",
  "painting",
  "jewelry",
  "architecture",
  "stoneTools",
  "weapons",
  "printing",
  "maps",
  "documents",
  "books",
  "lacquerware",
  "buddhistPainting",
  "buddhistArt",
  "craft",
  "science",
  "stonework",
] as const

export type ArtifactCategory = (typeof ARTIFACT_CATEGORIES)[number]

/**
 * 문화재 지정 원문입니다. 현재 데이터와 UI가 "국보 제83호"처럼
 * 표시용 문자열을 사용하므로 이를 정본으로 유지합니다.
 */
export type CulturalProperty = string

export type ArtifactImageRightsStatus = "kogl-1" | "third-party-permitted"

export interface ArtifactImageAsset {
  src: string
  sourceImageId: string
  order: number
  contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
  sha256: string
  credit: string
  rightsStatus: ArtifactImageRightsStatus
  rightsHolder?: string
  copyrightNotice?: string
  evidenceUrl: string
  verifiedAt: string
}

export interface ArtifactSource {
  provider: "emuseum"
  datasetId: "3036708"
  datasetName: string
  datasetUrl: string
  sourceId: string
  officialNameKr: string
  alternateNameHanja?: string
  museumCode: string
  museumName: string
  museumSubdivision?: string
  relicNo?: string
  relicSubNo?: string
  author?: string
  nationality?: string
  period?: string
  material?: string
  purpose?: string
  location?: string
  designation?: string
  size?: string
  description?: string
  indexWords: string[]
  syncedAt: string
  normalizedSha256: string
}

export interface ArtifactMetadataRights {
  basis: "kogl-1" | "permission"
  koglType: 1 | 2 | 3 | 4 | null
  licenseUrl: string
  attribution: string
  thirdPartyRightsIncluded: true
  evidenceUrl: string
  verifiedAt: string
  reviewer: string
}

export interface ArtifactRights {
  metadata: ArtifactMetadataRights
  imagesHaveSeparateRights: true
}

export interface Artifact {
  id: number
  name: LocalizedText
  period: LocalizedText
  category: ArtifactCategory
  description: LocalizedText
  detailedInfo: LocalizedText
  image: string
  images?: ArtifactImageAsset[]
  featured: boolean
  hall: HallName
  culturalProperty?: CulturalProperty
  exhibitionRoom: string
  artifactNumber?: string
  material?: LocalizedText
  dimensions?: string
  location?: LocalizedText
  source?: ArtifactSource
  rights?: ArtifactRights
}

/** Client-safe, already localized projection used by the favorites screen. */
export interface FavoriteArtifactSummary {
  id: number
  name: string
  period: string
  description: string
  image: string
  category: string
  hall: string
  culturalProperty?: string
  provenance?: {
    sourceId: string
    museumName: string
    datasetUrl: string
    attribution: string
    licenseUrl: string
    imageCredit?: string
    imageEvidenceUrl?: string
  }
}

export type { Language, LocalizedText, Translation } from "./language"
export type { HallName } from "./hall"
