import { render } from "@testing-library/react"

jest.mock("@/lib/server/emuseum/snapshot", () => ({
  isMuseumDataVerified: () => true,
}))

import { StructuredData } from "@/components/structured-data"
import { artifacts } from "@/data/artifacts"
import type { Artifact } from "@/types/artifact"

function verifiedArtifact(): Artifact {
  return {
    ...artifacts[0],
    image: "/artworks/emuseum/snapshot/001.jpg",
    images: [{
      src: "/artworks/emuseum/snapshot/001.jpg",
      sourceImageId: "PS0100000000000000000000000001",
      order: 1,
      contentType: "image/jpeg",
      sha256: "a".repeat(64),
      credit: "National Museum of Korea / eMuseum",
      rightsStatus: "kogl-1",
      evidenceUrl: "https://www.data.go.kr/data/3036708/openapi.do",
      verifiedAt: "2026-07-10",
    }],
    source: {
      provider: "emuseum",
      datasetId: "3036708",
      datasetName: "eMuseum dataset",
      datasetUrl: "https://www.data.go.kr/data/3036708/openapi.do",
      sourceId: "PS0100000000000000000000",
      officialNameKr: artifacts[0].name.ko,
      museumCode: "PS01001001001",
      museumName: "국립중앙박물관",
      indexWords: [],
      syncedAt: "2026-07-10T00:00:00.000Z",
      normalizedSha256: "b".repeat(64),
    },
    rights: {
      metadata: {
        basis: "kogl-1",
        koglType: 1,
        licenseUrl: "https://www.kogl.or.kr/info/license.do",
        attribution: "National Museum of Korea / eMuseum",
        thirdPartyRightsIncluded: true,
        evidenceUrl: "https://www.data.go.kr/data/3036708/openapi.do",
        verifiedAt: "2026-07-10",
        reviewer: "data-review",
      },
      imagesHaveSeparateRights: true,
    },
  }
}

describe("StructuredData rights metadata", () => {
  it("keeps source, license, and image credit in artifact JSON-LD", () => {
    const { container } = render(
      <StructuredData type="artifact" data={verifiedArtifact()} locale="en" />,
    )
    const script = container.querySelector("script[type='application/ld+json']")
    const value = JSON.parse(script?.textContent ?? "{}")

    expect(value.isBasedOn).toBe("https://www.data.go.kr/data/3036708/openapi.do")
    expect(value.license).toBe("https://www.kogl.or.kr/info/license.do")
    expect(value.image).toMatchObject({
      "@type": "ImageObject",
      creditText: "National Museum of Korea / eMuseum",
      license: "https://www.kogl.or.kr/info/license.do",
    })
  })
})
