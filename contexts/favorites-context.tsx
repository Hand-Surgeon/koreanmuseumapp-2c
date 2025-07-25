"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Artifact } from '@/types/artifact'

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

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 로컬스토리지에서 즐겨찾기 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setFavorites(parsed)
          }
        }
      } catch (error) {
        console.error('즐겨찾기 로드 실패:', error)
      }
      setIsLoaded(true)
    }
  }, [])

  // 즐겨찾기 변경 시 로컬스토리지에 저장
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
        
        // Service Worker에 동기화 요청
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SYNC_FAVORITES',
            favorites
          })
        }
      } catch (error) {
        console.error('즐겨찾기 저장 실패:', error)
      }
    }
  }, [favorites, isLoaded])

  const addFavorite = useCallback((artifactId: number) => {
    setFavorites(prev => {
      if (prev.includes(artifactId)) return prev
      return [...prev, artifactId]
    })
  }, [])

  const removeFavorite = useCallback((artifactId: number) => {
    setFavorites(prev => prev.filter(id => id !== artifactId))
  }, [])

  const toggleFavorite = useCallback((artifactId: number) => {
    setFavorites(prev => {
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

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length
  }

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