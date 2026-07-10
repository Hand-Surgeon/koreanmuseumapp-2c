import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { artifacts } from "../data/artifacts"
import {
  createEmuseumClient,
  EmuseumClientError,
} from "../lib/server/emuseum/client"
import {
  EMUSEUM_DATASET_ID,
  EMUSEUM_DATASET_NAME,
  type EmuseumClient,
  type EmuseumImageDownload,
  type EmuseumImageItem,
  type EmuseumRelicDetail,
} from "../lib/server/emuseum/types"
import type {
  Artifact,
  ArtifactImageAsset,
  ArtifactImageRightsStatus,
  ArtifactMetadataRights,
} from "../types/artifact"
import type { EmuseumArtifactSnapshot } from "../types/emuseum-snapshot"

const PROJECT_ROOT = process.cwd()
const CACHE_DIR = path.join(PROJECT_ROOT, ".cache", "emuseum")
const SELECTION_PATH = path.join(PROJECT_ROOT, "data", "emuseum-selections.json")
const SNAPSHOT_PATH = path.join(PROJECT_ROOT, "data", "generated", "emuseum-artifacts.json")
const PUBLIC_IMAGE_ROOT = path.join(PROJECT_ROOT, "public", "artworks", "emuseum")
const DATASET_URL = "https://www.data.go.kr/data/3036708/openapi.do"
const KOGL_LICENSE_URL = "https://www.kogl.or.kr/info/license.do"
const MAX_DAILY_AUTOMATION_REQUESTS = 800
const REQUEST_INTERVAL_MS = 500
const EXPECTED_ARTIFACT_COUNT = 100

type Command = "discover" | "inspect" | "sync"

interface SelectionFile {
  schemaVersion: 1
  datasetId: "3036708"
  records: SelectionRecord[]
}

interface SelectionRecord {
  localId: number
  sourceId: string
  acceptedOfficialNames: string[]
  identityReviewed: boolean
  metadataRights?: MetadataRightsReview
  images?: ImageRightsReview[]
}

interface MetadataRightsReview {
  basis: "kogl-1" | "permission"
  attribution: string
  evidenceUrl: string
  verifiedAt: string
  reviewer: string
}

interface ImageRightsReview {
  sourceImageId: string
  rightsStatus: ArtifactImageRightsStatus
  credit: string
  rightsHolder?: string
  copyrightNotice?: string
  evidenceUrl: string
  verifiedAt: string
}

interface CliOptions {
  command: Command
  limit: number
  maxRequests: number
  dryRun: boolean
}

class SyncError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SyncError"
  }
}

class RequestBudget {
  used = 0
  private lastRequestAt = 0

  constructor(readonly maximum: number) {}

  async consume() {
    if (this.used >= this.maximum) {
      throw new SyncError(`The safe request budget of ${this.maximum} has been exhausted.`)
    }

    const elapsed = Date.now() - this.lastRequestAt
    if (this.lastRequestAt > 0 && elapsed < REQUEST_INTERVAL_MS) {
      await new Promise((resolve) => setTimeout(resolve, REQUEST_INTERVAL_MS - elapsed))
    }

    this.used += 1
    this.lastRequestAt = Date.now()
  }
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2))
  await loadLocalEnvironment()
  const client = createEmuseumClient()
  const budget = new RequestBudget(options.maxRequests)

  switch (options.command) {
    case "discover":
      await discoverCandidates(client, budget, options.limit)
      break
    case "inspect":
      await inspectSelections(client, budget, options.limit)
      break
    case "sync":
      await syncVerifiedSnapshot(client, budget, options.dryRun)
      break
  }

  console.log(`[emuseum] Completed ${options.command}; requests used: ${budget.used}.`)
}

