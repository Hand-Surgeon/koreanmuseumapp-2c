import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { i18n, type Locale } from "@/i18n.config"
import { LanguageProvider } from "@/hooks/useLanguage"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ErrorBoundary } from "@/components/error-boundary"
import { SkipToContent } from "@/components/skip-to-content"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { DataSourceFooter } from "@/components/data-source-footer"

interface LocaleSeo {
  title: string
  titleTemplate: string
  description: string
  openGraphLocale: string
}

const localeSeo: Record<Locale, LocaleSeo> = {
  ko: {
    title: "국립중앙박물관 명품 100선",
    titleTemplate: "%s | 국립중앙박물관",
    description: "국립중앙박물관이 소장한 대표 유물 100점을 소개합니다. 선사시대부터 근대까지 한국 문화재의 정수를 만나보세요.",
    openGraphLocale: "ko_KR",
  },
  en: {
    title: "National Museum of Korea - 100 Masterpieces",
    titleTemplate: "%s | National Museum of Korea",
    description: "Discover 100 masterpieces from the National Museum of Korea collection, showcasing the essence of Korean cultural heritage from prehistoric to modern times.",
    openGraphLocale: "en_US",
  },
  zh: {
    title: "韩国国立中央博物馆 - 精品100选",
    titleTemplate: "%s | 韩国国立中央博物馆",
    description: "探索韩国国立中央博物馆收藏的100件精品文物，展示从史前到近代的韩国文化遗产精髓。",
    openGraphLocale: "zh_CN",
  },
  ja: {
    title: "韓国国立中央博物館 - 名品100選",
    titleTemplate: "%s | 韓国国立中央博物館",
    description: "韓国国立中央博物館が所蔵する代表的な遺物100点を紹介します。先史時代から近代まで、韓国文化財の精髄をご覧ください。",
    openGraphLocale: "ja_JP",
  },
  th: {
    title: "พิพิธภัณฑสถานแห่งชาติเกาหลี - ผลงานชิ้นเอก 100 ชิ้น",
    titleTemplate: "%s | พิพิธภัณฑสถานแห่งชาติเกาหลี",
    description: "ค้นพบผลงานชิ้นเอก 100 ชิ้นจากพิพิธภัณฑสถานแห่งชาติเกาหลี ซึ่งถ่ายทอดมรดกวัฒนธรรมเกาหลีตั้งแต่ยุคก่อนประวัติศาสตร์ถึงสมัยใหม่",
    openGraphLocale: "th_TH",
  },
}

function isLocale(value: string): value is Locale {
  return i18n.locales.some((locale) => locale === value)
}

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeParam } = await params
  if (!isLocale(localeParam)) return {}

  const seo = localeSeo[localeParam]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://museum100.kr"

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: seo.title,
      template: seo.titleTemplate,
    },
    description: seo.description,
    openGraph: {
      type: "website",
      locale: seo.openGraphLocale,
      url: `${appUrl}/${localeParam}`,
      siteName: seo.title,
      title: seo.title,
      description: seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    alternates: {
      canonical: `${appUrl}/${localeParam}`,
      languages: {
        ...Object.fromEntries(
          i18n.locales.map((locale) => [locale, `${appUrl}/${locale}`]),
        ),
        "x-default": `${appUrl}/${i18n.defaultLocale}`,
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!isLocale(localeParam)) {
    notFound()
  }

  return (
    <>
      <SkipToContent locale={localeParam} />
      <ErrorBoundary locale={localeParam}>
        <LanguageProvider initialLocale={localeParam}>
          <FavoritesProvider>
            {children}
            <DataSourceFooter locale={localeParam} />
            <PWAInstallPrompt />
          </FavoritesProvider>
        </LanguageProvider>
      </ErrorBoundary>
      <Suspense fallback={null}>
        <AnalyticsProvider />
      </Suspense>
    </>
  )
}
