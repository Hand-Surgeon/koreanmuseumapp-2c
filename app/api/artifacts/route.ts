import { NextResponse, type NextRequest } from "next/server"
import { listFavoriteArtifactSummaries } from "@/lib/server/artifact-repository"
import { isValidId } from "@/lib/validation"
import { isSupportedLanguage } from "@/types/language"

const MAX_ARTIFACTS = 100

export function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? ""
  if (!isSupportedLanguage(locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 })
  }

  const ids = [
    ...new Set(
      (request.nextUrl.searchParams.get("ids") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(isValidId)
        .map(Number),
    ),
  ].slice(0, MAX_ARTIFACTS)

  return NextResponse.json(listFavoriteArtifactSummaries(ids, locale), {
    headers: {
      "Cache-Control": "private, max-age=300",
    },
  })
}