async function discoverCandidates(
  client: EmuseumClient,
  budget: RequestBudget,
  limit: number,
) {
  const selectedArtifacts = artifacts.slice(0, limit)
  ensureExpectedRequests(selectedArtifacts.length, budget.maximum)
  const results = []
  let consecutiveFailures = 0

  for (const [index, artifact] of selectedArtifacts.entries()) {
    try {
      await budget.consume()
      const page = await client.listRelics({
        nameKr: artifact.name.ko,
        pageNo: 1,
        numOfRows: 5,
      })
      const matches = page.items.map((item) => ({
        sourceId: item.id,
        name: item.name,
        nameKr: item.nameKr,
        alternateNameHanja: item.alternateNameHanja,
        museumCode: item.museumCode,
        museumName: item.museumName2,
        museumSubdivision: item.museumName3,
        relicNo: item.relicNo,
        relicSubNo: item.relicSubNo,
        koglType: item.koglType,
        hasImage: Object.keys(item.images).length > 0,
        exactNameMatch: sameName(artifact.name.ko, item.nameKr),
      }))
      const exactMatches = matches.filter((candidate) => candidate.exactNameMatch)

      results.push({
        localId: artifact.id,
        expectedName: artifact.name.ko,
        totalMatches: page.totalCount,
        reviewStatus: exactMatches.length === 1 ? "one-exact-candidate" : "manual-review-required",
        matches,
      })
      consecutiveFailures = 0
      console.log(`[emuseum] discover ${index + 1}/${selectedArtifacts.length}: local id ${artifact.id}`)
    } catch (error) {
      if (!(error instanceof EmuseumClientError) || shouldStopDiscovery(error)) throw error

      consecutiveFailures += 1
      results.push({
        localId: artifact.id,
        expectedName: artifact.name.ko,
        totalMatches: null,
        reviewStatus: "api-error",
        matches: [],
        error: {
          code: error.code,
          resultCode: error.resultCode,
          status: error.status,
          retryable: error.retryable,
        },
      })
      console.log(`[emuseum] discover ${index + 1}/${selectedArtifacts.length}: local id ${artifact.id} (API error recorded)`)
      if (consecutiveFailures >= 5) {
        await writeCandidateCheckpoint(results, budget.used, false)
        throw new SyncError("Discovery stopped after five consecutive API failures.")
      }
    }

    await writeCandidateCheckpoint(results, budget.used, false)
  }

  const candidateOutput = {
    schemaVersion: 1,
    datasetId: EMUSEUM_DATASET_ID,
    generatedAt: new Date().toISOString(),
    requestCount: budget.used,
    records: results,
  }
  const template: SelectionFile = {
    schemaVersion: 1,
    datasetId: EMUSEUM_DATASET_ID,
    records: results.map((result) => {
      const exactMatches = result.matches.filter((candidate) => candidate.exactNameMatch)
      return {
        localId: result.localId,
        sourceId: exactMatches.length === 1 ? exactMatches[0].sourceId : "",
        acceptedOfficialNames: [],
        identityReviewed: false,
      }
    }),
  }

  await writeSecretFreeJson(path.join(CACHE_DIR, "candidates.json"), candidateOutput)
  await writeSecretFreeJson(path.join(CACHE_DIR, "selection-template.json"), template)
  await writeCandidateCheckpoint(results, budget.used, true)
  console.log("[emuseum] Candidate and selection-template files were written under .cache/emuseum.")
}

async function writeCandidateCheckpoint(records: unknown[], requestCount: number, complete: boolean) {
  await writeSecretFreeJson(path.join(CACHE_DIR, "candidates.partial.json"), {
    schemaVersion: 1,
    datasetId: EMUSEUM_DATASET_ID,
    generatedAt: new Date().toISOString(),
    complete,
    requestCount,
    records,
  })
}

function shouldStopDiscovery(error: EmuseumClientError) {
  return error.code === "CONFIG_ERROR"
    || error.code === "INVALID_REQUEST"
    || error.resultCode === "3001"
    || error.resultCode === "3002"
    || error.resultCode === "3003"
    || error.resultCode === "3004"
    || error.resultCode === "3005"
    || error.resultCode === "4020"
    || error.resultCode === "4022"
    || error.resultCode === "4030"
    || error.resultCode === "4031"
    || error.resultCode === "4032"
    || error.resultCode === "4033"
}

