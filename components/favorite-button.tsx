"use client"

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/contexts/favorites-context'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

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
  const { toggleFavorite, isFavorite } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)
  const isFav = isFavorite(artifactId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault() // 링크 내부에 있을 경우 네비게이션 방지
    e.stopPropagation()
    
    setIsAnimating(true)
    toggleFavorite(artifactId)
    
    // 애니메이션 효과
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all",
        isFav && "text-red-500 hover:text-red-600",
        isAnimating && "scale-125",
        className
      )}
      aria-label={isFav ? "즐겨찾기에서 제거" : "즐겨찾기에 추가"}
      aria-pressed={isFav}
    >
      <Heart
        className={cn(
          "transition-all",
          size === 'icon' ? "h-5 w-5" : "h-4 w-4",
          showLabel && "mr-2",
          isFav && "fill-current"
        )}
      />
      {showLabel && (
        <span>{isFav ? "즐겨찾기 해제" : "즐겨찾기"}</span>
      )}
    </Button>
  )
}