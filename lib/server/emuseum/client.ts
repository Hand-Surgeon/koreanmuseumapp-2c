import {
  DEFAULT_EMUSEUM_API_URL,
  type EmuseumClient,
  type EmuseumClientOptions,
  type EmuseumCodeItem,
  type EmuseumCodeListQuery,
  type EmuseumImageDownload,
  type EmuseumImageItem,
  type EmuseumImageReference,
  type EmuseumImageSet,
  type EmuseumImageVariant,
  type EmuseumKoglType,
  type EmuseumPage,
  type EmuseumRelatedRelic,
  type EmuseumRelicDetail,
  type EmuseumRelicDetailResult,
  type EmuseumRelicListQuery,
  type EmuseumRelicSummary,
} from "./types"

const SUCCESS_CODE = "0000"
const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_MAX_RESPONSE_BYTES = 5 * 1024 * 1024
const DEFAULT_MAX_IMAGE_BYTES = 20 * 1024 * 1024
const MAX_PAGE_SIZE = 100

const RETRYABLE_API_CODES = new Set([
  "1001",
  "1002",
  "1003",
  "2001",
  "4002",
  "4003",
  "4004",
  "4005",
  "4021",
  "9999",
])

const SAFE_API_MESSAGES: Record<string, string> = {
  "0001": "A required eMuseum request parameter is missing.",
  "0002": "An eMuseum request parameter has an invalid type.",
  "0003": "An eMuseum request code is invalid.",
  "0004": "An eMuseum request parameter is invalid.",
  "1001": "eMuseum could not create the query conditions.",
  "1002": "eMuseum could not map the response fields.",
  "1003": "eMuseum could not create the query filters.",
  "2001": "eMuseum could not retrieve the requested data.",
  "3001": "The eMuseum service key is not registered.",
  "3002": "The eMuseum service key has expired.",
  "3003": "The eMuseum service key is not valid for this environment.",
  "3004": "The eMuseum service key is not approved for this API.",
  "3005": "The eMuseum daily request limit has been exceeded.",
  "4010": "The public-data authentication request is invalid.",
  "4011": "A public-data authentication parameter is missing.",
  "4012": "The requested public-data API is unavailable.",
  "4020": "Public-data authentication denied access.",
  "4021": "The public-data service key is temporarily unavailable.",
  "4022": "The public-data request limit has been exceeded.",
  "4030": "The public-data service key is not registered.",
  "4031": "The public-data service key has expired.",
  "4032": "The request IP is not registered for this service key.",
  "4033": "The public-data request is not signed.",
  "4099": "Public-data authentication failed.",
  "9999": "eMuseum returned an application error.",
}

export type EmuseumClientErrorCode =
  | "CONFIG_ERROR"
  | "INVALID_REQUEST"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "HTTP_ERROR"
  | "RESPONSE_TOO_LARGE"
  | "INVALID_RESPONSE"
  | "API_ERROR"
  | "UNSAFE_IMAGE"

/** Error object that deliberately excludes request URLs, response bodies, and secrets. */
export class EmuseumClientError extends Error {
  readonly code: EmuseumClientErrorCode
  readonly resultCode?: string
  readonly status?: number
  readonly retryable: boolean

  constructor(
    code: EmuseumClientErrorCode,
    message: string,
    options: { resultCode?: string; status?: number; retryable?: boolean } = {},
  ) {
    super(message)
    this.name = "EmuseumClientError"
    this.code = code
    this.resultCode = options.resultCode
    this.status = options.status
    this.retryable = options.retryable ?? false
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      resultCode: this.resultCode,
      status: this.status,
      retryable: this.retryable,
      message: this.message,
    }
  }
}

type JsonObject = Record<string, unknown>

interface ParsedEnvelope {
  root: JsonObject
  totalCount: number
  pageNo: number
  numOfRows: number
}

interface FetchOptions {
  accept: string
  maxBytes: number
}

