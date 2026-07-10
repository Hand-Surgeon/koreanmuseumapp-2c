import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n, type Locale } from './i18n.config'

const PUBLIC_FILE = /\.[^/]+$/
const EXCLUDED_PREFIXES = ['/api', '/admin', '/_next']
const LOCALE_HEADER = 'x-museum-locale'

function isLocale(value: string): value is Locale {
  return i18n.locales.some((locale) => locale === value)
}

function isExcludedPath(pathname: string) {
  return EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isExcludedPath(pathname) || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next()
  }

  const pathLocale = pathname.split('/')[1]

  if (isLocale(pathLocale)) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set(LOCALE_HEADER, pathLocale)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  const locale = getLocale(request)
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`

  return NextResponse.redirect(redirectUrl)
}

function getLocale(request: NextRequest): Locale {
  const localeCookie = request.cookies.get('locale')?.value
  if (localeCookie && isLocale(localeCookie)) {
    return localeCookie
  }

  const acceptLanguage = request.headers.get('accept-language')
  return getPreferredLocale(acceptLanguage) ?? i18n.defaultLocale
}

function getPreferredLocale(acceptLanguageHeader: string | null): Locale | null {
  if (!acceptLanguageHeader) return null

  const languages = acceptLanguageHeader
    .split(',')
    .map((entry) => {
      const [locale, qualityValue = '1'] = entry.trim().split(';q=')
      const quality = Number.parseFloat(qualityValue)

      return {
        locale: locale.toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      }
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality)

  for (const { locale } of languages) {
    if (isLocale(locale)) return locale

    const baseLanguage = locale.split('-')[0]
    if (isLocale(baseLanguage)) return baseLanguage
  }

  return null
}

export const config = {
  matcher: [
    '/((?!api|admin|_next/static|_next/image|_next/data|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml|icons|screenshots|artworks).*)',
  ],
}
