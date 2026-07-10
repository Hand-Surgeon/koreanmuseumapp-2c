import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Award, Search } from "lucide-react"
import { notFound } from "next/navigation"
import { ServerArtifactCard } from "@/components/server-artifact-card"
import { Input } from "@/components/ui/input"
import { translations } from "@/data/translations"
import { calculateHallStats, filterArtifacts, isArtifactCategory } from "@/lib/artifact-utils"
import { hallConfigs } from "@/lib/hall-config"
import { listArtifactsByHall } from "@/lib/server/artifact-repository"
import type { ArtifactCategory } from "@/types/artifact"
import { HALL_NAMES, isHallName, type HallName } from "@/types/hall"
import { isSupportedLanguage, type Language } from "@/types/language"

interface HallPageProps {
  params: Promise<{ locale: string; name: string }>
  searchParams: Promise<{
    q?: string | string[]
    category?: string | string[]
  }>
}

function decodeHallName(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getQueryParam(value: string | string[] | undefined, maxLength = 100): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, maxLength) ?? ""
}

function createHallHref(
  locale: Language,
  hallName: HallName,
  searchTerm: string,
  category?: ArtifactCategory,
) {
  const query = new URLSearchParams()
  if (searchTerm) query.set("q", searchTerm)
  if (category) query.set("category", category)

  const queryString = query.toString()
  const pathname = `/${locale}/hall/${encodeURIComponent(hallName)}`
  return queryString ? `${pathname}?${queryString}` : pathname
}

export function generateStaticParams() {
  return HALL_NAMES.map((name) => ({ name }))
}

export async function generateMetadata({ params }: HallPageProps): Promise<Metadata> {
  const { locale, name } = await params
  const hallName = decodeHallName(name)

  if (!isSupportedLanguage(locale) || !isHallName(hallName)) {
    return { title: "Exhibition Hall" }
  }

  const config = hallConfigs[hallName]
  const translatedName = translations[locale][config.translatedName]

  return {
    title: translatedName,
    description: translations[locale][config.descriptionKey],
  }
}

export default async function HallPage({ params, searchParams }: HallPageProps) {
  const [{ locale, name }, queryParams] = await Promise.all([params, searchParams])
  const hallName = decodeHallName(name)

  if (!isSupportedLanguage(locale) || !isHallName(hallName)) {
    notFound()
  }

  const t = translations[locale]
  const config = hallConfigs[hallName]
  const hallArtifacts = listArtifactsByHall(hallName)
  const searchTerm = getQueryParam(queryParams.q)
  const requestedCategory = getQueryParam(queryParams.category, 40)
  const hallCategories = [...new Set(hallArtifacts.map((artifact) => artifact.category))]
  const selectedCategory = isArtifactCategory(requestedCategory)
    && hallCategories.includes(requestedCategory)
    ? requestedCategory
    : null
  const filteredArtifacts = filterArtifacts(hallArtifacts, {
    searchTerm,
    category: selectedCategory,
    language: locale,
  })
  const featuredArtifacts = filteredArtifacts.filter((artifact) => artifact.featured)
  const regularArtifacts = filteredArtifacts.filter((artifact) => !artifact.featured)
  const stats = calculateHallStats(filteredArtifacts)
  const countFormatter = new Intl.NumberFormat(locale)
  const resetHref = createHallHref(locale, hallName, "")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`${config.color} sticky top-0 z-50 border-b`}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="mb-4 flex items-center gap-3">
            <Link
              href={`/${locale}`}
              aria-label={t.backToHome}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <span className="text-2xl" aria-hidden="true">{config.icon}</span>
            <div>
              <h1 className={`text-xl font-bold ${config.textColor}`}>{t[config.translatedName]}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <span>{t.totalItems} {countFormatter.format(filteredArtifacts.length)}</span>
                {stats.nationalTreasures > 0 && (
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-red-700" aria-hidden="true" />
                    {t.nationalTreasure} {countFormatter.format(stats.nationalTreasures)}
                  </span>
                )}
                {stats.treasures > 0 && (
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-orange-800" aria-hidden="true" />
                    {t.treasure} {countFormatter.format(stats.treasures)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form
            action={`/${locale}/hall/${encodeURIComponent(hallName)}`}
            method="get"
            role="search"
            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
          >
            <div className="relative">
              <label htmlFor="hall-search" className="sr-only">{t.search}</label>
              <Search
                className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <Input
                id="hall-search"
                name="q"
                type="search"
                placeholder={`${t.search}...`}
                defaultValue={searchTerm}
                maxLength={100}
                className="rounded-xl border-gray-200 bg-white/90 ps-10"
              />
            </div>
            <div>
              <label htmlFor="hall-category" className="sr-only">{t.category}</label>
              <select
                id="hall-category"
                name="category"
                defaultValue={selectedCategory ?? ""}
                className="h-10 w-full rounded-xl border border-input bg-white/90 px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              >
                <option value="">{t.all}</option>
                {hallCategories.map((category) => (
                  <option key={category} value={category}>{t[category]}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t.filter}
            </button>
          </form>

          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={`${t.category} ${t.filter}`}>
            <Link
              href={createHallHref(locale, hallName, searchTerm)}
              aria-current={selectedCategory === null ? "page" : undefined}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selectedCategory === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent"
              }`}
            >
              {t.all}
            </Link>
            {hallCategories.map((category) => (
              <Link
                key={category}
                href={createHallHref(locale, hallName, searchTerm, category)}
                aria-current={selectedCategory === category ? "page" : undefined}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  selectedCategory === category
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                }`}
              >
                {t[category]}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 outline-none">
        <p className="sr-only" role="status">
          {t.totalItems} {countFormatter.format(filteredArtifacts.length)}
        </p>

        {featuredArtifacts.length > 0 && (
          <section className="mb-8" aria-labelledby="featured-artifacts-heading">
            <h2 id="featured-artifacts-heading" className="mb-4 text-xl font-semibold text-gray-900">
              {t.mainWorks}
            </h2>
            <div className="space-y-4">
              {featuredArtifacts.map((artifact, index) => (
                <ServerArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  language={locale}
                  translations={t}
                  variant="featured"
                  priority={index === 0}
                />
              ))}
            </div>
          </section>
        )}

        {regularArtifacts.length > 0 && (
          <section aria-labelledby="artifact-list-heading">
            <h2 id="artifact-list-heading" className="mb-4 text-xl font-semibold text-gray-900">
              {featuredArtifacts.length > 0 ? t.moreArtifacts : t.artifactList}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {regularArtifacts.map((artifact) => (
                <ServerArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  language={locale}
                  translations={t}
                  showDescription
                />
              ))}
            </div>
          </section>
        )}

        {filteredArtifacts.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-2 text-4xl text-gray-400" aria-hidden="true">🔍</div>
            <h2 className="mb-2 text-lg font-medium text-gray-900">{t.noResults}</h2>
            <p className="mb-4 text-gray-600">{t.noResultsDesc}</p>
            <Link
              href={resetHref}
              className="inline-flex h-10 items-center justify-center rounded-full border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t.resetFilters}
            </Link>
          </div>
        )}
      </main>

      <div className="h-8" aria-hidden="true" />
    </div>
  )
}
