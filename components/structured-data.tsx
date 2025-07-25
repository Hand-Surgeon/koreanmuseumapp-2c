import Script from 'next/script'
import { Artifact } from '@/types/artifact'

interface MuseumStructuredDataProps {
  type: 'organization' | 'artifact' | 'collection'
  data?: Artifact
}

export function StructuredData({ type, data }: MuseumStructuredDataProps) {
  let jsonLd = {}

  switch (type) {
    case 'organization':
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Museum",
        "name": "국립중앙박물관",
        "alternateName": "National Museum of Korea",
        "url": "https://museum100.kr",
        "logo": "https://museum100.kr/logo.png",
        "description": "대한민국을 대표하는 박물관으로 선사시대부터 근대까지의 유물을 소장하고 있습니다.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "137 Seobinggo-ro",
          "addressLocality": "Yongsan-gu",
          "addressRegion": "Seoul",
          "postalCode": "04383",
          "addressCountry": "KR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 37.5238506,
          "longitude": 126.9804702
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "10:00",
            "closes": "18:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Saturday", "Sunday"],
            "opens": "10:00",
            "closes": "21:00"
          }
        ]
      }
      break

    case 'artifact':
      if (data) {
        jsonLd = {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": data.name.ko,
          "alternateName": data.name.en,
          "description": data.description.ko,
          "creator": {
            "@type": "Person",
            "name": "Unknown"
          },
          "dateCreated": data.period.ko,
          "material": data.material?.ko,
          "locationCreated": data.excavationSite?.ko,
          "isPartOf": {
            "@type": "Collection",
            "name": "국립중앙박물관 소장품"
          },
          "image": data.image,
          "url": `https://museum100.kr/artifact/${data.id}`
        }
      }
      break

    case 'collection':
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Collection",
        "name": "국립중앙박물관 명품 100선",
        "description": "국립중앙박물관이 선정한 대표 유물 100점",
        "numberOfItems": 100,
        "isPartOf": {
          "@type": "Museum",
          "name": "국립중앙박물관"
        }
      }
      break
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}