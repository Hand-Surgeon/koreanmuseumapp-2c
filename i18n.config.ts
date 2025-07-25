export const i18n = {
  defaultLocale: 'ko',
  locales: ['ko', 'en', 'zh', 'ja', 'th'] as const,
} as const

export type Locale = (typeof i18n)['locales'][number]

// 언어별 메타데이터
export const localeMetadata = {
  ko: {
    name: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
  },
  en: {
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
  },
  zh: {
    name: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
  },
  ja: {
    name: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
  },
  th: {
    name: 'ไทย',
    flag: '🇹🇭',
    direction: 'ltr',
  },
} as const