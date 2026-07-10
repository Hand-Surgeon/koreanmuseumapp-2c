import type { Artifact } from "./artifact"

export const EMUSEUM_SNAPSHOT_SCHEMA_VERSION = 1 as const

export interface EmuseumArtifactSnapshot {
  schemaVersion: typeof EMUSEUM_SNAPSHOT_SCHEMA_VERSION
  datasetId: "3036708"
  verified: boolean
  generatedAt: string | null
  recordCount: number
  requestCount: number
  records: Artifact[]
}
