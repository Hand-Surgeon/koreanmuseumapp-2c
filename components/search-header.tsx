"use client"

import { useId } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/useLanguage"

interface SearchHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  placeholder?: string
}

export function SearchHeader({ searchTerm, onSearchChange, placeholder }: SearchHeaderProps) {
  const { t } = useLanguage()
  const inputId = useId()
  const accessibleLabel = placeholder || t.search
  
  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">{accessibleLabel}</label>
      <Search aria-hidden="true" className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        id={inputId}
        type="search"
        placeholder={accessibleLabel}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="rounded-xl border-0 bg-white/80 ps-10"
      />
    </div>
  )
}