export function createEmuseumClient(options: EmuseumClientOptions = {}): EmuseumClient {
  // Configuration is intentionally read lazily here, not at module scope. That
  // keeps `next build` safe when the sync-only secret is not present.
  const apiKey = normalizeServiceKey(options.apiKey ?? process.env.MUSEUM_API_KEY)
  const allowInsecureHttp = options.allowInsecureHttp
    ?? process.env.MUSEUM_API_ALLOW_INSECURE_HTTP === "true"
  const baseUrl = normalizeBaseUrl(
    options.baseUrl ?? process.env.MUSEUM_API_URL,
    allowInsecureHttp,
  )
  const fetchImpl = options.fetchImpl ?? fetch
  const timeoutMs = validateInteger(
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    "timeoutMs",
    1,
    60_000,
    "CONFIG_ERROR",
  )
  const maxResponseBytes = validateInteger(
    options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES,
    "maxResponseBytes",
    1_024,
    20 * 1024 * 1024,
    "CONFIG_ERROR",
  )

  const privateImageUrls = new WeakMap<EmuseumImageReference, URL>()

  function parseImageReference(
    rawValue: unknown,
    variant: EmuseumImageVariant,
  ): EmuseumImageReference | undefined {
    const value = optionalTextValue(rawValue, 4_096, `image.${variant}`)
    if (!value) return undefined

    let candidate = value
    if (candidate.startsWith("http://")) {
      candidate = `https://${candidate.slice("http://".length)}`
    } else if (candidate.startsWith("www.emuseum.go.kr/")) {
      candidate = `https://${candidate}`
    }

    let url: URL
    try {
      url = new URL(candidate, `${baseUrl.origin}/`)
    } catch {
      throw new EmuseumClientError("UNSAFE_IMAGE", "eMuseum returned an invalid image URL.")
    }

    if (
      url.protocol !== "https:"
      || url.hostname !== "www.emuseum.go.kr"
      || url.port !== ""
      || url.pathname.toLowerCase() !== "/openapi/img"
      || url.username
      || url.password
      || url.hash
    ) {
      throw new EmuseumClientError("UNSAFE_IMAGE", "eMuseum returned an untrusted image URL.")
    }

    const allowedParameters = new Set(["serviceKey", "imageId"])
    for (const key of url.searchParams.keys()) {
      if (!allowedParameters.has(key)) {
        throw new EmuseumClientError("UNSAFE_IMAGE", "eMuseum returned an unexpected image parameter.")
      }
    }

    const embeddedKey = url.searchParams.get("serviceKey")
    const imageId = url.searchParams.get("imageId")
    if (!embeddedKey || !imageId || imageId.length > 4_096 || hasControlCharacters(imageId)) {
      throw new EmuseumClientError("UNSAFE_IMAGE", "eMuseum returned an incomplete image reference.")
    }

    // Ensure an explicitly-http response can never be used as-is.
    url.protocol = "https:"

    const reference = Object.freeze({ imageId, variant })
    privateImageUrls.set(reference, url)
    return reference
  }

  function parseImageSet(record: JsonObject, prefix = ""): EmuseumImageSet {
    const key = (name: string) => prefix
      ? `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}`
      : name
    return compactObject({
      original: parseImageReference(record[key("imgUri")], "original"),
      small: parseImageReference(record[key("imgThumUriS")], "small"),
      medium: parseImageReference(record[key("imgThumUriM")], "medium"),
      large: parseImageReference(record[key("imgThumUriL")], "large"),
    })
  }

  async function requestJson(path: string, parameters: URLSearchParams): Promise<unknown> {
    const url = new URL(path, `${baseUrl.toString().replace(/\/$/, "")}/`)
    url.searchParams.set("serviceKey", apiKey)
    for (const [key, value] of parameters) url.searchParams.set(key, value)

    const { response, bytes } = await fetchBytesWithTimeout(url, {
      accept: "application/json, text/json;q=0.9",
      maxBytes: maxResponseBytes,
    })
    const body = new TextDecoder("utf-8", { fatal: false }).decode(bytes).trim()

    if (body.startsWith("<")) {
      const xmlCode = extractXmlResultCode(body)
      if (xmlCode && xmlCode !== SUCCESS_CODE) throwApiError(xmlCode)
      throw new EmuseumClientError(
        response.ok ? "INVALID_RESPONSE" : "HTTP_ERROR",
        response.ok
          ? "eMuseum returned XML when JSON was required."
          : `eMuseum returned HTTP ${response.status}.`,
        { status: response.status, retryable: isRetryableHttpStatus(response.status) },
      )
    }

    let payload: unknown
    try {
      payload = JSON.parse(body)
    } catch {
      throw new EmuseumClientError(
        response.ok ? "INVALID_RESPONSE" : "HTTP_ERROR",
        response.ok
          ? "eMuseum returned malformed JSON."
          : `eMuseum returned HTTP ${response.status}.`,
        { status: response.status, retryable: isRetryableHttpStatus(response.status) },
      )
    }

    if (!response.ok) {
      const resultCode = isJsonObject(payload)
        ? normalizeResultCode(payload.resultCode)
        : undefined
      if (resultCode && resultCode !== SUCCESS_CODE) throwApiError(resultCode)

      throw new EmuseumClientError(
        "HTTP_ERROR",
        `eMuseum returned HTTP ${response.status}.`,
        { status: response.status, retryable: isRetryableHttpStatus(response.status) },
      )
    }

    return payload
  }

  async function fetchBytesWithTimeout(
    url: URL,
    fetchOptions: FetchOptions,
  ): Promise<{ response: Response; bytes: Uint8Array }> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetchImpl(url, {
        method: "GET",
        headers: { Accept: fetchOptions.accept },
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      })
      const bytes = await readResponseBytes(response, fetchOptions.maxBytes)
      return { response, bytes }
    } catch (error) {
      if (error instanceof EmuseumClientError) throw error
      if (controller.signal.aborted) {
        throw new EmuseumClientError(
          "TIMEOUT",
          "The eMuseum request timed out.",
          { retryable: true },
        )
      }
      throw new EmuseumClientError(
        "NETWORK_ERROR",
        "The eMuseum request failed before a response was received.",
        { retryable: true },
      )
    } finally {
      clearTimeout(timeout)
    }
  }

  async function listCodes(query: EmuseumCodeListQuery = {}): Promise<EmuseumPage<EmuseumCodeItem>> {
    const parameters = paginationParameters(query.pageNo, query.numOfRows)
    addCodeParameter(parameters, "parentCode", query.parentCode)

    const payload = await requestJson("code", parameters)
    const envelope = parseEnvelope(payload)
    const items = parseArray(envelope.root.list, "list").map((value, index) => {
      const record = requireJsonObject(value, `list[${index}]`)
      return compactObject({
        level: optionalInteger(record.level, `list[${index}].level`, 0, 9),
        parentCode: optionalText(record, "parentCode", 30),
        code: requiredText(record, ["code", "Code"], 30),
        name: optionalText(record, "name", 2_000),
        nameKr: optionalText(record, "nameKr", 2_000),
        nameEn: optionalText(record, "nameEn", 100),
        nameCn: optionalText(record, "nameCn", 100),
      })
    })

    return pageFromEnvelope(envelope, items)
  }

  async function listRelics(
    query: EmuseumRelicListQuery = {},
  ): Promise<EmuseumPage<EmuseumRelicSummary>> {
    const parameters = paginationParameters(query.pageNo, query.numOfRows)
    addIdParameter(parameters, "id", query.id)
    addCodeParameter(parameters, "museumCode", query.museumCode)
    addTextParameter(parameters, "name", query.name)
    addTextParameter(parameters, "nameKr", query.nameKr)
    addTextParameter(parameters, "nameEn", query.nameEn)
    addTextParameter(parameters, "nameCn", query.nameCn)
    addTextParameter(parameters, "author", query.author)
    addCodeParameter(parameters, "nationalityCode", query.nationalityCode)
    addCodeParameter(parameters, "materialCode", query.materialCode)
    addCodeParameter(parameters, "purposeCode", query.purposeCode)
    addCodeParameter(parameters, "sizeRangeCode", query.sizeRangeCode)
    addCodeParameter(parameters, "placeLandCode", query.placeLandCode)
    addCodeParameter(parameters, "designationCode", query.designationCode)
    addTextParameter(parameters, "indexWord", query.indexWord)

    const payload = await requestJson("relic/list", parameters)
    const envelope = parseEnvelope(payload)
    const items = parseArray(envelope.root.list, "list").map((value, index) => (
      parseRelicSummary(requireJsonObject(value, `list[${index}]`), `list[${index}]`)
    ))

    return pageFromEnvelope(envelope, items)
  }

  async function getRelicDetail(id: string): Promise<EmuseumRelicDetailResult> {
    const parameters = new URLSearchParams()
    addIdParameter(parameters, "id", id, true)

    const payload = await requestJson("relic/detail", parameters)
    const envelope = parseEnvelope(payload)
    const items = parseArray(envelope.root.list, "list").map((value, index) => (
      parseRelicDetail(requireJsonObject(value, `list[${index}]`), `list[${index}]`)
    ))

    const imageContainer = optionalJsonObject(envelope.root.imageList, "imageList")
    const images = imageContainer
      ? parseArray(imageContainer.list, "imageList.list").map((value, index) => (
        parseImageItem(requireJsonObject(value, `imageList.list[${index}]`), index)
      ))
      : []

    const relatedContainer = optionalJsonObject(envelope.root.relationList, "relationList")
    const related = relatedContainer
      ? parseArray(relatedContainer.list, "relationList.list").map((value, index) => (
        parseRelatedRelic(requireJsonObject(value, `relationList.list[${index}]`), index)
      ))
      : []

    return { totalCount: envelope.totalCount, items, images, related }
  }

  function parseRelicSummary(record: JsonObject, path: string): EmuseumRelicSummary {
    const name = optionalText(record, "name", 100) ?? optionalText(record, "nameKr", 100)
    const nameKr = optionalText(record, "nameKr", 100) ?? name
    if (!name || !nameKr) {
      throw invalidResponse(`${path} does not contain a usable name.`)
    }

    return compactObject({
      id: requiredText(record, ["id", "Id"], 30),
      museumCode: requiredText(record, "museumCode", 30),
      name,
      nameKr,
      alternateNameHanja: optionalText(record, "nameCn", 100),
      author: optionalText(record, "author", 100),
      nationalityCode: optionalText(record, "nationalityCode", 30),
      materialCode: optionalText(record, "materialCode", 30),
      purposeCode: optionalText(record, "purposeCode", 30),
      sizeRangeCode: optionalText(record, "sizeRangeCode", 30),
      placeLandCode: optionalText(record, "placeLandCode", 30),
      designationCode: optionalText(record, "designationCode", 30),
      indexWords: parseIndexWords(optionalText(record, "indexWord", 1_000)),
      koglType: optionalKoglType(record.glsv, `${path}.glsv`),
      relicNo: optionalText(record, "relicNo", 20),
      relicSubNo: optionalText(record, "relicSubNo", 20),
      museumCode1: optionalText(record, "museumCode1", 30),
      museumName1: optionalText(record, "museumName1", 100),
      museumCode2: optionalText(record, "museumCode2", 30),
      museumName2: optionalText(record, "museumName2", 100),
      museumCode3: optionalText(record, "museumCode3", 30),
      museumName3: optionalText(record, "museumName3", 100),
      images: parseImageSet(record),
    })
  }

  function parseRelicDetail(record: JsonObject, path: string): EmuseumRelicDetail {
    return compactObject({
      ...parseRelicSummary(record, path),
      nationalityCode1: optionalText(record, "nationalityCode1", 30),
      nationalityName1: optionalText(record, "nationalityName1", 100),
      nationalityCode2: optionalText(record, "nationalityCode2", 30),
      nationalityName2: optionalText(record, "nationalityName2", 100),
      materialCode1: optionalText(record, "materialCode1", 30),
      materialName1: optionalText(record, "materialName1", 100),
      materialCode2: optionalText(record, "materialCode2", 30),
      materialName2: optionalText(record, "materialName2", 100),
      purposeCode1: optionalText(record, "purposeCode1", 30),
      purposeName1: optionalText(record, "purposeName1", 100),
      purposeCode2: optionalText(record, "purposeCode2", 30),
      purposeName2: optionalText(record, "purposeName2", 100),
      purposeCode3: optionalText(record, "purposeCode3", 30),
      purposeName3: optionalText(record, "purposeName3", 100),
      purposeCode4: optionalText(record, "purposeCode4", 30),
      purposeName4: optionalText(record, "purposeName4", 100),
      sizeRangeName: optionalText(record, "sizeRangeName", 100),
      placeLandCode1: optionalText(record, "placeLandCode1", 30),
      placeLandName1: optionalText(record, "placeLandName1", 100),
      placeLandCode2: optionalText(record, "placeLandCode2", 30),
      placeLandName2: optionalText(record, "placeLandName2", 100),
      designationCode1: optionalText(record, "designationCode1", 30),
      designationName1: optionalText(record, "designationName1", 100),
      designationCode2: optionalText(record, "designationCode2", 30),
      designationName2: optionalText(record, "designationName2", 100),
      designationInfo: optionalText(record, "designationInfo", 1_000),
      sizeInfo: optionalText(record, "sizeInfo", 1_000),
      description: optionalText(record, "desc", 20_000),
    })
  }

  function parseImageItem(record: JsonObject, index: number): EmuseumImageItem {
    const path = `imageList.list[${index}]`
    return compactObject({
      artifactId: requiredText(record, ["id", "Id"], 30),
      sourceImageId: requiredText(record, "imgId", 30),
      museumCode: optionalText(record, "museumCode", 30),
      order: requiredInteger(record.imgOrder, `${path}.imgOrder`, 0, 99),
      images: parseImageSet(record),
    })
  }

  function parseRelatedRelic(record: JsonObject, index: number): EmuseumRelatedRelic {
    const path = `relationList.list[${index}]`
    return compactObject({
      artifactId: requiredText(record, ["id", "Id"], 30),
      relatedArtifactId: requiredText(record, "reltId", 30),
      order: requiredInteger(record.reltOrder, `${path}.reltOrder`, 0, 99),
      museumCode: optionalText(record, "museumCode", 30),
      museumCode1: optionalText(record, "reltMuseumCode1", 30),
      museumCode2: optionalText(record, "reltMuseumCode2", 30),
      museumFullName: optionalText(record, "reltMuseumFullName", 100),
      name: optionalText(record, "reltRelicName", 1_000),
      relicNo: optionalText(record, "reltRelicNo", 20),
      relicSubNo: optionalText(record, "reltRelicSubNo", 20),
      images: parseImageSet(record, "relt"),
    })
  }

  async function downloadImage(
    reference: EmuseumImageReference,
    downloadOptions: { maxBytes?: number } = {},
  ): Promise<EmuseumImageDownload> {
    const imageUrl = privateImageUrls.get(reference)
    if (!imageUrl) {
      throw new EmuseumClientError(
        "UNSAFE_IMAGE",
        "The image reference was not created by this eMuseum client.",
      )
    }

    const maxBytes = validateInteger(
      downloadOptions.maxBytes ?? DEFAULT_MAX_IMAGE_BYTES,
      "maxBytes",
      1_024,
      50 * 1024 * 1024,
      "INVALID_REQUEST",
    )
    const { response, bytes } = await fetchBytesWithTimeout(imageUrl, {
      accept: "image/jpeg, image/png, image/webp, image/gif",
      maxBytes,
    })

    if (!response.ok) {
      throw new EmuseumClientError(
        "HTTP_ERROR",
        `eMuseum returned HTTP ${response.status} for an image.`,
        { status: response.status, retryable: isRetryableHttpStatus(response.status) },
      )
    }

    const contentType = normalizeImageContentType(response.headers.get("content-type"))
    const extension = imageExtension(contentType)
    return { bytes, contentType, extension }
  }

  return { listCodes, listRelics, getRelicDetail, downloadImage }
}

