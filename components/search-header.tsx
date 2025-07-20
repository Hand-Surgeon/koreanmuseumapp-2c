"use client"

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
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="search"
        placeholder={placeholder || t.search}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-white/80 border-0 rounded-xl"
      />
    </div>
  )
}