async function inspectSelections(
  client: EmuseumClient,
  budget: RequestBudget,
  limit: number,
) {
  const selection = await readSelectionFile(false)
  const records = selection.records.slice(0, limit)
  if (records.length === 0) {
    throw new SyncError("No identity-reviewed eMuseum selections are available to inspect.")
  }
  ensureExpectedRequests(records.length, budget.maximum)

  const inspection = []
  const rightsTemplate: {
    schemaVersion: 1
    datasetId: "3036708"
    records: unknown[]
  } = {
    schemaVersion: 1,
    datasetId: EMUSEUM_DATASET_ID,
    records: [],
  }

  for (const [index, selectionRecord] of records.entries()) {
    const artifact = findLocalArtifact(selectionRecord.localId)
    await budget.consume()
    const result = await client.getRelicDetail(selectionRecord.sourceId)
    const detail = getSingleDetail(result.items, selectionRecord.sourceId)
    assertIdentityMatch(artifact, selectionRecord, detail)

    const images = result.images
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((image) => ({
        sourceImageId: image.sourceImageId,
        order: image.order,
        variants: Object.keys(image.images),
      }))

    inspection.push({
      localId: artifact.id,
      expectedName: artifact.name.ko,
      sourceId: detail.id,
      officialNameKr: detail.nameKr,
      alternateNameHanja: detail.alternateNameHanja,
      museumName: detail.museumName2,
      museumSubdivision: detail.museumName3,
      nationality: detail.nationalityName1,
      period: detail.nationalityName2,
      material: detail.materialName2 ?? detail.materialName1,
      designation: detail.designationInfo,
      koglType: detail.koglType,
      images,
    })

    rightsTemplate.records.push({
      ...selectionRecord,
      metadataRights: selectionRecord.metadataRights ?? {
        basis: "unreviewed",
        attribution: "",
        evidenceUrl: DATASET_URL,
        verifiedAt: "",
        reviewer: "",
      },
      images: selectionRecord.images ?? images.map((image) => ({
        sourceImageId: image.sourceImageId,
        rightsStatus: "unknown",
        credit: "",
        evidenceUrl: "",
        verifiedAt: "",
      })),
    })
    console.log(`[emuseum] inspect ${index + 1}/${records.length}: local id ${artifact.id}`)
  }

  await writeSecretFreeJson(path.join(CACHE_DIR, "inspection.json"), {
    schemaVersion: 1,
    datasetId: EMUSEUM_DATASET_ID,
    generatedAt: new Date().toISOString(),
    requestCount: budget.used,
    records: inspection,
  })
  await writeSecretFreeJson(path.join(CACHE_DIR, "rights-review-template.json"), rightsTemplate)
  console.log("[emuseum] Inspection and rights-review template files were written under .cache/emuseum.")
}

async function syncVerifiedSnapshot(
  client: EmuseumClient,
  budget: RequestBudget,
  dryRun: boolean,
) {
  const selection = await readSelectionFile(true)
  assertCompleteSelection(selection)

  const expectedRequests = selection.records.reduce(
    (total, record) => total + 1 + (record.images?.length ?? 0),
    0,
  )
  ensureExpectedRequests(expectedRequests, budget.maximum)

  const generatedAt = new Date().toISOString()
  const snapshotId = generatedAt.replace(/[-:.]/g, "").replace("Z", "Z")
  const stagingDirectory = path.join(CACHE_DIR, `staging-${snapshotId}-${process.pid}`)
  await mkdir(stagingDirectory, { recursive: false })

  const outputRecords: Artifact[] = []
  for (const [index, selectionRecord] of selection.records.entries()) {
    const artifact = findLocalArtifact(selectionRecord.localId)
    await budget.consume()
    const result = await client.getRelicDetail(selectionRecord.sourceId)
    const detail = getSingleDetail(result.items, selectionRecord.sourceId)
    assertIdentityMatch(artifact, selectionRecord, detail)
    const metadataRights = validateMetadataRights(selectionRecord, detail)
    const imageAssets = await downloadReviewedImages(
      client,
      budget,
      result.images,
      selectionRecord,
      stagingDirectory,
      snapshotId,
    )

    outputRecords.push(buildVerifiedArtifact(
      artifact,
      detail,
      result.images,
      imageAssets,
      metadataRights,
      generatedAt,
    ))
    console.log(`[emuseum] sync ${index + 1}/${selection.records.length}: local id ${artifact.id}`)
  }

  const snapshot: EmuseumArtifactSnapshot = {
    schemaVersion: 1,
    datasetId: EMUSEUM_DATASET_ID,
    verified: true,
    generatedAt,
    recordCount: outputRecords.length,
    requestCount: budget.used,
    records: outputRecords.sort((a, b) => a.id - b.id),
  }
  assertSnapshotReady(snapshot)

  if (dryRun) {
    await writeSecretFreeJson(path.join(CACHE_DIR, "emuseum-artifacts.preview.json"), snapshot)
    console.log("[emuseum] Dry run complete; the current published snapshot was not changed.")
    return
  }

  await mkdir(PUBLIC_IMAGE_ROOT, { recursive: true })
  const finalImageDirectory = path.join(PUBLIC_IMAGE_ROOT, snapshotId)
  if (existsSync(finalImageDirectory)) {
    throw new SyncError("The generated image snapshot directory already exists.")
  }

  // Images use a new versioned directory, so publication never mutates files
  // referenced by the last known-good snapshot.
  await rename(stagingDirectory, finalImageDirectory)
  await writeSecretFreeJson(SNAPSHOT_PATH, snapshot)
  console.log(`[emuseum] Published verified snapshot ${snapshotId}.`)
}

