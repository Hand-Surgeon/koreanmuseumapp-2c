/** @jest-environment node */

import { generateMetadata } from "@/app/[locale]/artifact/[id]/page"

describe("artifact metadata rights gate", () => {
  const originalValue = process.env.MUSEUM_DATA_VERIFIED

  afterEach(() => {
    if (originalValue === undefined) delete process.env.MUSEUM_DATA_VERIFIED
    else process.env.MUSEUM_DATA_VERIFIED = originalValue
  })

  it("does not publish an unverified artifact image to Open Graph", async () => {
    delete process.env.MUSEUM_DATA_VERIFIED

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", id: "1" }),
    })

    expect(metadata.openGraph).not.toHaveProperty("images")
    expect(metadata.other).toBeUndefined()
  })
})
