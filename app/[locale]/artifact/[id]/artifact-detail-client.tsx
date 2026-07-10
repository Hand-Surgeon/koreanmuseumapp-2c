"use client"

import { AlertTriangle, ArrowLeft, Award, Building, ExternalLink, Hash, MapPin, Ruler, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { AccessibleImageGallery } from "@/components/accessible-image-gallery"
import { ArtifactCard } from "@/components/artifact-card"
import { CulturalPropertyBadge } from "@/components/cultural-property-badge"
import { FavoriteButton } from "@/components/favorite-button"
import { ShareButton } from "@/components/share-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/useLanguage"
import { getCulturalPropertyType } from "@/lib/artifact-utils"
import { getHallConfig } from "@/lib/hall-config"
import type { Artifact } from "@/types/artifact"
import type { Language } from "@/types/language"

interface ArtifactDetailClientProps {
  artifact: Artifact
  relatedArtifacts: Artifact[]
}

interface RightsCopy {
  sourceAndRights: string
  imageCredit: string
  source: string
  metadataLicense: string
  viewEvidence: string
  thirdPartyNotice: string
  rightsPending: string
  independentNotice: string
}

const rightsCopy: Record<Language, RightsCopy> = {
  ko: {
    sourceAndRights: "출처 및 이용조건",
    imageCredit: "이미지 출처",
    source: "자료 출처",
    metadataLicense: "메타데이터 이용조건",
    viewEvidence: "근거 확인",
    thirdPartyNotice: "이미지 권리는 메타데이터와 별도로 검토되었습니다.",
    rightsPending: "출처와 이미지 권리를 확인 중입니다. 재사용하지 마세요.",
    independentNotice: "공공데이터를 바탕으로 작성한 안내 페이지입니다. 최종 정보는 연결된 원 출처를 확인하세요.",
  },
  en: {
    sourceAndRights: "Source and usage rights",
    imageCredit: "Image credit",
    source: "Data source",
    metadataLicense: "Metadata license",
    viewEvidence: "View evidence",
    thirdPartyNotice: "Image rights were reviewed separately from metadata rights.",
    rightsPending: "Source and image rights are still under review. Do not reuse this image.",
    independentNotice: "This guide uses public data. Consult the linked source for authoritative information.",
  },
  zh: {
    sourceAndRights: "来源与使用条件",
    imageCredit: "图片来源",
    source: "资料来源",
    metadataLicense: "元数据许可",
    viewEvidence: "查看依据",
    thirdPartyNotice: "图片权利与元数据权利分别审核。",
    rightsPending: "来源及图片权利仍在审核中，请勿再利用。",
    independentNotice: "本页面依据公共数据制作，权威信息请以所链接的原始来源为准。",
  },
  ja: {
    sourceAndRights: "出典と利用条件",
    imageCredit: "画像クレジット",
    source: "データ出典",
    metadataLicense: "メタデータの利用条件",
    viewEvidence: "根拠を確認",
    thirdPartyNotice: "画像の権利はメタデータとは別に確認されています。",
    rightsPending: "出典と画像の権利を確認中です。再利用しないでください。",
    independentNotice: "この案内ページは公共データに基づいています。確定情報はリンク先の原出典をご確認ください。",
  },
  th: {
    sourceAndRights: "แหล่งที่มาและเงื่อนไขการใช้",
    imageCredit: "เครดิตภาพ",
    source: "แหล่งข้อมูล",
    metadataLicense: "สิทธิ์การใช้ข้อมูลเมตา",
    viewEvidence: "ดูหลักฐาน",
    thirdPartyNotice: "สิทธิ์ของภาพได้รับการตรวจสอบแยกจากสิทธิ์ของข้อมูลเมตา",
    rightsPending: "กำลังตรวจสอบแหล่งที่มาและสิทธิ์ของภาพ โปรดอย่านำภาพไปใช้ซ้ำ",
    independentNotice: "หน้าคำแนะนำนี้จัดทำจากข้อมูลสาธารณะ โปรดตรวจสอบข้อมูลที่เป็นทางการจากแหล่งที่มาที่เชื่อมโยงไว้",
  },
}

export default function ArtifactDetailClient({ artifact, relatedArtifacts }: ArtifactDetailClientProps) {
  const { t, language } = useLanguage()
  const hallConfig = getHallConfig(artifact.hall)
  const culturalPropertyType = getCulturalPropertyType(artifact.culturalProperty)
  const categoryLabel = t[artifact.category as keyof typeof t] ?? artifact.category
  const copy = rightsCopy[language]
  const galleryImages = artifact.images?.map((image) => image.src) ?? [artifact.image]
  const primaryImage = artifact.images?.[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${language}`}>
              <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
              {t.backToHome}
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <ShareButton artifact={artifact} variant="outline" />
            <FavoriteButton artifactId={artifact.id} variant="outline" />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <figure>
            <AccessibleImageGallery
              images={galleryImages}
              alt={artifact.name[language]}
              name={artifact.name[language]}
            />
            <figcaption className={`mt-3 rounded-md border px-3 py-2 text-sm ${
              primaryImage ? "border-gray-200 bg-white text-gray-700" : "border-amber-300 bg-amber-50 text-amber-900"
            }`}>
              {primaryImage ? (
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.imageCredit}: {primaryImage.credit}</span>
                  <a
                    href={primaryImage.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 underline underline-offset-2"
                  >
                    {copy.viewEvidence}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {copy.rightsPending}
                </span>
              )}
            </figcaption>
          </figure>

          <div className="space-y-6">
            <section aria-labelledby="artifact-title">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 id="artifact-title" className="text-3xl font-bold text-gray-900">
                    {artifact.name[language]}
                  </h1>
                  <p className="mt-2 text-lg text-gray-600">{artifact.period[language]}</p>
                </div>
                {culturalPropertyType && (
                  <CulturalPropertyBadge
                    type={culturalPropertyType}
                    designation={language === "ko" ? artifact.culturalProperty : undefined}
                    size="md"
                  />
                )}
              </div>
              <p className="leading-7 text-gray-700">{artifact.description[language]}</p>
            </section>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold">{t.details}</h2>
                <dl className="space-y-4">
                  {artifact.material && (
                    <DetailRow icon={Award} label={t.material} value={artifact.material[language]} />
                  )}
                  {artifact.dimensions && (
                    <DetailRow icon={Ruler} label={t.dimensions} value={artifact.dimensions} />
                  )}
                  {artifact.location && (
                    <DetailRow icon={MapPin} label={t.location} value={artifact.location[language]} />
                  )}
                  {language === "ko" && (
                    <DetailRow icon={Building} label={t.exhibitionRoom} value={artifact.exhibitionRoom} />
                  )}
                  {artifact.artifactNumber && (
                    <DetailRow icon={Hash} label={t.artifactNumber} value={artifact.artifactNumber} />
                  )}
                  <div className="flex items-start gap-3">
                    <dt className="flex min-w-24 items-center gap-2 text-gray-500">
                      <Building className="h-4 w-4" aria-hidden="true" />
                      {t.hall}
                    </dt>
                    <dd>
                      <Badge variant="outline" className="gap-2">
                        <span aria-hidden="true">{hallConfig.icon}</span>
                        {t[hallConfig.translatedName]}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <dt className="min-w-24 text-gray-500">{t.category}</dt>
                    <dd className="text-gray-900">{String(categoryLabel)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 text-lg font-semibold">{t.detailedInfo}</h2>
                <p className="whitespace-pre-line leading-7 text-gray-700">
                  {artifact.detailedInfo[language]}
                </p>
              </CardContent>
            </Card>

            <Card id="source-rights">
              <CardContent className="p-6">
                <h2 className="mb-3 text-lg font-semibold">{copy.sourceAndRights}</h2>
                {artifact.source && artifact.rights ? (
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-medium text-gray-700">{copy.source}</dt>
                      <dd className="mt-1 text-gray-600">
                        {artifact.source.museumName} · {artifact.source.datasetName}
                        <a
                          href={artifact.source.datasetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ms-2 inline-flex items-center gap-1 underline underline-offset-2"
                        >
                          {copy.viewEvidence}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-700">{copy.metadataLicense}</dt>
                      <dd className="mt-1 text-gray-600">
                        {artifact.rights.metadata.attribution}
                        <a
                          href={artifact.rights.metadata.licenseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ms-2 inline-flex items-center gap-1 underline underline-offset-2"
                        >
                          {copy.viewEvidence}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">{copy.imageCredit}</dt>
                      <dd className="text-gray-600">{copy.thirdPartyNotice}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="flex items-start gap-2 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {copy.rightsPending}
                  </p>
                )}
                <p className="mt-4 border-t pt-3 text-xs leading-5 text-gray-500">
                  {copy.independentNotice}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedArtifacts.length > 0 && (
          <section className="mt-12" aria-labelledby="related-artifacts-title">
            <h2 id="related-artifacts-title" className="mb-6 text-2xl font-bold">
              {t.relatedArtifacts}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArtifacts.map((relatedArtifact) => (
                <ArtifactCard key={relatedArtifact.id} artifact={relatedArtifact} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

interface DetailRowProps {
  icon: typeof Award
  label: string
  value: string
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <dt className="flex min-w-24 items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  )
}