async function downloadReviewedImages(
  client: EmuseumClient,
  budget: RequestBudget,
  imageItems: EmuseumImageItem[],
  selection: SelectionRecord,
  stagingDirectory: string,
  snapshotId: string,
): Promise<ArtifactImageAsset[]> {
  const reviews = selection.images ?? []
  if (reviews.length === 0) {
    throw new SyncError(`Local id ${selection.localId} has no reviewed image rights.`)
  }

  const imagesById = new Map(imageItems.map((item) => [item.sourceImageId, item]))
  const seenImageIds = new Set<string>()
  const assets: ArtifactImageAsset[] = []

  for (const review of reviews) {
    validateImageRightsReview(review, selection.localId)
    if (seenImageIds.has(review.sourceImageId)) {
      throw new SyncError(`Local id ${selection.localId} repeats an image review.`)
    }
    seenImageIds.add(review.sourceImageId)

    const sourceImage = imagesById.get(review.sourceImageId)
    if (!sourceImage) {
      throw new SyncError(`Local id ${selection.localId} references an unavailable image id.`)
    }
    const reference = sourceImage.images.large
      ?? sourceImage.images.original
      ?? sourceImage.images.medium
      ?? sourceImage.images.small
    if (!reference) {
      throw new SyncError(`Local id ${selection.localId} has no downloadable reviewed image.`)
    }

    await budget.consume()
    const download = await client.downloadImage(reference)
    assertImageSignature(download)
    const sha256 = createHash("sha256").update(download.bytes).digest("hex")
    const filename = [
      String(selection.localId).padStart(3, "0"),
      String(sourceImage.order).padStart(2, "0"),
      sha256.slice(0, 12),
    ].join("-") + `.${download.extension}`
    await writeFile(path.join(stagingDirectory, filename), download.bytes, { flag: "wx" })

    assets.push(compactObject({
      src: `/artworks/emuseum/${snapshotId}/${filename}`,
      sourceImageId: sourceImage.sourceImageId,
      order: sourceImage.order,
      contentType: download.contentType,
      sha256,
      credit: review.credit.trim(),
      rightsStatus: review.rightsStatus,
      rightsHolder: review.rightsHolder?.trim() || undefined,
      copyrightNotice: review.copyrightNotice?.trim() || undefined,
      evidenceUrl: normalizeHttpsUrl(review.evidenceUrl, "image evidenceUrl"),
      verifiedAt: normalizeIsoDate(review.verifiedAt, "image verifiedAt"),
    }))
  }

  return assets.sort((a, b) => a.order - b.order)
}