function normalizeServiceKey(value: string | undefined): string {
  if (!value?.trim()) {
    throw new EmuseumClientError(
      "CONFIG_ERROR",
      "MUSEUM_API_KEY is required for an eMuseum sync.",
    )
  }

  let normalized = value.trim()
  if (/%[0-9a-f]{2}/i.test(normalized)) {
    try {
      normalized = decodeURIComponent(normalized)
    } catch {
      throw new EmuseumClientError(
        "CONFIG_ERROR",
        "MUSEUM_API_KEY is not valid URL-encoded text.",
      )
    }
  }

  if (normalized.length > 512 || hasControlCharacters(normalized)) {
    throw new EmuseumClientError("CONFIG_ERROR", "MUSEUM_API_KEY has an invalid format.")
  }
  return normalized
}

function normalizeBaseUrl(value: string | undefined, allowInsecureHttp: boolean): URL {
  let url: URL
  try {
    url = new URL(value?.trim() || DEFAULT_EMUSEUM_API_URL)
  } catch {
    throw new EmuseumClientError("CONFIG_ERROR", "MUSEUM_API_URL is invalid.")
  }

  const normalizedPath = url.pathname.replace(/\/+$/, "") || "/"
  if (
    (url.protocol !== "https:" && !(allowInsecureHttp && url.protocol === "http:"))
    || url.hostname !== "www.emuseum.go.kr"
    || url.port !== ""
    || normalizedPath !== "/openapi"
    || url.username
    || url.password
    || url.search
    || url.hash
  ) {
    throw new EmuseumClientError(
      "CONFIG_ERROR",
      "MUSEUM_API_URL must be the eMuseum /openapi endpoint; plain HTTP requires explicit opt-in.",
    )
  }

  url.pathname = "/openapi"
  return url
}

