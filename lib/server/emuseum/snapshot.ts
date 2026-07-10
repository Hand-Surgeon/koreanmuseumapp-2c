import snapshotData from "@/data/generated/emuseum-artifacts.json"
import type { Artifact } from "@/types/artifact"
import type { EmuseumArtifactSnapshot } from "@/types/emuseum-snapshot"

const EXPECTED_ARTIFACT_COUNT = 100

interface SnapshotValidation {
  valid: boolean
  verified: boolean
  reason?: string
  records?: Artifact[]
}

let cachedValidation: SnapshotValidation | undefined

export function validateEmuseumSnapshot(value: unknown): SnapshotValidation {
  if (!isObject(value)) return invalid("Snapshot must be an object.")
  if (value.schemaVersion !== 1) return invalid("Snapshot schemaVersion must be 1.")
  if (value.datasetId !== "3036708") return invalid("Snapshot datasetId is invalid.")
  if (typeof value.verified !== "boolean") return invalid("Snapshot verified flag is invalid.")

  if (!value.verified) {
    return { valid: true, verified: false }
  }

  if (!isIsoDate(value.generatedAt)) return invalid("Verified snapshot generatedAt is invalid.")
  if (value.recordCount !== EXPECTED_ARTIFACT_COUNT) {
    return invalid(`Verified snapshot must declare ${EXPECTED_ARTIFACT_COUNT} records.`)
  }
  if (!Array.isArray(value.records) || value.records.length !== EXPECTED_ARTIFACT_COUNT) {
    return invalid(`Verified snapshot must contain ${EXPECTED_ARTIFACT_COUNT} records.`)
  }

  const ids = new Set<number>()
  const sourceIds = new Set<string>()
  for (const candidate of value.records) {
    if (!isObject(candidate) || !Number.isInteger(candidate.id)) {
      return invalid("Every snapshot record must have an integer id.")
    }
    const id = candidate.id as number
    if (id < 1 || id > EXPECTED_ARTIFACT_COUNT || ids.has(id)) {
      return invalid("Snapshot record ids must be unique values from 1 to 100.")
    }
    ids.add(id)

    if (!isObject(candidate.source)) return invalid(`Artifact ${id} has no source metadata.`)
    if (
      candidate.source.provider !== "emuseum"
      || candidate.source.datasetId !== "3036708"
      || typeof candidate.source.sourceId !== "string"
      || !candidate.source.sourceId
      || sourceIds.has(candidate.source.sourceId)
    ) {
      return invalid(`Artifact ${id} has invalid or duplicate eMuseum source metadata.`)
    }
    sourceIds.add(candidate.source.sourceId)

    if (!Array.isArray(candidate.images) || candidate.images.length === 0) {
      return invalid(`Artifact ${id} has no verified images.`)
    }
    const firstImage = candidate.images[0]
    if (!isObject(firstImage) || candidate.image !== firstImage.src) {
      return invalid(`Artifact ${id} representative image is inconsistent.`)
    }

    if (!isObject(candidate.rights) || !isObject(candidate.rights.metadata)) {
      return invalid(`Artifact ${id} has no verified metadata rights.`)
    }
  }

  return {
    valid: true,
    verified: true,
    records: value.records as Artifact[],
  }
}

export function getVerifiedEmuseumArtifacts(): readonly Artifact[] | null {
  const validation = getBundledValidation()
  if (!validation.valid) {
    throw new Error(`Invalid verified eMuseum snapshot: ${validation.reason}`)
  }
  return validation.verified ? validation.records ?? null : null
}

export function isMuseumDataVerified() {
  const validation = getBundledValidation()
  return process.env.MUSEUM_DATA_VERIFIED === "true"
    && validation.valid
    && validation.verified
}

export function getEmuseumSnapshotStatus(): Pick<EmuseumArtifactSnapshot, "verified" | "recordCount" | "generatedAt"> {
  const raw = snapshotData as unknown as Partial<EmuseumArtifactSnapshot>
  return {
    verified: getBundledValidation().verified,
    recordCount: typeof raw.recordCount === "number" ? raw.recordCount : 0,
    generatedAt: typeof raw.generatedAt === "string" ? raw.generatedAt : null,
  }
}

function getBundledValidation() {
  cachedValidation ??= validateEmuseumSnapshot(snapshotData)
  return cachedValidation
}

function invalid(reason: string): SnapshotValidation {
  return { valid: false, verified: false, reason }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
    && !Number.isNaN(Date.parse(value))
}
