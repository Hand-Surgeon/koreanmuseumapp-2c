/** @jest-environment node */

import { NextRequest } from "next/server"
import { GET } from "@/app/api/artifacts/route"

describe("GET /api/artifacts", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("validates locale and returns unique requested summaries", async () => {
    const response = GET(new NextRequest("http://localhost/api/artifacts?locale=en&ids=2,1,2,1abc,999"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.map(({ id }: { id: number }) => id)).toEqual([2, 1])
    expect(response.headers.get("cache-control")).toBe("private, max-age=300")
  })

  it("rejects unsupported locales", async () => {
    const response = GET(new NextRequest("http://localhost/api/artifacts?locale=fr&ids=1"))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: "Unsupported locale" })
  })

  it("serves the local snapshot boundary without calling the upstream API", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockRejectedValue(new Error("upstream must not run"))

    const response = GET(new NextRequest("http://localhost/api/artifacts?locale=ko&ids=1"))

    expect(response.status).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
