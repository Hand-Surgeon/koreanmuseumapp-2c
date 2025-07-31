import { Artifact } from '@/types/artifact'

export interface HallStats {
  total: number
  nationalTreasures: number
  treasures: number
}

export function calculateHallStats(artifacts: Artifact[]): HallStats {
  return {
    total: artifacts.length,
    nationalTreasures: artifacts.filter(a => a.culturalProperty?.includes('국보')).length,
    treasures: artifacts.filter(a => a.culturalProperty?.includes('보물') && !a.culturalProperty?.includes('국보')).length,
  }
}

export function getCulturalPropertyType(culturalProperty: string | undefined): 'nationalTreasure' | 'treasure' | null {
  if (!culturalProperty) return null
  if (culturalProperty.includes('국보')) return 'nationalTreasure'
  if (culturalProperty.includes('보물')) return 'treasure'
  return null
}

export function filterArtifacts(
  artifacts: Artifact[],
  searchTerm: string,
  selectedCategory: string,
  language: 'ko' | 'en' | 'zh' | 'ja' | 'th',
  allCategoryText: string
): Artifact[] {
  return artifacts.filter((artifact) => {
    const matchesSearch =
      artifact.name[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.description[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.period[language].toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === allCategoryText || artifact.category === selectedCategory
    return matchesSearch && matchesCategory
  })
}