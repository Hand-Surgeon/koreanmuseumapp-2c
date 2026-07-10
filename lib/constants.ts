export const CARD_STYLES = {
  base: 'overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 border-0 rounded-2xl group',
  featured: 'col-span-2 row-span-2',
  regular: '',
} as const

export const IMAGE_STYLES = {
  base: 'object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300',
  thumbnail: 'object-contain bg-gray-100 rounded-lg',
  preview: 'object-contain bg-white/50 rounded-lg',
} as const

export const BADGE_STYLES = {
  nationalTreasure: 'bg-red-700 text-white rounded-full',
  treasure: 'bg-orange-800 text-white rounded-full',
  category: 'rounded-full',
} as const
