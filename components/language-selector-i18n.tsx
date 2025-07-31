"use client"

import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/useLanguage-i18n"
import { i18n, localeMetadata } from "@/i18n.config"
import { cn } from "@/lib/utils"

export function LanguageSelectorI18n() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          aria-label="언어 선택"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeMetadata[language].name}
          </span>
          <span className="sm:hidden">
            {localeMetadata[language].flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {i18n.locales.map((locale) => {
          const meta = localeMetadata[locale]
          const isActive = language === locale
          
          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => setLanguage(locale)}
              className={cn(
                "gap-3 cursor-pointer",
                isActive && "bg-gray-100"
              )}
            >
              <span className="text-xl" role="img" aria-label={meta.name}>
                {meta.flag}
              </span>
              <span className="flex-1">{meta.name}</span>
              {isActive && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}