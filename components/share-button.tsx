"use client"

import { Share2, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Artifact } from '@/types/artifact'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  artifact: Artifact
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
  className?: string
}

export function ShareButton({
  artifact,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  className
}: ShareButtonProps) {
  const { language, t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [hasNativeShare, setHasNativeShare] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setHasNativeShare(typeof navigator.share === 'function')

    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    }
  }, [])
  
  const shareTitle = artifact.name[language]
  const shareText = `${shareTitle} - ${t.nationalMuseum} ${t.masterpieces100}`

  const getShareUrl = () => typeof window === 'undefined'
    ? ''
    : `${window.location.origin}/${language}/artifact/${artifact.id}`

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: getShareUrl()
        })
      } catch (err) {
        // 사용자가 취소한 경우 무시
        if ((err as Error).name !== 'AbortError') {
          console.error('공유 실패:', err)
        }
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      setCopied(true)
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('링크 복사 실패:', err)
    }
  }

  const handleSocialShare = (platform: string) => {
    let url = ''
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl())}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`
        break
      case 'kakao':
        // Kakao SDK가 필요하므로 임시로 링크 복사
        handleCopyLink()
        return
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${getShareUrl()}`)}`
        break
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={t.share}
        >
          <Share2 aria-hidden="true" className={cn(
            size === 'icon' ? "h-5 w-5" : "h-4 w-4",
            showLabel && "me-2"
          )} />
          {showLabel && <span>{t.share}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {hasNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 aria-hidden="true" className="me-2 h-4 w-4" />
              {t.share}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
          <svg aria-hidden="true" className="me-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
          <svg aria-hidden="true" className="me-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('kakao')}>
          <svg aria-hidden="true" className="me-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c5.514 0 10 3.476 10 7.747 0 4.272-4.48 7.748-9.986 7.748-.62 0-1.092-.046-1.759-.097-1 .776-1.774 1.403-3.485 1.962.26-1.383-.113-2.259-.514-3.259-2.383-1.505-4.256-3.411-4.256-6.354 0-4.271 4.486-7.747 10-7.747z"/>
          </svg>
          KakaoTalk
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('email')}>
          <svg aria-hidden="true" className="me-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-10 5L2 7"/>
          </svg>
          Email
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check aria-hidden="true" className="me-2 h-4 w-4 text-green-700" />
              <span className="text-green-600">{t.copied}</span>
            </>
          ) : (
            <>
              <Link2 aria-hidden="true" className="me-2 h-4 w-4" />
              {t.copyLink}
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