function buildVerifiedArtifact(
  artifact: Artifact,
  detail: EmuseumRelicDetail,
  sourceImages: EmuseumImageItem[],
  images: ArtifactImageAsset[],
  metadataRights: ArtifactMetadataRights,
  syncedAt: string,
): Artifact {
  const officialData = compactObject({
    provider: "emuseum" as const,
    datasetId: EMUSEUM_DATASET_ID,
    datasetName: EMUSEUM_DATASET_NAME,
    datasetUrl: DATASET_URL,
    sourceId: detail.id,
    officialNameKr: detail.nameKr,
    alternateNameHanja: detail.alternateNameHanja,
    museumCode: detail.museumCode,
    museumName: detail.museumName2 ?? detail.museumName1 ?? "이뮤지엄 소장기관",
    museumSubdivision: detail.museumName3,
    relicNo: detail.relicNo,
    relicSubNo: detail.relicSubNo,
    author: detail.author,
    nationality: detail.nationalityName1,
    period: detail.nationalityName2,
    material: detail.materialName2 ?? detail.materialName1,
    purpose: deepestValue([
      detail.purposeName1,
      detail.purposeName2,
      detail.purposeName3,
      detail.purposeName4,
    ]),
    location: joinUnique([detail.placeLandName1, detail.placeLandName2]),
    designation: detail.designationInfo,
    size: detail.sizeInfo,
    description: detail.description ? toPlainText(detail.description) : undefined,
    indexWords: detail.indexWords,
    syncedAt,
    normalizedSha256: "",
  })

  const normalizedForHash = {
    ...officialData,
    syncedAt: undefined,
    normalizedSha256: undefined,
    sourceImages: sourceImages.map((image) => ({
      sourceImageId: image.sourceImageId,
      order: image.order,
    })),
  }
  officialData.normalizedSha256 = createHash("sha256")
    .update(JSON.stringify(normalizedForHash))
    .digest("hex")

  const officialArtifactNumber = detail.relicNo
    ? detail.relicSubNo && !/^0+$/.test(detail.relicSubNo)
      ? `${detail.relicNo}-${detail.relicSubNo}`
      : detail.relicNo
    : undefined
  const officialDesignation = detail.designationInfo
    ?? detail.designationName2
    ?? detail.designationName1

  return compactObject({
    ...artifact,
    image: images[0].src,
    images,
    culturalProperty: officialDesignation,
    artifactNumber: officialArtifactNumber,
    dimensions: detail.sizeInfo ?? artifact.dimensions,
    source: officialData,
    rights: {
      metadata: metadataRights,
      imagesHaveSeparateRights: true,
    },
  })
}

function validateMetadataRights(
  selection: SelectionRecord,
  detail: EmuseumRelicDetail,
): ArtifactMetadataRights {
  const review = selection.metadataRights
  if (!review) throw new SyncError(`Local id ${selection.localId} has no metadata rights review.`)
  if (review.basis !== "kogl-1" && review.basis !== "permission") {
    throw new SyncError(`Local id ${selection.localId} has an unsupported metadata rights basis.`)
  }
  if (review.basis === "kogl-1" && detail.koglType !== "1") {
    throw new SyncError(`Local id ${selection.localId} is not marked as KOGL type 1 by the API.`)
  }
  if (!review.attribution.trim() || !review.reviewer.trim()) {
    throw new SyncError(`Local id ${selection.localId} has an incomplete metadata rights review.`)
  }

  return {
    basis: review.basis,
    koglType: detail.koglType ? Number(detail.koglType) as 1 | 2 | 3 | 4 : null,
    licenseUrl: review.basis === "kogl-1"
      ? KOGL_LICENSE_URL
      : normalizeHttpsUrl(review.evidenceUrl, "metadata permission evidenceUrl"),
    attribution: review.attribution.trim(),
    thirdPartyRightsIncluded: true,
    evidenceUrl: normalizeHttpsUrl(review.evidenceUrl, "metadata evidenceUrl"),
    verifiedAt: normalizeIsoDate(review.verifiedAt, "metadata verifiedAt"),
    reviewer: review.reviewer.trim(),
  }
}

function validateImageRightsReview(review: ImageRightsReview, localId: number) {
  if (!/^[A-Za-z0-9]+$/.test(review.sourceImageId)) {
    throw new SyncError(`Local id ${localId} has an invalid source image id.`)
  }
  if (review.rightsStatus !== "kogl-1" && review.rightsStatus !== "third-party-permitted") {
    throw new SyncError(`Local id ${localId} has an unapproved image rights status.`)
  }
  if (!review.credit.trim()) {
    throw new SyncError(`Local id ${localId} has an image without a visible credit.`)
  }
  if (review.rightsStatus === "third-party-permitted" && !review.rightsHolder?.trim()) {
    throw new SyncError(`Local id ${localId} is missing the third-party rights holder.`)
  }
  normalizeHttpsUrl(review.evidenceUrl, "image evidenceUrl")
  normalizeIsoDate(review.verifiedAt, "image verifiedAt")
}

