import type { Artifact } from "./artifact"

export const HALL_NAMES = ["고고관", "미술관", "역사관", "아시아관", "기증관"] as const

export type HallName = (typeof HALL_NAMES)[number]

export function isHallName(value: string): value is HallName {
  return HALL_NAMES.includes(value as HallName)
}

export type HallTranslationKey =
  | "archaeologyHall"
  | "artHall"
  | "historyHall"
  | "asiaHall"
  | "donationHall"

export type HallDescriptionTranslationKey =
  | "archaeologyDesc"
  | "artDesc"
  | "historyDesc"
  | "asiaDesc"
  | "donationDesc"

export interface HallStats {
  total: number
  nationalTreasures: number
  treasures: number
}

export interface Hall {
  name: HallName
  translatedName: string
  description: string
  icon: string
  color: string
  textColor: string
  stats: HallStats
  featured: Artifact[]
}
