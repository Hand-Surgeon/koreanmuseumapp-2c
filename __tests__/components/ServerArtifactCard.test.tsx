import { render, screen } from "@testing-library/react"
import { ServerArtifactCard } from "@/components/server-artifact-card"
import { translations } from "@/data/translations"
import type { Artifact } from "@/types/artifact"

const artifact: Artifact = {
  id: 7,
  name: {
    ko: "청자 상감운학문 매병",
    en: "Celadon Maebyeong",
    zh: "青瓷象嵌云鹤纹梅瓶",
    ja: "青磁象嵌雲鶴文梅瓶",
    th: "แจกันเซลาดอน",
  },
  period: {
    ko: "고려",
    en: "Goryeo",
    zh: "高丽",
    ja: "高麗",
    th: "โกรยอ",
  },
  category: "ceramics",
  hall: "미술관",
  description: {
    ko: "고려청자의 대표작",
    en: "A masterpiece of Goryeo celadon",
    zh: "高丽青瓷代表作",
    ja: "高麗青磁の代表作",
    th: "ผลงานชิ้นเอกของเซลาดอนโกรยอ",
  },
  detailedInfo: {
    ko: "상세 정보",
    en: "Detailed information",
    zh: "详细信息",
    ja: "詳細情報",
    th: "ข้อมูลรายละเอียด",
  },
  image: "/test-image.jpg",
  featured: true,
  exhibitionRoom: "도자기실",
  culturalProperty: "국보 제68호",
}

describe("ServerArtifactCard", () => {
  it("renders localized content and a localized artifact URL without a provider", () => {
    render(
      <ServerArtifactCard
        artifact={artifact}
        language="en"
        translations={translations.en}
        showDescription
      />,
    )

    expect(screen.getByRole("heading", { name: "Celadon Maebyeong" })).toBeInTheDocument()
    expect(screen.getByText("A masterpiece of Goryeo celadon")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveAttribute("href", "/en/artifact/7")
  })
})