function assertIdentityMatch(
  artifact: Artifact,
  selection: SelectionRecord,
  detail: EmuseumRelicDetail,
) {
  if (detail.id !== selection.sourceId) {
    throw new SyncError(`Local id ${artifact.id} returned an unexpected source id.`)
  }
  const acceptedNames = [artifact.name.ko, ...selection.acceptedOfficialNames]
  if (!acceptedNames.some((name) => sameName(name, detail.nameKr))) {
    throw new SyncError(`Local id ${artifact.id} does not match the reviewed official name.`)
  }
}

function getSingleDetail(items: EmuseumRelicDetail[], expectedId: string) {
  if (items.length !== 1 || items[0].id !== expectedId) {
    throw new SyncError("The eMuseum detail response did not contain exactly the selected record.")
  }
  return items[0]
}

async function readSelectionFile(requireRights: boolean): Promise<SelectionFile> {
  let parsed: unknown
  try {
    parsed = JSON.parse(await readFile(SELECTION_PATH, "utf8"))
  } catch {
    throw new SyncError("data/emuseum-selections.json could not be read as JSON.")
  }
  if (!isObject(parsed) || parsed.schemaVersion !== 1 || parsed.datasetId !== EMUSEUM_DATASET_ID) {
    throw new SyncError("The eMuseum selection file has an invalid header.")
  }
  if (!Array.isArray(parsed.records)) {
    throw new SyncError("The eMuseum selection file records value must be an array.")
  }

  const ids = new Set<number>()
  const sourceIds = new Set<string>()
  const records = parsed.records.map((value, index) => {
    if (!isObject(value)) throw new SyncError(`Selection record ${index + 1} must be an object.`)
    const localId = requireInteger(value.localId, `selection ${index + 1} localId`, 1, 100)
    const sourceId = requireSafeId(value.sourceId, `selection ${index + 1} sourceId`)
    if (ids.has(localId) || sourceIds.has(sourceId)) {
      throw new SyncError("Selection local ids and source ids must be unique.")
    }
    ids.add(localId)
    sourceIds.add(sourceId)
    if (value.identityReviewed !== true) {
      throw new SyncError(`Selection for local id ${localId} has not passed identity review.`)
    }

    const acceptedOfficialNames = Array.isArray(value.acceptedOfficialNames)
      ? value.acceptedOfficialNames.map((name) => requireText(name, "accepted official name", 100))
      : []
    const metadataRights = value.metadataRights == null
      ? undefined
      : parseMetadataRightsReview(value.metadataRights, localId)
    const images = value.images == null
      ? undefined
      : parseImageRightsReviews(value.images, localId)

    if (requireRights && (!metadataRights || !images?.length)) {
      throw new SyncError(`Selection for local id ${localId} has incomplete rights review.`)
    }

    return { localId, sourceId, acceptedOfficialNames, identityReviewed: true, metadataRights, images }
  })

  return { schemaVersion: 1, datasetId: EMUSEUM_DATASET_ID, records }
}

function parseMetadataRightsReview(value: unknown, localId: number): MetadataRightsReview {
  if (!isObject(value)) throw new SyncError(`Local id ${localId} metadataRights must be an object.`)
  const basis = value.basis
  if (basis !== "kogl-1" && basis !== "permission") {
    throw new SyncError(`Local id ${localId} has an invalid metadata rights basis.`)
  }
  return {
    basis,
    attribution: requireText(value.attribution, "metadata attribution", 500),
    evidenceUrl: requireText(value.evidenceUrl, "metadata evidenceUrl", 2_000),
    verifiedAt: requireText(value.verifiedAt, "metadata verifiedAt", 50),
    reviewer: requireText(value.reviewer, "metadata reviewer", 100),
  }
}

