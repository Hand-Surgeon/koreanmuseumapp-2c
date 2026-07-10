import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StructuredData } from '@/components/structured-data'
import { i18n } from '@/i18n.config'
import { isValidId } from '@/lib/validation'
import { findArtifactById, listArtifacts, listRelatedArtifacts } from '@/lib/server/artifact-repository'
import { isSupportedLanguage } from '@/types/language'
import { isMuseumDataVerified } from '@/lib/server/emuseum/snapshot'
import ArtifactDetailClient from './artifact-detail-client'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

function parseArtifactId(value: string): number | null {
  return isValidId(value) ? Number(value) : null
}

export function generateStaticParams() {
  return listArtifacts().map((artifact) => ({ id: String(artifact.id) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const artifactId = parseArtifactId(id)
  const artifact = artifactId === null ? undefined : findArtifactById(artifactId)
  const language = isSupportedLanguage(locale) ? locale : 'ko'

  if (!artifact) {
    return {
      title: '유물을 찾을 수 없습니다',
    }
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://museum100.kr').replace(/\/$/, '')
  const verifiedImage = isMuseumDataVerified() ? artifact.images?.[0] : undefined

  return {
    title: artifact.name[language],
    description: artifact.description[language],
    openGraph: {
      title: artifact.name[language],
      description: artifact.description[language],
      url: `${appUrl}/${language}/artifact/${artifact.id}`,
      ...(verifiedImage
        ? { images: [{ url: verifiedImage.src, alt: artifact.name[language] }] }
        : {}),
    },
    ...(artifact.source && artifact.rights
      ? {
        other: {
          'dcterms.source': artifact.source.datasetUrl,
          'dcterms.license': artifact.rights.metadata.licenseUrl,
          'dcterms.rights': artifact.rights.metadata.attribution,
        },
      }
      : {}),
    alternates: {
      canonical: `${appUrl}/${language}/artifact/${artifact.id}`,
      languages: {
        ...Object.fromEntries(
          i18n.locales.map((supportedLocale) => [
            supportedLocale,
            `${appUrl}/${supportedLocale}/artifact/${artifact.id}`,
          ]),
        ),
        'x-default': `${appUrl}/${i18n.defaultLocale}/artifact/${artifact.id}`,
      },
    },
  }
}

export default async function ArtifactDetail({ params }: Props) {
  const { locale, id } = await params
  const artifactId = parseArtifactId(id)
  const artifact = artifactId === null ? undefined : findArtifactById(artifactId)

  if (!isSupportedLanguage(locale) || !artifact) {
    notFound()
  }

  const relatedArtifacts = listRelatedArtifacts(artifact)

  return (
    <>
      <StructuredData type="artifact" data={artifact} locale={locale} />
      <ArtifactDetailClient artifact={artifact} relatedArtifacts={relatedArtifacts} />
    </>
  )
}
