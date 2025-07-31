"use client"

import { Globe } from "lucide-react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/hooks/useLanguage"
import { languageNames, languageFlags } from "@/data/translations"
import type { Language } from "@/types/language"

export function LanguageSelectorForm() {
  const { language } = useLanguage()
  const pathname = usePathname()
  const languages: Language[] = ["ko", "en", "zh", "ja", "th"]

  const getNewPath = (newLang: Language) => {
    const segments = pathname.split('/')
    const currentLocale = segments[1]
    const isValidLocale = languages.includes(currentLocale as Language)
    
    if (isValidLocale) {
      segments[1] = newLang
      return segments.join('/')
    } else {
      return `/${newLang}${pathname}`
    }
  }

  return (
    <form className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <select
        name="locale"
        value={language}
        onChange={(e) => {
          const newLang = e.target.value as Language
          window.location.href = getNewPath(newLang)
        }}
        className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        data-testid="language-selector"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang} data-testid={`language-option-${lang}`}>
            {languageFlags[lang]} {languageNames[lang]}
          </option>
        ))}
      </select>
    </form>
  )
}