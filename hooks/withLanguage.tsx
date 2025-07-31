"use client"

import React from "react"
import { useLanguage } from "./useLanguage"
import type { Language } from "@/types/language"
import type { Translation } from "@/types/artifact"

export interface WithLanguageProps {
  language: Language
  t: Translation
  setLanguage: (lang: Language) => void
}

export function withLanguage<P extends object>(
  Component: React.ComponentType<P & WithLanguageProps>
): React.ComponentType<Omit<P, keyof WithLanguageProps>> {
  return function WrappedComponent(props: Omit<P, keyof WithLanguageProps>) {
    const { language, t, setLanguage } = useLanguage()
    
    return (
      <Component
        {...(props as P)}
        language={language}
        t={t}
        setLanguage={setLanguage}
      />
    )
  }
}