function parseImageRightsReviews(value: unknown, localId: number): ImageRightsReview[] {
  if (!Array.isArray(value)) throw new SyncError(`Local id ${localId} images must be an array.`)
  return value.map((candidate) => {
    if (!isObject(candidate)) throw new SyncError(`Local id ${localId} has an invalid image review.`)
    const rightsStatus = candidate.rightsStatus
    if (rightsStatus !== "kogl-1" && rightsStatus !== "third-party-permitted") {
      throw new SyncError(`Local id ${localId} has an invalid image rights status.`)
    }
    return compactObject({
      sourceImageId: requireSafeId(candidate.sourceImageId, "source image id"),
      rightsStatus,
      credit: requireText(candidate.credit, "image credit", 500),
      rightsHolder: optionalText(candidate.rightsHolder, 300),
      copyrightNotice: optionalText(candidate.copyrightNotice, 500),
      evidenceUrl: requireText(candidate.evidenceUrl, "image evidenceUrl", 2_000),
      verifiedAt: requireText(candidate.verifiedAt, "image verifiedAt", 50),
    })
  })
}

function assertCompleteSelection(selection: SelectionFile) {
  if (selection.records.length !== EXPECTED_ARTIFACT_COUNT) {
    throw new SyncError(`A publishable selection must contain ${EXPECTED_ARTIFACT_COUNT} records.`)
  }
  const sortedIds = selection.records.map((record) => record.localId).sort((a, b) => a - b)
  if (sortedIds.some((id, index) => id !== index + 1)) {
    throw new SyncError("A publishable selection must cover every local id from 1 to 100.")
  }
}

function assertSnapshotReady(snapshot: EmuseumArtifactSnapshot) {
  if (!snapshot.verified || snapshot.records.length !== EXPECTED_ARTIFACT_COUNT) {
    throw new SyncError("The generated snapshot is incomplete.")
  }
  const hashes = new Map<string, number>()
  for (const artifact of snapshot.records) {
    if (!artifact.source || !artifact.rights || !artifact.images?.length) {
      throw new SyncError(`Generated artifact ${artifact.id} is missing provenance or rights.`)
    }
    for (const image of artifact.images) {
      const previousArtifactId = hashes.get(image.sha256)
      if (previousArtifactId !== undefined && previousArtifactId !== artifact.id) {
        throw new SyncError("The same image bytes are mapped to different artifacts.")
      }
      hashes.set(image.sha256, artifact.id)
    }
  }
}

function assertImageSignature(download: EmuseumImageDownload) {
  const bytes = download.bytes
  const matches = download.contentType === "image/jpeg"
    ? bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : download.contentType === "image/png"
      ? bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
        .every((value, index) => bytes[index] === value)
      : download.contentType === "image/webp"
        ? bytes.length >= 12
          && textBytes(bytes, 0, 4) === "RIFF"
          && textBytes(bytes, 8, 12) === "WEBP"
        : bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(textBytes(bytes, 0, 6))

  if (!matches) throw new SyncError("An image body does not match its declared content type.")
}

function textBytes(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end))
}

