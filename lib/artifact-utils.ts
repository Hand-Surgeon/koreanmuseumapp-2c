import {
  ARTIFACT_CATEGORIES,
  type Artifact,
  type ArtifactCategory,
  type CulturalProperty,
} from "@/types/artifact"
import type { HallStats } from "@/types/hall"
import type { Language } from "@/types/language"

export type CulturalPropertyType = "nationalTreasure" | "treasure"

export interface ArtifactFilterOptions {
  searchTerm?: string
  category?: ArtifactCategory | null
  period?: string | null
  language?: Language
}

export type { HallStats } from "@/types/hall"

export function calculateHallStats(artifacts: readonly Artifact[]): HallStats {
  return {
    total: artifacts.length,
    nationalTreasures: artifacts.filter(
      (artifact) => getCulturalPropertyType(artifact.culturalProperty) === "nationalTreasure",
    ).length,
    treasures: artifacts.filter(
      (artifact) => getCulturalPropertyType(artifact.culturalProperty) === "treasure",
    ).length,
  }
}

export function getCulturalPropertyType(
  culturalProperty: CulturalProperty | undefined,
): CulturalPropertyType | null {
  if (!culturalProperty) return null

  const designation = culturalProperty.trim()
  if (/^국보(?:\s|제|\d)/.test(designation)) return "nationalTreasure"
  if (/^보물(?:\s|제|\d)/.test(designation)) return "treasure"
  return null
}

export function isArtifactCategory(value: string): value is ArtifactCategory {
  return ARTIFACT_CATEGORIES.includes(value as ArtifactCategory)
}

/** 카테고리 식별자와 Translation 키는 같은 canonical 값을 사용합니다. */
export function getCategoryTranslationKey(category: ArtifactCategory): ArtifactCategory {
  return category
}

export function filterArtifacts(
  artifacts: readonly Artifact[],
  options: ArtifactFilterOptions,
): Artifact[]
/** @deprecated 옵션 객체 형식을 사용하세요. */
export function filterArtifacts(
  artifacts: readonly Artifact[],
  searchTerm: string,
  selectedCategory: ArtifactCategory | string,
  language: Language,
  allCategoryText: string,
): Artifact[]
export function filterArtifacts(
  artifacts: readonly Artifact[],
  optionsOrSearchTerm: ArtifactFilterOptions | string,
  selectedCategory?: ArtifactCategory | string,
  language: Language = "ko",
  allCategoryText = "",
): Artifact[] {
  const options: ArtifactFilterOptions =
    typeof optionsOrSearchTerm === "string"
      ? {
          searchTerm: optionsOrSearchTerm,
          category:
            selectedCategory && selectedCategory !== allCategoryText && isArtifactCategory(selectedCategory)
              ? selectedCategory
              : null,
          language,
        }
      : optionsOrSearchTerm

  const searchLanguage = options.language ?? "ko"
  const normalizedSearchTerm = options.searchTerm?.trim().toLocaleLowerCase(searchLanguage) ?? ""
  const normalizedPeriod = options.period?.trim().toLocaleLowerCase(searchLanguage) ?? ""

  return artifacts.filter((artifact) => {
    const searchableText = [
      artifact.name[searchLanguage],
      artifact.description[searchLanguage],
      artifact.detailedInfo[searchLanguage],
      artifact.period[searchLanguage],
    ]
      .join(" ")
      .toLocaleLowerCase(searchLanguage)

    const matchesSearch = !normalizedSearchTerm || searchableText.includes(normalizedSearchTerm)
    const matchesCategory = !options.category || artifact.category === options.category
    const matchesPeriod =
      !normalizedPeriod ||
      artifact.period[searchLanguage].trim().toLocaleLowerCase(searchLanguage) === normalizedPeriod

    return matchesSearch && matchesCategory && matchesPeriod
  })
}
