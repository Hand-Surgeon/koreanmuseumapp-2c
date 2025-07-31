"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/hooks/useLanguage'
import { artifacts } from '@/data/artifacts'
import { filterArtifacts } from '@/lib/artifact-utils'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

interface SearchSuggestion {
  type: 'artifact' | 'category' | 'period' | 'hall'
  value: string
  label: string
  count?: number
}

export function SearchAutocomplete({
  onSearch,
  placeholder,
  className
}: SearchAutocompleteProps) {
  const { t, language } = useLanguage()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Generate suggestions based on query
  const generateSuggestions = useCallback((searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery || searchQuery.length < 1) return []

    const normalizedQuery = searchQuery.toLowerCase()
    const suggestionsList: SearchSuggestion[] = []

    // Search in artifacts
    const matchingArtifacts = filterArtifacts(
      artifacts, 
      searchQuery, 
      t.all, 
      language as 'ko' | 'en' | 'zh' | 'ja' | 'th',
      t.all
    ).slice(0, 5)

    matchingArtifacts.forEach(artifact => {
      suggestionsList.push({
        type: 'artifact',
        value: artifact.id.toString(),
        label: artifact.name[language as keyof typeof artifact.name]
      })
    })

    // Search in categories
    const categories = Array.from(new Set(artifacts.map(a => a.category)))
    categories.forEach(category => {
      if (category.toLowerCase().includes(normalizedQuery)) {
        const count = artifacts.filter(a => a.category === category).length
        suggestionsList.push({
          type: 'category',
          value: category,
          label: category,
          count
        })
      }
    })

    // Search in periods
    const periods = Array.from(new Set(artifacts.map(a => a.period[language as keyof typeof a.period])))
    periods.forEach(period => {
      if (period.toLowerCase().includes(normalizedQuery)) {
        const count = artifacts.filter(a => 
          a.period[language as keyof typeof a.period] === period
        ).length
        suggestionsList.push({
          type: 'period',
          value: period,
          label: period,
          count
        })
      }
    })

    return suggestionsList.slice(0, 8)
  }, [language, t])

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length >= 1) {
        setIsSearching(true)
        const results = generateSuggestions(query)
        setSuggestions(results)
        setIsSearching(false)
        setIsOpen(results.length > 0)
      } else {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 200)

    return () => clearTimeout(debounceTimer)
  }, [query, generateSuggestions])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'artifact') {
      router.push(`/artifact/${suggestion.value}`)
    } else {
      setQuery(suggestion.label)
      handleSearch(suggestion.label)
    }
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (onSearch) {
      onSearch(finalQuery)
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'artifact':
        return '🏺'
      case 'category':
        return '📁'
      case 'period':
        return '📅'
      case 'hall':
        return '🏛️'
      default:
        return '🔍'
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder || t.searchArtifacts}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 1 && suggestions.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 bg-white/80 border-0 rounded-xl"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
          role="listbox"
          data-testid="search-autocomplete-dropdown"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.type}-${suggestion.value}`}
                role="option"
                aria-selected={selectedIndex === index}
                className={cn(
                  "px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100",
                  selectedIndex === index && "bg-gray-100"
                )}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {suggestion.label}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {suggestion.type === 'artifact' ? t.artifact :
                       suggestion.type === 'category' ? t.category :
                       suggestion.type === 'period' ? t.period :
                       t.hall}
                    </span>
                  </div>
                </div>
                {suggestion.count && (
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.count}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}