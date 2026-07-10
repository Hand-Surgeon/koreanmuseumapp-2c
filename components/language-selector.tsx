"use client"

import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/useLanguage"
import { i18n, localeMetadata, type Locale } from "@/i18n.config"
import { cn } from "@/lib/utils"

const selectorLabels: Record<Locale, string> = {
  ko: "언어 선택",
  en: "Select language",
  zh: "选择语言",
  ja: "言語を選択",
  th: "เลือกภาษา",
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const activeLanguage = localeMetadata[language]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full bg-white/90 backdrop-blur-sm"
          aria-label={`${selectorLabels[language]}: ${activeLanguage.name}`}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span aria-hidden="true" className="text-xs font-semibold uppercase">{language}</span>
          <span className="hidden sm:inline">{activeLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {i18n.locales.map((locale) => {
          const metadata = localeMetadata[locale]
          const isActive = language === locale

          return (
            <DropdownMenuItem
              key={locale}
              onSelect={() => setLanguage(locale)}
              className={cn("cursor-pointer gap-3", isActive && "bg-gray-100")}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="w-6 text-xs font-semibold uppercase" aria-hidden="true">{locale}</span>
              <span className="flex-1" lang={locale}>{metadata.name}</span>
              {isActive && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
