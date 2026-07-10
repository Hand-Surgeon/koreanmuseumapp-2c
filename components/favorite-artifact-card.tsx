"use client"

import Image from "next/image"
import Link from "next/link"
import { Building } from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { FavoriteArtifactSummary } from "@/types/artifact"
import type { Language } from "@/types/language"

export function FavoriteArtifactCard({
  artifact,
  language,
}: {
  artifact: FavoriteArtifactSummary
  language: Language
}) {
  return (
    <div className="relative h-full">
      <Link
        href={`/${language}/artifact/${artifact.id}`}
        className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="group h-full overflow-hidden rounded-2xl border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-0">
            <div className="relative aspect-[4/3]">
              <Image
                src={artifact.image}
                alt={artifact.name}
                fill
                className="bg-gray-50 object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {artifact.culturalProperty && (
                <Badge className="absolute start-2 top-2 max-w-[calc(100%-4rem)] rounded-full bg-red-700 text-xs text-white">
                  {artifact.culturalProperty}
                </Badge>
              )}
            </div>
            <div className="p-3">
              <h2 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-900">{artifact.name}</h2>
              <p className="mb-2 text-xs text-gray-600">{artifact.period}</p>
              <p className="mb-2 line-clamp-2 text-xs text-gray-700">{artifact.description}</p>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="rounded-full text-xs">{artifact.category}</Badge>
                <span className="flex min-w-0 items-center gap-1 text-xs text-gray-500">
                  <Building aria-hidden="true" className="h-3 w-3 shrink-0" />
                  <span className="truncate">{artifact.hall}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <FavoriteButton
        artifactId={artifact.id}
        variant="outline"
        className="absolute end-2 top-2 z-10 border-white/70 bg-white/90 shadow-sm hover:bg-white"
      />
    </div>
  )
}
