import {
  findArtifactById,
  listArtifacts,
  listArtifactsByHall,
  listFavoriteArtifactSummaries,
  listRelatedArtifacts,
} from "@/lib/server/artifact-repository"

describe("artifact repository projections", () => {
  it("returns only requested artifacts in request order", () => {
    const summaries = listFavoriteArtifactSummaries([2, 1, 999], "en")

    expect(summaries.map(({ id }) => id)).toEqual([2, 1])
    expect(summaries[0].name).toBeTruthy()
    expect(summaries[0].hall).not.toMatch(/[가-힣]/)
  })

  it("does not expose a Korean designation in other locales", () => {
    const [summary] = listFavoriteArtifactSummaries([1], "en")

    if (summary.culturalProperty) {
      expect(summary.culturalProperty).not.toMatch(/[가-힣]/)
    }
  })

  it("supports catalog, hall, id, and related-artifact queries", () => {
    const catalog = listArtifacts()
    const artifact = findArtifactById(1)

    expect(catalog).toHaveLength(100)
    expect(findArtifactById(999)).toBeUndefined()
    expect(artifact).toBeDefined()
    expect(listArtifactsByHall(artifact!.hall)).toContainEqual(artifact)

    const related = listRelatedArtifacts(artifact!, 2)
    expect(related).toHaveLength(2)
    expect(related).not.toContainEqual(artifact)
  })
})
