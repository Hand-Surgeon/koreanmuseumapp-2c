import { MetadataRoute } from 'next'
import { listArtifacts } from '@/lib/server/artifact-repository'
import { hallConfigs } from '@/lib/hall-config'
import { i18n } from '@/i18n.config'
import { isMuseumDataVerified } from '@/lib/server/emuseum/snapshot'

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isMuseumDataVerified()) return []

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://museum100.kr').replace(/\/$/, '')
  const artifacts = listArtifacts()
  const urls: MetadataRoute.Sitemap = []

  // 각 언어별 URL 생성
  for (const locale of i18n.locales) {
    // 메인 페이지
    urls.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: locale === i18n.defaultLocale ? 1 : 0.9,
      alternates: {
        languages: Object.fromEntries(
          i18n.locales.map((l) => [l, `${baseUrl}/${l}`])
        ),
      },
    })

    // 전시관 페이지들
    Object.keys(hallConfigs).forEach((hall) => {
      const encodedHall = encodeURIComponent(hall)
      urls.push({
        url: `${baseUrl}/${locale}/hall/${encodedHall}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            i18n.locales.map((l) => [l, `${baseUrl}/${l}/hall/${encodedHall}`])
          ),
        },
      })
    })

    // 유물 상세 페이지들
    artifacts.forEach((artifact) => {
      urls.push({
        url: `${baseUrl}/${locale}/artifact/${artifact.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            i18n.locales.map((l) => [l, `${baseUrl}/${l}/artifact/${artifact.id}`])
          ),
        },
      })
    })
  }

  // 루트 URL
  urls.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  })

  return urls
}