function paginationParameters(pageNo = 1, numOfRows = 10): URLSearchParams {
  const parameters = new URLSearchParams()
  parameters.set(
    "pageNo",
    String(validateInteger(pageNo, "pageNo", 1, 9_999, "INVALID_REQUEST")),
  )
  parameters.set(
    "numOfRows",
    String(validateInteger(numOfRows, "numOfRows", 1, MAX_PAGE_SIZE, "INVALID_REQUEST")),
  )
  return parameters
}

function addIdParameter(
  parameters: URLSearchParams,
  name: string,
  value: string | undefined,
  required = false,
) {
  const normalized = normalizeRequestText(value, name, 30, required)
  if (!normalized) return
  if (!/^[A-Za-z0-9]+$/.test(normalized)) {
    throw new EmuseumClientError("INVALID_REQUEST", `${name} contains unsupported characters.`)
  }
  parameters.set(name, normalized)
}

function addCodeParameter(parameters: URLSearchParams, name: string, value: string | undefined) {
  const normalized = normalizeRequestText(value, name, 30)
  if (!normalized) return
  if (!/^[A-Za-z0-9]+$/.test(normalized)) {
    throw new EmuseumClientError("INVALID_REQUEST", `${name} contains unsupported characters.`)
  }
  parameters.set(name, normalized)
}

