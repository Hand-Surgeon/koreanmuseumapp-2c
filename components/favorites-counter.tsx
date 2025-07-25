"use client"

import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/contexts/favorites-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function FavoritesCounter() {
  const { favoritesCount } = useFavorites()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  
  return (
    <Link href={`/${locale}/favorites`}>
      <Button variant="ghost" size="sm" className="relative">
        <Heart className="h-5 w-5" />
        {favoritesCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-in zoom-in-50 duration-200">
            {favoritesCount > 99 ? '99+' : favoritesCount}
          </span>
        )}
        <span className="sr-only">즐겨찾기 {favoritesCount}개</span>
      </Button>
    </Link>
  )
}