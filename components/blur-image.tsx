"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ImageErrorBoundary } from './image-error-boundary'

interface BlurImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

/**
 * Progressive image component with blur-up placeholder effect
 */
export function BlurImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
}: BlurImageProps) {
  const [isLoading, setIsLoading] = useState(false) // Changed to false to disable blur
  const [currentSrc, setCurrentSrc] = useState(src)
  
  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width || 100} ${height || 100}">
      <filter id="blur" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20" edgeMode="duplicate" />
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="1 1" />
        </feComponentTransfer>
      </filter>
      <rect filter="url(#blur)" x="0" y="0" width="100%" height="100%" fill="#e0e0e0" />
    </svg>`
  ).toString('base64')}`
  
  const placeholderData = blurDataURL || defaultBlurDataURL

  return (
    <ImageErrorBoundary>
      <div className={cn("relative overflow-hidden", className)}>
        {/* Blur placeholder layer */}
        {isLoading && placeholder === 'blur' && (
          <div 
            className="absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              backgroundImage: `url(${placeholderData})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.1)',
            }}
          />
        )}
        
        {/* Main image */}
        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          className={className}
          priority={priority}
          sizes={sizes}
          quality={quality}
          onError={(e) => {
            console.error('Image error:', src)
            // Fallback to placeholder image on error
            if (src !== '/placeholder.svg') {
              setCurrentSrc('/placeholder.svg')
            }
          }}
        />
      </div>
    </ImageErrorBoundary>
  )
}

/**
 * Hook to generate blur data URL from an image
 */
export function useBlurDataUrl(src: string, width: number = 10, height: number = 10) {
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null)
  
  useEffect(() => {
    if (!src || typeof window === 'undefined') return
    
    const generateBlur = async () => {
      try {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = src
        })
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) return
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.1)
        setBlurDataURL(dataURL)
      } catch (error) {
        console.error('Error generating blur placeholder:', error)
      }
    }
    
    generateBlur()
  }, [src, width, height])
  
  return blurDataURL
}