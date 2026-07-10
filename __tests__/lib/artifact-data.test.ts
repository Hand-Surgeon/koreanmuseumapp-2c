import { artifacts } from "@/data/artifacts"
import { ARTIFACT_CATEGORIES } from "@/types/artifact"
import { HALL_NAMES } from "@/types/hall"
import { SUPPORTED_LANGUAGES } from "@/types/language"

describe("artifact data contract", () => {
  it("1부터 100까지의 고유 ID를 빠짐없이 가진다", () => {
    const ids = artifacts.map((artifact) => artifact.id).sort((a, b) => a - b)

    expect(ids).toEqual(Array.from({ length: 100 }, (_, index) => index + 1))
  })

  it("전시관과 카테고리가 canonical 값만 사용한다", () => {
    for (const artifact of artifacts) {
      expect(HALL_NAMES).toContain(artifact.hall)
      expect(ARTIFACT_CATEGORIES).toContain(artifact.category)
    }
  })

  it("모든 지원 언어의 필수 텍스트를 제공한다", () => {
    for (const artifact of artifacts) {
      for (const language of SUPPORTED_LANGUAGES) {
        expect(artifact.name[language].trim()).not.toBe("")
        expect(artifact.period[language].trim()).not.toBe("")
        expect(artifact.description[language].trim()).not.toBe("")
        expect(artifact.detailedInfo[language].trim()).not.toBe("")
      }
    }
  })
})