function addTextParameter(parameters: URLSearchParams, name: string, value: string | undefined) {
  const normalized = normalizeRequestText(value, name, 100)
  if (normalized) parameters.set(name, normalized)
}

function normalizeRequestText(
  value: string | undefined,
  name: string,
  maxLength: number,
  required = false,
): string | undefined {
  const normalized = value?.trim()
  if (!normalized) {
    if (required) {
      throw new EmuseumClientError("INVALID_REQUEST", `${name} is required.`)
    }
    return undefined
  }
  if (normalized.length > maxLength || hasControlCharacters(normalized)) {
    throw new EmuseumClientError("INVALID_REQUEST", `${name} has an invalid format.`)
  }
  return normalized
}

function parseEnvelope(payload: unknown): ParsedEnvelope {
  const root = requireJsonObject(payload, "response")
  const resultCode = normalizeResultCode(root.resultCode)
  if (!resultCode) throw invalidResponse("The eMuseum response has no resultCode.")
  if (resultCode !== SUCCESS_CODE) throwApiError(resultCode)

  return {
    root,
    totalCount: requiredInteger(root.totalCount, "totalCount", 0, Number.MAX_SAFE_INTEGER),
    pageNo: optionalInteger(root.pageNo, "pageNo", 0, 9_999) ?? 0,
    numOfRows: optionalInteger(root.numOfRows, "numOfRows", 0, 9_999) ?? 0,
  }
}

