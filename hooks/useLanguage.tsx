"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import type { Language } from "@/types/language"
import { translations } from "@/data/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.ko
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export function LanguageProvider({ children, initialLocale = "ko" }: { children: React.ReactNode; initialLocale?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLocale)

  useEffect(() => {
    // Use initial locale from URL, don't override with localStorage
    setLanguageState(initialLocale)
  }, [initialLocale])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("museum-language", lang)
  }

  const t = translations[language]

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}
