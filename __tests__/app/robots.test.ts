/** @jest-environment node */

jest.mock("@/lib/server/emuseum/snapshot", () => ({
  isMuseumDataVerified: jest.fn(),
}))

import robots from "@/app/robots"
import { isMuseumDataVerified } from "@/lib/server/emuseum/snapshot"

const mockedIsMuseumDataVerified = jest.mocked(isMuseumDataVerified)

describe("robots data-quality gate", () => {
  const originalValue = process.env.MUSEUM_DATA_VERIFIED

  afterEach(() => {
    mockedIsMuseumDataVerified.mockReset()
    if (originalValue === undefined) {
      delete process.env.MUSEUM_DATA_VERIFIED
    } else {
      process.env.MUSEUM_DATA_VERIFIED = originalValue
    }
  })

  it("blocks indexing until museum data is verified", () => {
    delete process.env.MUSEUM_DATA_VERIFIED
    mockedIsMuseumDataVerified.mockReturnValue(false)

    expect(robots().rules).toEqual([{ userAgent: "*", disallow: "/" }])
    expect(robots().sitemap).toBeUndefined()
  })

  it("allows public routes after explicit verification", () => {
    process.env.MUSEUM_DATA_VERIFIED = "true"
    mockedIsMuseumDataVerified.mockReturnValue(true)

    expect(robots().rules).toEqual([
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
    ])
    expect(robots().sitemap).toBe(`${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`)
  })
})
