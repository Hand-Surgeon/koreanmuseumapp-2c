import { Translation } from '@/types/language'

export interface HallConfig {
  translatedName: keyof Translation
  icon: string
  color: string
  textColor: string
  badgeColor: string
}

export type HallConfigMap = {
  [key: string]: HallConfig
}

export const hallConfigs: HallConfigMap = {
  고고관: {
    translatedName: 'archaeologyHall' as keyof Translation,
    icon: '🏺',
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-800',
    badgeColor: 'bg-amber-500',
  },
  미술관: {
    translatedName: 'artHall' as keyof Translation,
    icon: '🎨',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    badgeColor: 'bg-blue-500',
  },
  역사관: {
    translatedName: 'historyHall' as keyof Translation,
    icon: '📜',
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    badgeColor: 'bg-green-500',
  },
  아시아관: {
    translatedName: 'asiaHall' as keyof Translation,
    icon: '🌏',
    color: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-800',
    badgeColor: 'bg-purple-500',
  },
  기증관: {
    translatedName: 'donationHall' as keyof Translation,
    icon: '🎁',
    color: 'bg-gray-50 border-gray-200',
    textColor: 'text-gray-800',
    badgeColor: 'bg-gray-500',
  },
}

export const getHallConfig = (hallName: string): HallConfig => {
  return hallConfigs[hallName] || {
    translatedName: 'exhibitionHalls' as keyof Translation,
    icon: '🏛️',
    color: 'bg-gray-50 border-gray-200',
    textColor: 'text-gray-800',
    badgeColor: 'bg-gray-500',
  }
}