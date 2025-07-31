"use client"

import { useState } from "react"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/useLanguage"
import { languageNames, languageFlags } from "@/data/translations"
import type { Language } from "@/types/language"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [showSelector, setShowSelector] = useState(false)

  const languages: Language[] = ["ko", "en", "zh", "ja", "th"]

  if (!showSelector) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowSelector(true)}
        className="rounded-full bg-white/90 backdrop-blur-sm border-gray-200"
      >
        <Globe className="w-4 h-4 mr-2" />
        {languageFlags[language]} {languageNames[language]}
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-white/95 backdrop-blur-md shadow-lg border-0 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">언어 선택 / Language</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowSelector(false)} className="rounded-full">
            ✕
          </Button>
        </div>

        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang)
                setShowSelector(false)
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                language === lang
                  ? "bg-blue-50 border-2 border-blue-200"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{languageFlags[lang]}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{languageNames[lang]}</div>
                  {lang === "ko" && <div className="text-sm text-gray-600">한국어</div>}
                  {lang === "en" && <div className="text-sm text-gray-600">English</div>}
                  {lang === "zh" && <div className="text-sm text-gray-600">中文 (简体)</div>}
                  {lang === "ja" && <div className="text-sm text-gray-600">日本語</div>}
                  {lang === "th" && <div className="text-sm text-gray-600">ภาษาไทย</div>}
                </div>
              </div>
              {language === lang && <Check className="w-5 h-5 text-blue-600" />}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Select your preferred language
            <br />
            选择您的首选语言 / 言語を選択してください
            <br />
            เลือกภาษาที่คุณต้องการ
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
