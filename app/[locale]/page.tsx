import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"
import { notFound } from "next/navigation"
import { LanguageSelector } from "@/components/language-selector"
import { ServerArtifactCard } from "@/components/server-artifact-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { translations } from "@/data/translations"
import { calculateHallStats, filterArtifacts } from "@/lib/artifact-utils"
import { hallConfigs } from "@/lib/hall-config"
import { listArtifacts } from "@/lib/server/artifact-repository"
import { HALL_NAMES } from "@/types/hall"
import { isSupportedLanguage } from "@/types/language"

interface HomePageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string | string[] }>
}

function getQueryParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? ""
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const [{ locale }, queryParams] = await Promise.all([params, searchParams])

  if (!isSupportedLanguage(locale)) {
    notFound()
  }

  const t = translations[locale]
  const artifacts = listArtifacts()
  const searchTerm = getQueryParam(queryParams.q)
  const filteredArtifacts = searchTerm
    ? filterArtifacts(artifacts, { searchTerm, language: locale })
    : []
  const featuredArtifacts = artifacts.filter((artifact) => artifact.featured).slice(0, 4)
  const halls = HALL_NAMES.map((hallName) => {
    const config = hallConfigs[hallName]
    const hallArtifacts = artifacts.filter((artifact) => artifact.hall === hallName)

    return {
      name: hallName,
      translatedName: t[config.translatedName],
      description: t[config.descriptionKey],
      icon: config.icon,
      color: config.color,
      textColor: config.textColor,
      stats: calculateHallStats(hallArtifacts),
      featured: hallArtifacts.filter((artifact) => artifact.featured).slice(0, 2),
    }
  })
  const countFormatter = new Intl.NumberFormat(locale)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.nationalMuseum}</h1>
              <p className="text-sm text-gray-600">{t.koreanCulturalHeritage}</p>
            </div>
            <LanguageSelector />
          </div>

          <form action={`/${locale}`} method="get" role="search" className="flex items-center gap-2">
            <div className="relative flex-1">
              <label htmlFor="artifact-search" className="sr-only">{t.search}</label>
              <Search
                aria-hidden="true"
                className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
              <Input
                id="artifact-search"
                name="q"
                type="search"
                placeholder={t.search}
                defaultValue={searchTerm}
                maxLength={100}
                className="rounded-xl border-gray-200 bg-white ps-10"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t.search}
            </button>
            {searchTerm && (
              <Link
                href={`/${locale}`}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t.resetFilters}
              </Link>
            )}
          </form>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 outline-none">
        {searchTerm ? (
          <section aria-labelledby="search-results-heading" className="mb-8">
            <h2 id="search-results-heading" className="mb-4 text-xl font-semibold text-gray-900">
              {t.searchResults} ({countFormatter.format(filteredArtifacts.length)})
            </h2>
            {filteredArtifacts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredArtifacts.map((artifact) => (
                  <ServerArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    language={locale}
                    translations={t}
                    showHall
                    showPropertyDesignation
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">{t.noResults}</p>
                <p className="mt-2 text-sm text-gray-600">{t.noResultsDesc}</p>
              </div>
            )}
          </section>
        ) : (
          <>
            <section aria-labelledby="featured-heading" className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="featured-heading" className="text-xl font-semibold text-gray-900">{t.featured}</h2>
                <Badge className="rounded-full">{t.featured}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {featuredArtifacts.map((artifact, index) => (
                  <ServerArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    language={locale}
                    translations={t}
                    showPropertyDesignation
                    priority={index < 2}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="hall-heading">
              <h2 id="hall-heading" className="mb-4 text-xl font-semibold text-gray-900">
                {t.specialExhibition}
              </h2>
              <div className="space-y-4">
                {halls.map((hall) => (
                  <Link
                    key={hall.name}
                    href={`/${locale}/hall/${encodeURIComponent(hall.name)}`}
                    className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Card className={`${hall.color} rounded-2xl border transition-shadow duration-300 hover:shadow-lg`}>
                      <CardContent className="p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="text-3xl" aria-hidden="true">{hall.icon}</span>
                          <div>
                            <h3 className={`text-xl font-bold ${hall.textColor}`}>{hall.translatedName}</h3>
                            <p className="mt-1 text-sm text-gray-600">{hall.description}</p>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
                          <span>{t.totalItems} {countFormatter.format(hall.stats.total)}</span>
                          {hall.stats.nationalTreasures > 0 && (
                            <span>{t.nationalTreasure} {countFormatter.format(hall.stats.nationalTreasures)}</span>
                          )}
                          {hall.stats.treasures > 0 && (
                            <span>{t.treasure} {countFormatter.format(hall.stats.treasures)}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {hall.featured.map((artifact) => (
                              <div key={artifact.id} className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/50">
                                <Image
                                  src={artifact.image || "/placeholder.svg"}
                                  alt=""
                                  fill
                                  className="object-contain"
                                  sizes="48px"
                                />
                                {artifact.culturalProperty && (
                                  <span
                                    className="absolute end-0 top-0 h-3 w-3 rounded-full bg-red-700"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          <ChevronRight
                            className="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-600"
                            aria-hidden="true"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <div className="h-8" aria-hidden="true" />
    </div>
  )
}
