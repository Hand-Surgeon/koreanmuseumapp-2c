"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/useLanguage"
import { languageNames, languageFlags } from "@/data/translations"
import type { Language } from "@/types/language"

export function LanguageSelectorDropdown() {
  const { language, setLanguage } = useLanguage()
  const languages: Language[] = ["ko", "en", "zh", "ja", "th"]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full bg-white/90 backdrop-blur-sm border-gray-200"
          data-testid="language-selector"
        >
          <Globe className="w-4 h-4 mr-2" />
          {languageFlags[language]} {languageNames[language]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        data-testid="language-dropdown"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className="cursor-pointer"
            data-testid={`language-option-${lang}`}
          >
            <span className="mr-2 text-lg">{languageFlags[lang]}</span>
            <span className="flex-1">{languageNames[lang]}</span>
            {language === lang && (
              <span className="ml-2">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}