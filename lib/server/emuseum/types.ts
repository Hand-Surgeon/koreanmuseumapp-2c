export const EMUSEUM_DATASET_ID = "3036708" as const
export const EMUSEUM_DATASET_NAME =
  "문화체육관광부 국립중앙박물관_전국 박물관 유물정보 상세설명" as const
export const DEFAULT_EMUSEUM_API_URL = "https://www.emuseum.go.kr/openapi" as const

export type EmuseumKoglType = "1" | "2" | "3" | "4"

export type EmuseumImageVariant = "original" | "small" | "medium" | "large"

/**
 * Secret-free reference to an image URL returned by eMuseum.
 *
 * The upstream URL contains a serviceKey-like token. The client stores that URL
 * in a private WeakMap and exposes only this opaque reference to callers.
 */
export interface EmuseumImageReference {
  readonly imageId: string
  readonly variant: EmuseumImageVariant
}

export interface EmuseumImageSet {
  original?: EmuseumImageReference
  small?: EmuseumImageReference
  medium?: EmuseumImageReference
  large?: EmuseumImageReference
}

export interface EmuseumPage<T> {
  pageNo: number
  numOfRows: number
  totalCount: number
  items: T[]
}

export interface EmuseumCodeItem {
  level?: number
  parentCode?: string
  code: string
  name?: string
  nameKr?: string
  nameEn?: string
  nameCn?: string
}

export interface EmuseumCodeListQuery {
  pageNo?: number
  numOfRows?: number
  parentCode?: string
}

export interface EmuseumRelicListQuery {
  pageNo?: number
  numOfRows?: number
  id?: string
  museumCode?: string
  name?: string
  nameKr?: string
  nameEn?: string
  nameCn?: string
  author?: string
  nationalityCode?: string
  materialCode?: string
  purposeCode?: string
  sizeRangeCode?: string
  placeLandCode?: string
  designationCode?: string
  indexWord?: string
}

export interface EmuseumRelicSummary {
  id: string
  museumCode: string
  name: string
  nameKr: string
  /** The API calls this nameCn, but the document describes it as a Hanja name. */
  alternateNameHanja?: string
  author?: string
  nationalityCode?: string
  materialCode?: string
  purposeCode?: string
  sizeRangeCode?: string
  placeLandCode?: string
  designationCode?: string
  indexWords: string[]
  koglType?: EmuseumKoglType
  relicNo?: string
  relicSubNo?: string
  museumCode1?: string
  museumName1?: string
  museumCode2?: string
  museumName2?: string
  museumCode3?: string
  museumName3?: string
  images: EmuseumImageSet
}

export interface EmuseumRelicDetail extends EmuseumRelicSummary {
  nationalityCode1?: string
  nationalityName1?: string
  nationalityCode2?: string
  nationalityName2?: string
  materialCode1?: string
  materialName1?: string
  materialCode2?: string
  materialName2?: string
  purposeCode1?: string
  purposeName1?: string
  purposeCode2?: string
  purposeName2?: string
  purposeCode3?: string
  purposeName3?: string
  purposeCode4?: string
  purposeName4?: string
  sizeRangeName?: string
  placeLandCode1?: string
  placeLandName1?: string
  placeLandCode2?: string
  placeLandName2?: string
  designationCode1?: string
  designationName1?: string
  designationCode2?: string
  designationName2?: string
  designationInfo?: string
  sizeInfo?: string
  description?: string
}

export interface EmuseumImageItem {
  artifactId: string
  sourceImageId: string
  museumCode?: string
  order: number
  images: EmuseumImageSet
}

export interface EmuseumRelatedRelic {
  artifactId: string
  relatedArtifactId: string
  order: number
  museumCode?: string
  museumCode1?: string
  museumCode2?: string
  museumFullName?: string
  name?: string
  relicNo?: string
  relicSubNo?: string
  images: EmuseumImageSet
}

export interface EmuseumRelicDetailResult {
  totalCount: number
  items: EmuseumRelicDetail[]
  images: EmuseumImageItem[]
  related: EmuseumRelatedRelic[]
}

export interface EmuseumImageDownload {
  bytes: Uint8Array
  contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
  extension: "jpg" | "png" | "webp" | "gif"
}

export interface EmuseumClientOptions {
  apiKey?: string
  baseUrl?: string
  /** Legacy API only: explicitly permits sending the service key over plain HTTP. */
  allowInsecureHttp?: boolean
  fetchImpl?: typeof fetch
  timeoutMs?: number
  maxResponseBytes?: number
}

export interface EmuseumClient {
  listCodes(query?: EmuseumCodeListQuery): Promise<EmuseumPage<EmuseumCodeItem>>
  listRelics(query?: EmuseumRelicListQuery): Promise<EmuseumPage<EmuseumRelicSummary>>
  getRelicDetail(id: string): Promise<EmuseumRelicDetailResult>
  downloadImage(
    reference: EmuseumImageReference,
    options?: { maxBytes?: number },
  ): Promise<EmuseumImageDownload>
}
