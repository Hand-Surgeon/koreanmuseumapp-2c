"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { translations } from "@/data/translations"
import type { Language, Translation } from "@/types/language"
import { i18n, type Locale } from "@/i18n.config"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: Translation
  locale: Locale
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ 
  children, 
  initialLocale = 'ko' 
}: { 
  children: React.ReactNode
  initialLocale?: Locale 
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [language, setLanguageState] = useState<Language>(initialLocale)

  // URL에서 현재 locale 추출
  const currentLocale = pathname.split('/')[1] as Locale || i18n.defaultLocale

  // 언어 변경 함수
  const setLanguage = useCallback((newLanguage: Language) => {
    // 상태 업데이트
    setLanguageState(newLanguage)
    
    // 쿠키에 저장
    document.cookie = `locale=${newLanguage};path=/;max-age=31536000`
    
    // localStorage에도 저장 (백업)
    localStorage.setItem("museum-language", newLanguage)
    
    // URL 경로 변경
    const segments = pathname.split('/')
    segments[1] = newLanguage
    const newPath = segments.join('/')
    
    router.push(newPath)
  }, [pathname, router])

  // 초기화 및 동기화
  useEffect(() => {
    // URL의 locale과 상태 동기화
    if (currentLocale !== language && i18n.locales.includes(currentLocale)) {
      setLanguageState(currentLocale)
    }
  }, [currentLocale, language])

  const value = {
    language,
    setLanguage,
    t: translations[language],
    locale: language as Locale,
  }

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

// 서버 컴포넌트용 헬퍼 함수
export function getTranslations(locale: Locale): Translation {
  return translations[locale]
}

// 언어별 날짜 포맷터
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// 언어별 숫자 포맷터
export function formatNumber(number: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(number)
}