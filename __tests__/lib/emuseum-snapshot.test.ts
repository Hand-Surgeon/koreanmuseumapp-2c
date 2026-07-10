/** @jest-environment node */

import { validateEmuseumSnapshot } from "@/lib/server/emuseum/snapshot"

function artifact(id: number) {
  return {
    id,
    image: `/artworks/emuseum/snapshot/${id}.jpg`,
    images: [{ src: `/artworks/emuseum/snapshot/${id}.jpg` }],
    source: {
      provider: "emuseum",
      datasetId: "3036708",
      sourceId: `PS${String(id).padStart(28, "0")}`,
    },
    rights: { metadata: {} },
  }
}

describe("eMuseum snapshot gate", () => {
  it("accepts an empty unpublished snapshot without treating it as verified", () => {
    expect(validateEmuseumSnapshot({
      schemaVersion: 1,
      datasetId: "3036708",
      verified: false,
      records: [],
    })).toEqual({ valid: true, verified: false })
  })

  it("accepts only a complete 100-record verified snapshot", () => {
    const records = Array.from({ length: 100 }, (_, index) => artifact(index + 1))

    const validation = validateEmuseumSnapshot({
      schemaVersion: 1,
      datasetId: "3036708",
      verified: true,
      generatedAt: "2026-07-10T00:00:00.000Z",
      recordCount: 100,
      records,
    })

    expect(validation.valid).toBe(true)
    expect(validation.verified).toBe(true)
    expect(validation.records).toHaveLength(100)
  })

  it("rejects duplicate ids and source ids", () => {
    const records = Array.from({ length: 100 }, (_, index) => artifact(index + 1))
    records[99] = artifact(1)

    expect(validateEmuseumSnapshot({
      schemaVersion: 1,
      datasetId: "3036708",
      verified: true,
      generatedAt: "2026-07-10T00:00:00.000Z",
      recordCount: 100,
      records,
    })).toMatchObject({ valid: false, verified: false })
  })

  it("rejects a representative image that differs from the reviewed image list", () => {
    const records = Array.from({ length: 100 }, (_, index) => artifact(index + 1))
    records[0].image = "/artworks/emuseum/snapshot/different.jpg"

    expect(validateEmuseumSnapshot({
      schemaVersion: 1,
      datasetId: "3036708",
      verified: true,
      generatedAt: "2026-07-10T00:00:00.000Z",
      recordCount: 100,
      records,
    })).toMatchObject({ valid: false, verified: false })
  })
})
