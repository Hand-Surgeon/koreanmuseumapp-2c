"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"
import type { Language } from "@/types/language"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

interface AccessibleImageGalleryProps {
  images: string[]
  alt: string
  name: string
}

interface GalleryCopy {
  enlarge: string
  navigation: string
  viewImage: (index: number) => string
  dialogTitle: (name: string) => string
  dialogDescription: (name: string) => string
  previous: string
  next: string
  close: string
  announcement: (index: number, total: number) => string
}

const galleryCopy: Record<Language, GalleryCopy> = {
  ko: {
    enlarge: "이미지 확대하기",
    navigation: "이미지 갤러리 탐색",
    viewImage: (index) => `${index}번째 이미지 보기`,
    dialogTitle: (name) => `${name} 확대 이미지`,
    dialogDescription: (name) => `${name}의 확대 이미지입니다. 좌우 화살표 키로 이미지를 탐색할 수 있습니다.`,
    previous: "이전 이미지",
    next: "다음 이미지",
    close: "닫기",
    announcement: (index, total) => `${total}개 중 ${index}번째 이미지`,
  },
  en: {
    enlarge: "Enlarge image",
    navigation: "Image gallery navigation",
    viewImage: (index) => `View image ${index}`,
    dialogTitle: (name) => `Enlarged image of ${name}`,
    dialogDescription: (name) => `An enlarged image of ${name}. Use the left and right arrow keys to browse.`,
    previous: "Previous image",
    next: "Next image",
    close: "Close",
    announcement: (index, total) => `Image ${index} of ${total}`,
  },
  zh: {
    enlarge: "放大图像",
    navigation: "图像库导航",
    viewImage: (index) => `查看第 ${index} 张图像`,
    dialogTitle: (name) => `${name}放大图`,
    dialogDescription: (name) => `${name}的放大图。可使用左右方向键浏览。`,
    previous: "上一张图像",
    next: "下一张图像",
    close: "关闭",
    announcement: (index, total) => `第 ${index} 张，共 ${total} 张`,
  },
  ja: {
    enlarge: "画像を拡大",
    navigation: "画像ギャラリーの操作",
    viewImage: (index) => `${index}枚目の画像を表示`,
    dialogTitle: (name) => `${name}の拡大画像`,
    dialogDescription: (name) => `${name}の拡大画像です。左右の矢印キーで画像を移動できます。`,
    previous: "前の画像",
    next: "次の画像",
    close: "閉じる",
    announcement: (index, total) => `${total}枚中${index}枚目の画像`,
  },
  th: {
    enlarge: "ขยายภาพ",
    navigation: "การนำทางแกลเลอรีภาพ",
    viewImage: (index) => `ดูภาพที่ ${index}`,
    dialogTitle: (name) => `ภาพขยายของ ${name}`,
    dialogDescription: (name) => `ภาพขยายของ ${name} ใช้ปุ่มลูกศรซ้ายและขวาเพื่อเลื่อนภาพ`,
    previous: "ภาพก่อนหน้า",
    next: "ภาพถัดไป",
    close: "ปิด",
    announcement: (index, total) => `ภาพที่ ${index} จาก ${total}`,
  },
}

export function AccessibleImageGallery({ images, alt, name }: AccessibleImageGalleryProps) {
  const { language } = useLanguage()
  const copy = galleryCopy[language]
  const safeImages = images.length > 0 ? images : ["/placeholder.svg"]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, safeImages.length - 1))
  }, [safeImages.length])

  const navigateToImage = useCallback((index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, safeImages.length - 1))
    setCurrentIndex(boundedIndex)
    setAnnouncement(copy.announcement(boundedIndex + 1, safeImages.length))
  }, [copy, safeImages.length])

  const navigateToPrevious = useCallback(() => {
    navigateToImage(currentIndex - 1)
  }, [currentIndex, navigateToImage])

  const navigateToNext = useCallback(() => {
    navigateToImage(currentIndex + 1)
  }, [currentIndex, navigateToImage])

  useEffect(() => {
    if (!isOpen || safeImages.length < 2) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigateToPrevious()
      if (event.key === "ArrowRight") navigateToNext()
      if (event.key === "Home") navigateToImage(0)
      if (event.key === "End") navigateToImage(safeImages.length - 1)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, navigateToImage, navigateToNext, navigateToPrevious, safeImages.length])

  const imageAlt = safeImages.length === 1
    ? alt
    : `${alt} (${currentIndex + 1}/${safeImages.length})`

  return (
    <>
      <div className="group relative">
        <Image
          src={safeImages[currentIndex]}
          alt={imageAlt}
          width={600}
          height={600}
          className="h-auto w-full rounded-lg"
          priority
        />
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/0 transition-colors hover:bg-black/10 focus-visible:bg-black/10"
          aria-label={copy.enlarge}
        >
          <ZoomIn aria-hidden="true" className="h-12 w-12 rounded-full bg-black/60 p-2 text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
        </Button>
      </div>

      {safeImages.length > 1 && (
        <nav aria-label={copy.navigation} className="mt-4">
          <ul className="flex gap-2">
            {safeImages.map((image, index) => (
              <li key={`${image}-${index}`}>
                <button
                  type="button"
                  onClick={() => navigateToImage(index)}
                  className={`relative h-20 w-20 overflow-hidden rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    currentIndex === index
                      ? "scale-105 border-primary shadow-lg"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  aria-pressed={currentIndex === index}
                  aria-label={copy.viewImage(index + 1)}
                >
                  <Image src={image} alt="" width={80} height={80} className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-screen-lg border-0 bg-black/95 p-0"
          aria-describedby="image-dialog-description"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{copy.dialogTitle(name)}</DialogTitle>
          <DialogDescription id="image-dialog-description" className="sr-only">
            {copy.dialogDescription(name)}
          </DialogDescription>

          <div className="relative flex min-h-screen items-center justify-center p-4">
            <Image
              src={safeImages[currentIndex]}
              alt={imageAlt}
              width={1200}
              height={1200}
              className="max-h-[90vh] max-w-full object-contain"
            />

            {safeImages.length > 1 && (
              <>
                <Button
                  type="button"
                  onClick={navigateToPrevious}
                  disabled={currentIndex === 0}
                  className="absolute start-4 top-1/2 -translate-y-1/2 bg-white/20 text-white hover:bg-white/30 disabled:opacity-50"
                  aria-label={copy.previous}
                >
                  <ChevronLeft aria-hidden="true" className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  onClick={navigateToNext}
                  disabled={currentIndex === safeImages.length - 1}
                  className="absolute end-4 top-1/2 -translate-y-1/2 bg-white/20 text-white hover:bg-white/30 disabled:opacity-50"
                  aria-label={copy.next}
                >
                  <ChevronRight aria-hidden="true" className="h-6 w-6" />
                </Button>
              </>
            )}

            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute end-4 top-4 bg-white/20 text-white hover:bg-white/30"
              aria-label={copy.close}
            >
              <X aria-hidden="true" className="h-6 w-6" />
            </Button>

            {safeImages.length > 1 && (
              <div className="absolute bottom-4 start-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-white">
                {currentIndex + 1} / {safeImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </>
  )
}
