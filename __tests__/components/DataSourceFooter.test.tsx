import { render, screen } from "@testing-library/react"
import { DataSourceFooter } from "@/components/data-source-footer"

describe("DataSourceFooter", () => {
  it("keeps the data source and usage guidance visible", () => {
    render(<DataSourceFooter locale="en" />)

    expect(screen.getByText(/Data source: eMuseum/)).toBeInTheDocument()
    expect(screen.getByText(/rights may differ by item/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Public-data product" })).toHaveAttribute(
      "href",
      "https://www.data.go.kr/data/3036708/openapi.do",
    )
    expect(screen.getByRole("link", { name: "KOGL guidance" })).toHaveAttribute(
      "href",
      "https://www.kogl.or.kr/info/license.do",
    )
  })
})
