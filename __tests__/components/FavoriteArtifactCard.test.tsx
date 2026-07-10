import { render, screen } from "@testing-library/react"
import { FavoriteArtifactCard } from "@/components/favorite-artifact-card"

jest.mock("@/components/favorite-button", () => ({
  FavoriteButton: ({ artifactId }: { artifactId: number }) => (
    <button type="button">Remove {artifactId}</button>
  ),
}))

describe("FavoriteArtifactCard", () => {
  it("renders a localized summary and locale-preserving link", () => {
    render(
      <FavoriteArtifactCard
        language="en"
        artifact={{
          id: 3,
          name: "Phoenix-patterned brick",
          period: "Baekje",
          description: "A landscape and phoenix patterned brick.",
          image: "/test-image.jpg",
          category: "Architecture",
          hall: "Archaeology Hall",
          culturalProperty: "Treasure",
        }}
      />,
    )

    expect(screen.getByRole("link")).toHaveAttribute("href", "/en/artifact/3")
    expect(screen.getByRole("heading", { name: "Phoenix-patterned brick" })).toBeInTheDocument()
    expect(screen.getByText("Archaeology Hall")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove 3" })).toBeInTheDocument()
  })
})
