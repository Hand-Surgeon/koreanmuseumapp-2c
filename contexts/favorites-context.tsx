"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

interface FavoritesContextType {
  favorites: number[]
  addFavorite: (artifactId: number) => void
  removeFavorite: (artifactId: number) => void
  toggleFavorite: (artifactId: number) => void
  isFavorite: (artifactId: number) => boolean
  clearFavorites: () => void
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const FAVORITES_STORAGE_KEY = 'museum-favorites'

function isValidFavoriteId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 100
}

function parseFavorites(value: string | null): number[] {
  if (!value) return []

  const parsed: unknown = JSON.parse(value)
  if (!Array.isArray(parsed)) return []
  return [...new Set(parsed.filter(isValidFavoriteId))]
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 로컬스토리지에서 즐겨찾기 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setFavorites(parseFavorites(localStorage.getItem(FAVORITES_STORAGE_KEY)))
      } catch (error) {
        console.error('즐겨찾기 로드 실패:', error)
      }
      setIsLoaded(true)
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_STORAGE_KEY) return

      try {
        setFavorites(parseFavorites(event.newValue))
      } catch (error) {
        console.error('즐겨찾기 동기화 실패:', error)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // 즐겨찾기 변경 시 로컬스토리지에 저장
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error('즐겨찾기 저장 실패:', error)
      }
    }
  }, [favorites, isLoaded])

  const addFavorite = useCallback((artifactId: number) => {
    setFavorites(prev => {
      if (!isValidFavoriteId(artifactId)) return prev
      if (prev.includes(artifactId)) return prev
      return [...prev, artifactId]
    })
  }, [])

  const removeFavorite = useCallback((artifactId: number) => {
    setFavorites(prev => prev.filter(id => id !== artifactId))
  }, [])

  const toggleFavorite = useCallback((artifactId: number) => {
    setFavorites(prev => {
      if (!isValidFavoriteId(artifactId)) return prev
      if (prev.includes(artifactId)) {
        return prev.filter(id => id !== artifactId)
      }
      return [...prev, artifactId]
    })
  }, [])

  const isFavorite = useCallback((artifactId: number) => {
    return favorites.includes(artifactId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  const value = useMemo(() => ({
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length
  }), [addFavorite, clearFavorites, favorites, isFavorite, removeFavorite, toggleFavorite])

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
