import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { i18n, type Locale } from "@/i18n.config"
import { LanguageProvider } from "@/hooks/useLanguage"
import { StructuredData } from "@/components/structured-data"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ErrorBoundary } from "@/components/error-boundary"
import { SkipToContent } from "@/components/skip-to-content"
import { FavoritesProvider } from "@/contexts/favorites-context"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params

  const metadata: Record<Locale, Metadata> = {
    ko: {
      title: {
        default: "국립중앙박물관 명품 100선",
        template: "%s | 국립중앙박물관"
      },
      description: "국립중앙박물관이 소장한 대표 유물 100점을 소개합니다. 선사시대부터 근대까지 한국 문화재의 정수를 만나보세요.",
    },
    en: {
      title: {
        default: "National Museum of Korea - 100 Masterpieces",
        template: "%s | National Museum of Korea"
      },
      description: "Discover 100 masterpieces from the National Museum of Korea collection, showcasing the essence of Korean cultural heritage from prehistoric to modern times.",
    },
    zh: {
      title: {
        default: "韩国国立中央博物馆 - 精品100选",
        template: "%s | 韩国国立中央博物馆"
      },
      description: "探索韩国国立中央博物馆收藏的100件精品文物，展示从史前到近代的韩国文化遗产精髓。",
    },
    ja: {
      title: {
        default: "韓国国立中央博物館 - 名品100選",
        template: "%s | 韓国国立中央博物館"
      },
      description: "韓国国立中央博物館が所蔵する代表的な遺物100点を紹介します。先史時代から近代まで、韓国文化財の精髄をご覧ください。",
    },
    th: {
      title: {
        default: "พิพิธภัณฑสถานแห่งชาติเกาหลี - ผลงานชิ้นเอก 100 ชิ้น",
        template: "%s | พิพิธภัณฑสถานแห่งชาติเกาหลี"
      },
      description: "ค้นพบผลงานชิ้นเอก 100 ชิ้นจากพิพิธภัณฑสถานแห่งชาติเกาหลี แสดงแก่นแท้ของมรดกวัฒนธรรมเกาหลีตั้งแต่ยุคก่อนประวัติศาสตร์ถึงยุคสมัยใหม่",
    },
    vi: {
      title: {
        default: "Bảo tàng Quốc gia Hàn Quốc - 100 Kiệt tác",
        template: "%s | Bảo tàng Quốc gia Hàn Quốc"
      },
      description: "Khám phá 100 kiệt tác từ Bảo tàng Quốc gia Hàn Quốc, thể hiện tinh hoa di sản văn hóa Hàn Quốc từ thời tiền sử đến hiện đại.",
    },
    id: {
      title: {
        default: "Museum Nasional Korea - 100 Karya Masterpiece",
        template: "%s | Museum Nasional Korea"
      },
      description: "Temukan 100 karya masterpiece dari Museum Nasional Korea, menampilkan esensi warisan budaya Korea dari prasejarah hingga modern.",
    },
    es: {
      title: {
        default: "Museo Nacional de Corea - 100 Obras Maestras",
        template: "%s | Museo Nacional de Corea"
      },
      description: "Descubre 100 obras maestras del Museo Nacional de Corea, mostrando la esencia del patrimonio cultural coreano desde la prehistoria hasta la era moderna.",
    },
    ar: {
      title: {
        default: "المتحف الوطني الكوري - 100 تحفة فنية",
        template: "%s | المتحف الوطني الكوري"
      },
      description: "اكتشف 100 تحفة فنية من المتحف الوطني الكوري، تعرض جوهر التراث الثقافي الكوري من عصور ما قبل التاريخ إلى العصر الحديث.",
    },
    fr: {
      title: {
        default: "Musée National de Corée - 100 Chefs-d'œuvre",
        template: "%s | Musée National de Corée"
      },
      description: "Découvrez 100 chefs-d'œuvre du Musée National de Corée, présentant l'essence du patrimoine culturel coréen de la préhistoire à l'ère moderne.",
    },
  }

  return {
    ...metadata[locale],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://museum100.kr'),
    keywords: ["국립중앙박물관", "한국 문화재", "박물관", "유물", "국보", "보물", "문화유산"],
    authors: [{ name: "국립중앙박물관" }],
    creator: "국립중앙박물관",
    publisher: "국립중앙박물관",
    openGraph: {
      type: "website",
      locale: locale === 'ko' ? 'ko_KR' : 
              locale === 'en' ? 'en_US' : 
              locale === 'zh' ? 'zh_CN' : 
              locale === 'ja' ? 'ja_JP' : 
              locale === 'th' ? 'th_TH' :
              locale === 'vi' ? 'vi_VN' :
              locale === 'id' ? 'id_ID' :
              locale === 'es' ? 'es_ES' :
              locale === 'ar' ? 'ar_SA' :
              locale === 'fr' ? 'fr_FR' : 'en_US',
      url: `https://museum100.kr/${locale}`,
      siteName: metadata[locale].title?.default as string,
      ...metadata[locale],
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: metadata[locale].title?.default as string,
        }
      ]
    },
    alternates: {
      canonical: `https://museum100.kr/${locale}`,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [l, `https://museum100.kr/${l}`])
      ),
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
  const { locale } = await params
  
  // 유효한 locale인지 확인
  if (!i18n.locales.includes(locale as Locale)) {
    notFound()
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
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
        <SkipToContent />
        <ErrorBoundary>
          <LanguageProvider initialLocale={locale as Locale}>
            <FavoritesProvider>
              {children}
              <PWAInstallPrompt />
            </FavoritesProvider>
          </LanguageProvider>
        </ErrorBoundary>
        <AnalyticsProvider />
      </body>
    </html>
  )
}