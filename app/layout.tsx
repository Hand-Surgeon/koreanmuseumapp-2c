import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import "./globals.css"
import { StructuredData } from "@/components/structured-data"
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar"
import { i18n, localeMetadata, type Locale } from "@/i18n.config"
import { isMuseumDataVerified } from "@/lib/server/emuseum/snapshot"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://museum100.kr").replace(/\/$/, "")
const indexingAllowed = isMuseumDataVerified()

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "국립중앙박물관 명품 100선",
    template: "%s | 국립중앙박물관"
  },
  description: "국립중앙박물관이 소장한 대표 유물 100점을 소개합니다. 선사시대부터 근대까지 한국 문화재의 정수를 만나보세요.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: appUrl,
    siteName: "국립중앙박물관 명품 100선",
    title: "국립중앙박물관 명품 100선",
    description: "국립중앙박물관이 소장한 대표 유물 100점을 소개합니다",
  },
  twitter: {
    card: "summary_large_image",
    title: "국립중앙박물관 명품 100선",
    description: "국립중앙박물관이 소장한 대표 유물 100점을 소개합니다",
  },
  robots: {
    index: indexingAllowed,
    follow: indexingAllowed,
    googleBot: {
      index: indexingAllowed,
      follow: indexingAllowed,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: `${appUrl}/ko`,
    languages: {
      "ko": `${appUrl}/ko`,
      "en": `${appUrl}/en`,
      "zh": `${appUrl}/zh`,
      "ja": `${appUrl}/ja`,
      "th": `${appUrl}/th`,
      "x-default": `${appUrl}/ko`
    }
  },
  generator: 'Next.js'
}

function isLocale(value: string | null): value is Locale {
  return value !== null && i18n.locales.some((locale) => locale === value)
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const requestedLocale = requestHeaders.get('x-museum-locale')
  const locale = isLocale(requestedLocale) ? requestedLocale : i18n.defaultLocale

  return (
    <html lang={locale} dir={localeMetadata[locale].direction}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <meta name="theme-color" content="#1e40af" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="박물관 100선" />
        <StructuredData type="website" locale={locale} />
        <StructuredData type="collection" locale={locale} />
      </head>
      <body className="antialiased">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