function pageFromEnvelope<T>(envelope: ParsedEnvelope, items: T[]): EmuseumPage<T> {
  return {
    pageNo: envelope.pageNo,
    numOfRows: envelope.numOfRows,
    totalCount: envelope.totalCount,
    items,
  }
}

function normalizeResultCode(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined
  const normalized = String(value).trim()
  if (!/^\d{1,4}$/.test(normalized)) return normalized || undefined
  return normalized.padStart(4, "0")
}

function throwApiError(resultCode: string): never {
  throw new EmuseumClientError(
    "API_ERROR",
    SAFE_API_MESSAGES[resultCode] ?? `eMuseum returned error code ${resultCode}.`,
    {
      resultCode,
      retryable: RETRYABLE_API_CODES.has(resultCode),
    },
  )
}

function extractXmlResultCode(value: string): string | undefined {
  const match = value.match(/<resultCode>\s*([^<]+)\s*<\/resultCode>/i)
  return normalizeResultCode(match?.[1])
}

function parseArray(value: unknown, path: string): unknown[] {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (isJsonObject(value)) return [value]
  throw invalidResponse(`${path} must be an array or object.`)
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requireJsonObject(value: unknown, path: string): JsonObject {
  if (!isJsonObject(value)) throw invalidResponse(`${path} must be an object.`)
  return value
}

function optionalJsonObject(value: unknown, path: string): JsonObject | undefined {
  if (value == null) return undefined
  return requireJsonObject(value, path)
}

function requiredText(
  record: JsonObject,
  keys: string | readonly string[],
  maxLength: number,
): string {
  const candidates = typeof keys === "string" ? [keys] : keys
  for (const key of candidates) {
    const value = optionalText(record, key, maxLength)
    if (value) return value
  }
  throw invalidResponse(`${candidates.join("/")} is required.`)
}

function optionalText(record: JsonObject, key: string, maxLength: number): string | undefined {
  return optionalTextValue(record[key], maxLength, key)
}

function optionalTextValue(
  value: unknown,
  maxLength: number,
  path: string,
): string | undefined {
  if (value == null) return undefined
  if (typeof value !== "string" && typeof value !== "number") {
    throw invalidResponse(`${path} must be text.`)
  }
  const normalized = String(value)
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .trim()
  if (!normalized) return undefined
  if (normalized.length > maxLength || hasUnsafeResponseControlCharacters(normalized)) {
    throw invalidResponse(`${path} is too long or contains control characters.`)
  }
  return normalized
}

function requiredInteger(
  value: unknown,
  path: string,
  min: number,
  max: number,
): number {
  const parsed = optionalInteger(value, path, min, max)
  if (parsed === undefined) throw invalidResponse(`${path} is required.`)
  return parsed
}

function optionalInteger(
  value: unknown,
  path: string,
  min: number,
  max: number,
): number | undefined {
  if (value == null || value === "") return undefined
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw invalidResponse(`${path} must be an integer between ${min} and ${max}.`)
  }
  return parsed
}

