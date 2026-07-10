import { translations } from "@/data/translations"
import type { Artifact } from "@/types/artifact"
import type { Language } from "@/types/language"
import { isMuseumDataVerified } from "@/lib/server/emuseum/snapshot"

interface StructuredDataProps {
  type: "website" | "artifact" | "collection"
  data?: Artifact
  locale?: Language
}

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://museum100.kr").replace(/\/$/, "")
}

function toAbsoluteUrl(path: string) {
  return new URL(path, `${getBaseUrl()}/`).toString()
}

export function StructuredData({ type, data, locale = "ko" }: StructuredDataProps) {
  if (!isMuseumDataVerified()) return null

  const baseUrl = getBaseUrl()
  const t = translations[locale]
  const collectionName = `${t.nationalMuseum} ${t.masterpieces100}`
  let jsonLd: Record<string, unknown>

  switch (type) {
    case "website":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: collectionName,
        alternateName: "Museum 100",
        url: `${baseUrl}/${locale}`,
        image: `${baseUrl}/icons/icon-512x512.png`,
        description: t.subtitle,
        inLanguage: locale,
      }
      break

    case "artifact": {
      if (!data) return null

      const primaryImage = data.images?.[0]

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: data.name[locale],
        alternateName: locale === "ko" ? data.name.en : data.name.ko,
        description: data.description[locale],
        temporalCoverage: data.period[locale],
        material: data.material?.[locale],
        spatialCoverage: data.location
          ? { "@type": "Place", name: data.location[locale] }
          : undefined,
        identifier: data.artifactNumber,
        isPartOf: {
          "@type": "Collection",
          name: collectionName,
          url: `${baseUrl}/${locale}`,
        },
        image: primaryImage
          ? {
            "@type": "ImageObject",
            contentUrl: toAbsoluteUrl(primaryImage.src),
            creditText: primaryImage.credit,
            copyrightNotice: primaryImage.copyrightNotice,
            license: primaryImage.rightsStatus === "kogl-1"
              ? data.rights?.metadata.licenseUrl
              : undefined,
            acquireLicensePage: primaryImage.evidenceUrl,
          }
          : toAbsoluteUrl(data.image),
        isBasedOn: data.source?.datasetUrl,
        license: data.rights?.metadata.licenseUrl,
        creditText: data.rights?.metadata.attribution,
        url: `${baseUrl}/${locale}/artifact/${data.id}`,
        inLanguage: locale,
      }
      break
    }

    case "collection":
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Collection",
        name: collectionName,
        description: t.essenceOfKoreanCulture,
        numberOfItems: 100,
        url: `${baseUrl}/${locale}`,
        inLanguage: locale,
      }
      break
  }

  const serializedJsonLd = JSON.stringify(jsonLd).replace(/</g, "\\u003c")

  return (
    <script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedJsonLd }}
    />
  )
}
