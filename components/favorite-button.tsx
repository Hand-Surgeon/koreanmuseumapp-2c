"use client"

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/contexts/favorites-context'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, type MouseEvent } from 'react'

interface FavoriteButtonProps {
  artifactId: number
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
  className?: string
}

export function FavoriteButton({
  artifactId,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  className
}: FavoriteButtonProps) {
  const { t } = useLanguage()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)
  const animationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isFav = isFavorite(artifactId)

  useEffect(() => () => {
    if (animationTimer.current) clearTimeout(animationTimer.current)
  }, [])

  const handleClick = (e: MouseEvent) => {
    e.preventDefault() // 링크 내부에 있을 경우 네비게이션 방지
    e.stopPropagation()
    
    setIsAnimating(true)
    toggleFavorite(artifactId)
    
    // 애니메이션 효과
    if (animationTimer.current) clearTimeout(animationTimer.current)
    animationTimer.current = setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all",
        isFav && "text-red-700 hover:text-red-800",
        isAnimating && "scale-125",
        className
      )}
      aria-label={isFav ? t.removeFavorite : t.addFavorite}
      aria-pressed={isFav}
    >
      <Heart
        aria-hidden="true"
        className={cn(
          "transition-all",
          size === 'icon' ? "h-5 w-5" : "h-4 w-4",
          showLabel && "mr-2",
          isFav && "fill-current"
        )}
      />
      {showLabel && (
        <span>{isFav ? t.removeFavorite : t.favorites}</span>
      )}
    </Button>
  )
}