function validateInteger(
  value: number,
  path: string,
  min: number,
  max: number,
  code: "CONFIG_ERROR" | "INVALID_REQUEST",
): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new EmuseumClientError(code, `${path} must be an integer between ${min} and ${max}.`)
  }
  return value
}

function optionalKoglType(value: unknown, path: string): EmuseumKoglType | undefined {
  const normalized = optionalTextValue(value, 1, path)
  if (!normalized) return undefined
  if (!["1", "2", "3", "4"].includes(normalized)) {
    throw invalidResponse(`${path} is not a supported KOGL type.`)
  }
  return normalized as EmuseumKoglType
}

function parseIndexWords(value: string | undefined): string[] {
  if (!value) return []
  return [...new Set(
    value
      .split(/[,，;]/)
      .map((item) => item.trim())
      .filter(Boolean),
  )]
}

async function readResponseBytes(response: Response, maxBytes: number): Promise<Uint8Array> {
  const declaredLength = response.headers.get("content-length")
  if (declaredLength) {
    const parsedLength = Number(declaredLength)
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
      throw new EmuseumClientError(
        "RESPONSE_TOO_LARGE",
        "The eMuseum response exceeded the configured size limit.",
      )
    }
  }

  if (!response.body) return new Uint8Array()

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      throw new EmuseumClientError(
        "RESPONSE_TOO_LARGE",
        "The eMuseum response exceeded the configured size limit.",
      )
    }
    chunks.push(value)
  }

  const result = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}

function normalizeImageContentType(value: string | null): EmuseumImageDownload["contentType"] {
  const normalized = value?.split(";", 1)[0]?.trim().toLowerCase()
  if (
    normalized !== "image/jpeg"
    && normalized !== "image/png"
    && normalized !== "image/webp"
    && normalized !== "image/gif"
  ) {
    throw new EmuseumClientError(
      "UNSAFE_IMAGE",
      "eMuseum returned an unsupported image content type.",
    )
  }
  return normalized
}

function imageExtension(contentType: EmuseumImageDownload["contentType"]): EmuseumImageDownload["extension"] {
  switch (contentType) {
    case "image/jpeg": return "jpg"
    case "image/png": return "png"
    case "image/webp": return "webp"
    case "image/gif": return "gif"
  }
}

function isRetryableHttpStatus(status: number) {
  return status === 408
    || status === 429
    || status === 500
    || status === 502
    || status === 503
    || status === 504
}

function hasControlCharacters(value: string) {
  return /[\u0000-\u001f\u007f]/.test(value)
}

function hasUnsafeResponseControlCharacters(value: string) {
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
}

function invalidResponse(message: string) {
  return new EmuseumClientError("INVALID_RESPONSE", message)
}

function compactObject<T extends object>(value: T): T {
  for (const key of Object.keys(value) as Array<keyof T>) {
    if (value[key] === undefined) delete value[key]
  }
  return value
}
