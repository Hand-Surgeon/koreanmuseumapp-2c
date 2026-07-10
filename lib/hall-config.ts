import type {
  HallDescriptionTranslationKey,
  HallName,
  HallTranslationKey,
} from "@/types/hall"

export interface HallConfig {
  translatedName: HallTranslationKey
  descriptionKey: HallDescriptionTranslationKey
  icon: string
  color: string
  textColor: string
  badgeColor: string
}

export type HallConfigMap = Record<HallName, HallConfig>

export const hallConfigs: HallConfigMap = {
  고고관: {
    translatedName: "archaeologyHall",
    descriptionKey: "archaeologyDesc",
    icon: "🏺",
    color: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
    textColor: "text-amber-800",
    badgeColor: "bg-amber-500",
  },
  미술관: {
    translatedName: "artHall",
    descriptionKey: "artDesc",
    icon: "🎨",
    color: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
    textColor: "text-blue-800",
    badgeColor: "bg-blue-500",
  },
  역사관: {
    translatedName: "historyHall",
    descriptionKey: "historyDesc",
    icon: "📜",
    color: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
    textColor: "text-green-800",
    badgeColor: "bg-green-500",
  },
  아시아관: {
    translatedName: "asiaHall",
    descriptionKey: "asiaDesc",
    icon: "🌏",
    color: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200",
    textColor: "text-purple-800",
    badgeColor: "bg-purple-500",
  },
  기증관: {
    translatedName: "donationHall",
    descriptionKey: "donationDesc",
    icon: "🎁",
    color: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200",
    textColor: "text-gray-800",
    badgeColor: "bg-gray-500",
  },
}

export function getHallConfig(hallName: HallName): HallConfig {
  return hallConfigs[hallName]
}
