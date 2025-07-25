"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface AccessibleImageGalleryProps {
  images: string[]
  alt: string
  name: string
}

export function AccessibleImageGallery({ images, alt, name }: AccessibleImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const galleryRef = useRef<HTMLDivElement>(null)

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          navigateToPrevious()
          break
        case 'ArrowRight':
          navigateToNext()
          break
        case 'Home':
          navigateToImage(0)
          break
        case 'End':
          navigateToImage(images.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, images.length])

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      announceImageChange(newIndex)
    }
  }

  const navigateToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      announceImageChange(newIndex)
    }
  }

  const navigateToImage = (index: number) => {
    setCurrentIndex(index)
    announceImageChange(index)
  }

  const announceImageChange = (index: number) => {
    setAnnouncement(`${index + 1}번째 이미지로 이동했습니다. 총 ${images.length}개 중`)
  }

  return (
    <>
      {/* 메인 이미지 */}
      <div className="relative group" ref={galleryRef}>
        <Image
          src={images[currentIndex]}
          alt={`${alt} - 이미지 ${currentIndex + 1}/${images.length}`}
          width={600}
          height={600}
          className="w-full h-auto rounded-lg"
          priority
        />
        <Button
          onClick={() => setIsOpen(true)}
          className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center"
          aria-label="이미지 확대하기"
        >
          <ZoomIn className="opacity-0 group-hover:opacity-100 text-white bg-black/50 rounded-full p-2 w-12 h-12" />
        </Button>
      </div>

      {/* 썸네일 네비게이션 */}
      <nav aria-label="이미지 갤러리 네비게이션" className="mt-4">
        <ul className="flex gap-2" role="tablist">
          {images.map((_, index) => (
            <li key={index} role="presentation">
              <button
                onClick={() => navigateToImage(index)}
                className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  currentIndex === index 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                role="tab"
                aria-selected={currentIndex === index}
                aria-label={`${index + 1}번째 이미지 보기`}
                aria-controls={`image-panel-${index}`}
                id={`image-tab-${index}`}
              >
                <Image
                  src={images[index]}
                  alt=""
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 확대 모달 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-screen-lg p-0 bg-black/95 border-0"
          aria-describedby="image-dialog-description"
        >
          <VisuallyHidden>
            <DialogTitle>{name} 확대 이미지</DialogTitle>
          </VisuallyHidden>
          <DialogDescription id="image-dialog-description" className="sr-only">
            {`${name}의 확대 이미지입니다. 좌우 화살표 키로 이미지를 탐색할 수 있습니다.`}
          </DialogDescription>
          
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <Image
              src={images[currentIndex]}
              alt={`${alt} - 확대 이미지 ${currentIndex + 1}/${images.length}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            {/* 이전 버튼 */}
            <Button
              onClick={navigateToPrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            {/* 다음 버튼 */}
            <Button
              onClick={navigateToNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* 닫기 버튼 */}
            <Button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* 이미지 인디케이터 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
              <span aria-live="polite" aria-atomic="true">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 스크린 리더 알림 */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>
    </>
  )
}