async function writeSecretFreeJson(destination: string, value: unknown) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`
  assertSecretFree(serialized)
  await mkdir(path.dirname(destination), { recursive: true })
  const temporaryPath = `${destination}.${process.pid}.tmp`
  await writeFile(temporaryPath, serialized, { encoding: "utf8", mode: 0o644 })
  await rename(temporaryPath, destination)
}

function assertSecretFree(serialized: string) {
  const rawKey = process.env.MUSEUM_API_KEY?.trim()
  const keyVariants = new Set<string>()
  if (rawKey) {
    keyVariants.add(rawKey)
    try { keyVariants.add(decodeURIComponent(rawKey)) } catch { /* validated by the client */ }
    for (const value of [...keyVariants]) keyVariants.add(encodeURIComponent(value))
  }
  if (/serviceKey/i.test(serialized)) {
    throw new SyncError("Generated output contains a forbidden serviceKey field.")
  }
  for (const value of keyVariants) {
    if (value && serialized.includes(value)) {
      throw new SyncError("Generated output contains an API-key value.")
    }
  }
}

async function loadLocalEnvironment() {
  const envPath = path.join(PROJECT_ROOT, ".env.local")
  if (!existsSync(envPath)) return
  const contents = await readFile(envPath, "utf8")
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!match || ![
      "MUSEUM_API_KEY",
      "MUSEUM_API_URL",
      "MUSEUM_API_ALLOW_INSECURE_HTTP",
    ].includes(match[1])) continue
    if (process.env[match[1]] !== undefined) continue
    let value = match[2]
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[match[1]] = value
  }
}

function parseCliOptions(args: string[]): CliOptions {
  const command = args[0]
  if (command !== "discover" && command !== "inspect" && command !== "sync") {
    throw new SyncError("Usage: emuseum-sync <discover|inspect|sync> [--limit N] [--max-requests N] [--dry-run]")
  }
  const limit = readIntegerOption(args, "--limit", EXPECTED_ARTIFACT_COUNT, 1, EXPECTED_ARTIFACT_COUNT)
  const requestedMaximum = readIntegerOption(
    args,
    "--max-requests",
    MAX_DAILY_AUTOMATION_REQUESTS,
    1,
    MAX_DAILY_AUTOMATION_REQUESTS,
  )
  return {
    command,
    limit,
    maxRequests: Math.min(requestedMaximum, MAX_DAILY_AUTOMATION_REQUESTS),
    dryRun: args.includes("--dry-run"),
  }
}

function readIntegerOption(
  args: string[],
  name: string,
  fallback: number,
  min: number,
  max: number,
) {
  const index = args.indexOf(name)
  if (index < 0) return fallback
  return requireInteger(args[index + 1], name, min, max)
}

function ensureExpectedRequests(expected: number, maximum: number) {
  if (expected > maximum) {
    throw new SyncError(`This operation requires at least ${expected} requests, above the safe budget of ${maximum}.`)
  }
}

function findLocalArtifact(localId: number) {
  const artifact = artifacts.find((candidate) => candidate.id === localId)
  if (!artifact) throw new SyncError(`Local artifact id ${localId} does not exist.`)
  return artifact
}

function sameName(left: string, right: string) {
  return normalizeName(left) === normalizeName(right)
}

function normalizeName(value: string) {
  return value.normalize("NFKC").replace(/[\s·ㆍ・\-–—_]/g, "").toLowerCase()
}

function deepestValue(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value)).at(-1)
}

function joinUnique(values: Array<string | undefined>) {
  const parts = [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))]
  return parts.length > 0 ? parts.join(" ") : undefined
}

function toPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&(?:prime|#8242);/gi, "′")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .trim()
}

function normalizeHttpsUrl(value: string, field: string) {
  let url: URL
  try { url = new URL(value.trim()) } catch { throw new SyncError(`${field} must be an absolute URL.`) }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new SyncError(`${field} must be a clean HTTPS URL.`)
  }
  return url.toString()
}

function normalizeIsoDate(value: string, field: string) {
  const normalized = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized) || Number.isNaN(Date.parse(`${normalized}T00:00:00Z`))) {
    throw new SyncError(`${field} must use YYYY-MM-DD.`)
  }
  if (Date.parse(`${normalized}T00:00:00Z`) > Date.now()) {
    throw new SyncError(`${field} cannot be in the future.`)
  }
  return normalized
}

function requireSafeId(value: unknown, field: string) {
  const normalized = requireText(value, field, 30)
  if (!/^[A-Za-z0-9]+$/.test(normalized)) throw new SyncError(`${field} has an invalid format.`)
  return normalized
}

function requireText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string") throw new SyncError(`${field} must be text.`)
  const normalized = value.trim()
  if (!normalized || normalized.length > maxLength || /[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new SyncError(`${field} is empty, too long, or contains control characters.`)
  }
  return normalized
}

function optionalText(value: unknown, maxLength: number) {
  if (value == null || value === "") return undefined
  return requireText(value, "optional text", maxLength)
}

function requireInteger(value: unknown, field: string, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new SyncError(`${field} must be an integer between ${min} and ${max}.`)
  }
  return parsed
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function compactObject<T extends object>(value: T): T {
  for (const key of Object.keys(value) as Array<keyof T>) {
    if (value[key] === undefined) delete value[key]
  }
  return value
}

main().catch((error: unknown) => {
  if (error instanceof EmuseumClientError) {
    const details = [
      `code=${error.code}`,
      error.resultCode ? `resultCode=${error.resultCode}` : undefined,
      error.status ? `status=${error.status}` : undefined,
      `retryable=${error.retryable}`,
    ].filter(Boolean).join(" ")
    console.error(`[emuseum] API failure: ${details}`)
  } else if (error instanceof SyncError) {
    console.error(`[emuseum] ${error.message}`)
  } else {
    console.error("[emuseum] Sync failed with an unexpected local error; no secret-bearing details were printed.")
  }
  process.exitCode = 1
})
