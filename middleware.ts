import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './i18n.config'
import type { Locale } from './i18n.config'

const PUBLIC_FILE = /\.(.*)$/

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Public 파일 무시
  if (PUBLIC_FILE.test(pathname)) {
    return
  }

  // 이미 언어 경로가 있는지 확인
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // 언어 감지
  const locale = getLocale(request)
  
  // 언어 경로로 리다이렉트
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  
  // 검색 파라미터 유지
  newUrl.search = request.nextUrl.search
  
  return NextResponse.redirect(newUrl)
}

function getLocale(request: NextRequest): Locale {
  // 1. 쿠키에서 확인
  const localeCookie = request.cookies.get('locale')
  if (localeCookie) {
    const cookieValue = localeCookie.value
    const foundLocale = i18n.locales.find((locale): locale is Locale => locale === cookieValue)
    if (foundLocale) {
      return foundLocale
    }
  }

  // 2. Accept-Language 헤더에서 감지
  const acceptLanguage = request.headers.get('Accept-Language')
  if (acceptLanguage) {
    const detectedLocale = getPreferredLocale(acceptLanguage)
    if (detectedLocale) {
      return detectedLocale
    }
  }

  // 3. 기본 언어
  return i18n.defaultLocale
}

function getPreferredLocale(acceptLanguageHeader: string): Locale | null {
  // Accept-Language 헤더 파싱
  const languages = acceptLanguageHeader
    .split(',')
    .map((lang) => {
      const parts = lang.trim().split(';q=')
      const locale = parts[0]
      const quality = parts[1] ? parseFloat(parts[1]) : 1
      return {
        locale: locale.toLowerCase(),
        quality: quality,
      }
    })
    .sort((a, b) => b.quality - a.quality)

  // 지원하는 언어 매칭
  for (const { locale } of languages) {
    // 정확한 매칭
    const supportedLocale = i18n.locales.find((l): l is Locale => l === locale)
    if (supportedLocale) {
      return supportedLocale
    }
    
    // 언어 코드만 매칭 (예: en-US -> en)
    const langCode = locale.split('-')[0]
    const supportedLangCode = i18n.locales.find((l): l is Locale => l === langCode)
    if (supportedLangCode) {
      return supportedLangCode
    }
  }

  return null
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청 경로에 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 파일
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml|icons|screenshots|artworks).*)',
  ],
}