import { artifacts } from '@/data/artifacts'
import { translations } from '@/data/translations'
import { getCulturalPropertyType } from '@/lib/artifact-utils'
import { getHallConfig } from '@/lib/hall-config'
import { getVerifiedEmuseumArtifacts } from '@/lib/server/emuseum/snapshot'
import type { Artifact, FavoriteArtifactSummary, HallName } from '@/types/artifact'
import type { Language } from '@/types/language'

/**
 * Server-side access boundary for artifact data.
 *
 * The current implementation uses the checked-in catalog. A remote museum API
 * adapter can replace this module once its endpoint, authentication contract,
 * response schema, and usage rights are documented.
 */
export function listArtifacts(): readonly Artifact[] {
  return getArtifactCatalog()
}

export function findArtifactById(id: number): Artifact | undefined {
  return getArtifactCatalog().find((artifact) => artifact.id === id)
}

export function listArtifactsByHall(hall: HallName): Artifact[] {
  return getArtifactCatalog().filter((artifact) => artifact.hall === hall)
}

export function listRelatedArtifacts(artifact: Artifact, limit = 3): Artifact[] {
  return getArtifactCatalog()
    .filter((candidate) => (
      candidate.id !== artifact.id
      && (candidate.category === artifact.category || candidate.hall === artifact.hall)
    ))
    .slice(0, limit)
}

export function listFavoriteArtifactSummaries(
  ids: readonly number[],
  language: Language,
): FavoriteArtifactSummary[] {
  const artifactsById = new Map(getArtifactCatalog().map((artifact) => [artifact.id, artifact]))
  const t = translations[language]

  return ids.flatMap((id) => {
    const artifact = artifactsById.get(id)
    if (!artifact) return []

    const propertyType = getCulturalPropertyType(artifact.culturalProperty)
    const culturalProperty = language === 'ko'
      ? artifact.culturalProperty
      : propertyType
        ? t[propertyType]
        : undefined

    return [{
      id: artifact.id,
      name: artifact.name[language],
      period: artifact.period[language],
      description: artifact.description[language],
      image: artifact.image,
      category: t[artifact.category],
      hall: t[getHallConfig(artifact.hall).translatedName],
      culturalProperty,
      provenance: artifact.source && artifact.rights
        ? {
          sourceId: artifact.source.sourceId,
          museumName: artifact.source.museumName,
          datasetUrl: artifact.source.datasetUrl,
          attribution: artifact.rights.metadata.attribution,
          licenseUrl: artifact.rights.metadata.licenseUrl,
          imageCredit: artifact.images?.[0]?.credit,
          imageEvidenceUrl: artifact.images?.[0]?.evidenceUrl,
        }
        : undefined,
    }]
  })
}

function getArtifactCatalog(): readonly Artifact[] {
  return getVerifiedEmuseumArtifacts() ?? artifacts
}
