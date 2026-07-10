"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { translations } from "@/data/translations"
import { i18n, type Locale } from "@/i18n.config"
import {
  isSupportedLanguage,
  type Language,
  type Translation,
} from "@/types/language"

interface LanguageContextType {
  language: Language
  locale: Locale
  setLanguage: (language: Language) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getPathLocale(pathname: string): Language | null {
  const localeSegment = pathname.split('/')[1] ?? ''
  return isSupportedLanguage(localeSegment) ? localeSegment : null
}

function replacePathLocale(pathname: string, locale: Language) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] && isSupportedLanguage(segments[0])) {
    segments[0] = locale
  } else {
    segments.unshift(locale)
  }

  return `/${segments.join('/')}`
}

export function LanguageProvider({
  children,
  initialLocale = i18n.defaultLocale,
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const router = useRouter()
  const pathname = usePathname()
  const pathLocale = getPathLocale(pathname) ?? initialLocale
  const [language, setLanguageState] = useState<Language>(pathLocale)

  useEffect(() => {
    setLanguageState(pathLocale)

    const savedLanguage = localStorage.getItem("museum-language")
    if (savedLanguage !== pathLocale) {
      localStorage.setItem("museum-language", pathLocale)
    }

    document.cookie = `locale=${pathLocale}; path=/; max-age=31536000; SameSite=Lax`
  }, [pathLocale])

  const setLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage === language) return

    setLanguageState(newLanguage)
    localStorage.setItem("museum-language", newLanguage)
    document.cookie = `locale=${newLanguage}; path=/; max-age=31536000; SameSite=Lax`

    const nextPath = replacePathLocale(pathname, newLanguage)
    const search = typeof window === 'undefined' ? '' : window.location.search
    router.push(`${nextPath}${search}`)
  }, [language, pathname, router])

  const value = useMemo<LanguageContextType>(() => ({
    language,
    locale: language,
    setLanguage,
    t: translations[language],
  }), [language, setLanguage])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export function getTranslations(locale: Locale): Translation {
  return translations[locale]
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatNumber(number: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(number)
}
