import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/hooks/useLanguage"
import { StructuredData } from "@/components/structured-data"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "국립중앙박물관 명품 100선",
    template: "%s | 국립중앙박물관"
  },
  description: "국립중앙박물관이 소장한 대표 유물 100점을 소개합니다. 선사시대부터 근대까지 한국 문화재의 정수를 만나보세요.",
  keywords: ["국립중앙박물관", "한국 문화재", "박물관", "유물", "국보", "보물", "문화유산"],
  authors: [{ name: "국립중앙박물관" }],
  creator: "국립중앙박물관",
  publisher: "국립중앙박물관",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://museum100.kr",
    siteName: "국립중앙박물관 명품 100선",
    title: "국립중앙박물관 명품 100선",
    description: "국립중앙박물관이 소장한 대표 유물 100점을 소개합니다",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "국립중앙박물관 명품 100선"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "국립중앙박물관 명품 100선",
    description: "국립중앙박물관이 소장한 대표 유물 100점을 소개합니다",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code"
  },
  alternates: {
    canonical: "https://museum100.kr",
    languages: {
      "ko": "https://museum100.kr",
      "en": "https://museum100.kr/en",
      "zh": "https://museum100.kr/zh",
      "ja": "https://museum100.kr/ja"
    }
  },
  generator: 'Next.js'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="박물관 100선" />
        <StructuredData type="organization" />
        <StructuredData type="collection" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
