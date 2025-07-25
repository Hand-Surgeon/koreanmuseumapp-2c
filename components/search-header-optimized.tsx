"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/useLanguage"
import { useMemo, useCallback, useState } from "react"
import debounce from "lodash.debounce"

interface SearchHeaderProps {
  onSearchChange: (term: string) => void
}

export function SearchHeader({ onSearchChange }: SearchHeaderProps) {
  const { t } = useLanguage()
  const [inputValue, setInputValue] = useState("")
  
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      onSearchChange(term)
    }, 300),
    [onSearchChange]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = e.target.value.replace(/[<>]/g, '') // 기본 XSS 방지
      setInputValue(sanitizedValue)
      debouncedSearch(sanitizedValue)
    },
    [debouncedSearch]
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input
        type="search"
        placeholder={t.searchPlaceholder}
        className="pl-10"
        value={inputValue}
        onChange={handleChange}
        aria-label={t.searchPlaceholder}
        maxLength={100}
      />
    </div>
  )
}