import type { MetadataRoute } from "next"
import { isMuseumDataVerified } from "@/lib/server/emuseum/snapshot"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://museum100.kr").replace(/\/$/, "")
  const indexingAllowed = isMuseumDataVerified()

  return {
    rules: indexingAllowed
      ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: indexingAllowed ? `${baseUrl}/sitemap.xml` : undefined,
    host: baseUrl,
  }
}
