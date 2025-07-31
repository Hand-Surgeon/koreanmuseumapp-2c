/**
 * Image blur-up placeholder utilities
 * Generates base64-encoded blur placeholders for progressive image loading
 */

import { getPlaiceholder } from 'plaiceholder'

export interface BlurData {
  base64: string
  img: {
    src: string
    width: number
    height: number
  }
}

/**
 * Generates a blur-up placeholder for an image
 * @param src - The image source URL
 * @returns Blur data including base64 placeholder
 */
export async function getBlurDataUrl(src: string): Promise<BlurData | null> {
  try {
    // For remote images, we need to fetch them first
    const isRemote = src.startsWith('http')
    
    if (isRemote) {
      const response = await fetch(src)
      const buffer = await response.arrayBuffer()
      const { base64, img } = await getPlaiceholder(Buffer.from(buffer))
      return { base64, img }
    } else {
      // For local images, we can read them directly
      const { base64, img } = await getPlaiceholder(src)
      return { base64, img }
    }
  } catch (error) {
    console.error('Error generating blur placeholder:', error)
    return null
  }
}

/**
 * Generates blur placeholders for multiple images
 * @param srcs - Array of image source URLs
 * @returns Map of image URLs to blur data
 */
export async function getBlurDataUrls(srcs: string[]): Promise<Map<string, BlurData>> {
  const blurDataMap = new Map<string, BlurData>()
  
  await Promise.all(
    srcs.map(async (src) => {
      const blurData = await getBlurDataUrl(src)
      if (blurData) {
        blurDataMap.set(src, blurData)
      }
    })
  )
  
  return blurDataMap
}

/**
 * Creates a low-quality image placeholder using Canvas API (client-side)
 * @param src - The image source URL
 * @param width - Target width for the placeholder
 * @param height - Target height for the placeholder
 * @returns Base64 encoded blur placeholder
 */
export function createClientBlurPlaceholder(
  src: string, 
  width: number = 10, 
  height: number = 10
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // Set canvas size to small dimensions for blur effect
      canvas.width = width
      canvas.height = height
      
      // Draw scaled down image
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to base64
      const base64 = canvas.toDataURL('image/jpeg', 0.1)
      resolve(base64)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = src
  })
}

/**
 * Generates a CSS filter blur style
 * @param blur - Blur amount in pixels
 * @returns CSS filter string
 */
export function getBlurStyle(blur: number = 20): React.CSSProperties {
  return {
    filter: `blur(${blur}px)`,
    transform: 'scale(1.1)', // Slightly scale to hide blur edges
  }
}

/**
 * Hook for progressive image loading with blur-up effect
 */
export function useProgressiveImage(src: string, placeholder?: string) {
  const [currentSrc, setCurrentSrc] = React.useState(placeholder || '')
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  
  React.useEffect(() => {
    if (!src) return
    
    const img = new Image()
    
    img.onload = () => {
      setCurrentSrc(src)
      setIsLoading(false)
    }
    
    img.onerror = () => {
      setError(new Error('Failed to load image'))
      setIsLoading(false)
    }
    
    img.src = src
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])
  
  return { currentSrc, isLoading, error }
}

// Import React for the hook
import React from 'react'