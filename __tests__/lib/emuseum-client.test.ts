/** @jest-environment node */

import {
  createEmuseumClient,
  EmuseumClientError,
} from "@/lib/server/emuseum/client"

const API_BASE_URL = "https://www.emuseum.go.kr/openapi"
const DECODED_KEY = "test+service/key=="
const ENCODED_KEY = "test%2Bservice%2Fkey%3D%3D"

function jsonResponse(value: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value), {
    status: 200,
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers,
    },
  })
}

function createFetchMock(
  implementation: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) {
  return jest.fn(implementation) as unknown as jest.MockedFunction<typeof fetch>
}

function successEnvelope(list: unknown, overrides: Record<string, unknown> = {}) {
  return {
    params: { serviceKey: DECODED_KEY },
    pageNo: 1,
    numOfRows: 10,
    totalCount: 1,
    resultCode: "0000",
    resultMsg: "success",
    list,
    ...overrides,
  }
}

function relicRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "PS0100100100100000100000",
    museumCode: "PS01001001001",
    name: "삼안총",
    nameKr: "삼안총",
    nameCn: "三眼銃",
    indexWord: "신라, 불상,신라",
    glsv: "1",
    relicNo: "000001",
    relicSubNo: "00000",
    museumName2: "국립중앙박물관",
    imgUri:
      "www.emuseum.go.kr/openapi/img?serviceKey=image-token-original&imageId=original-image-id",
    imgThumUriL:
      "http://www.emuseum.go.kr/openapi/IMG?serviceKey=image-token-large&imageId=large-image-id",
    ...overrides,
  }
}

describe("eMuseum server-only client", () => {
  it("encodes the decoded key once and removes all service keys from parsed results", async () => {
    const fetchMock = createFetchMock(async () => jsonResponse(successEnvelope([relicRecord()])))
    const client = createEmuseumClient({
      apiKey: ENCODED_KEY,
      baseUrl: API_BASE_URL,
      fetchImpl: fetchMock,
    })

    const result = await client.listRelics({ nameKr: "삼안총" })

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      id: "PS0100100100100000100000",
      nameKr: "삼안총",
      alternateNameHanja: "三眼銃",
      indexWords: ["신라", "불상"],
      koglType: "1",
    })
    expect(result.items[0].images.original).toEqual({
      imageId: "original-image-id",
      variant: "original",
    })

    const [request, init] = fetchMock.mock.calls[0]
    const url = request instanceof URL ? request : new URL(String(request))
    expect(url.pathname).toBe("/openapi/relic/list")
    expect(url.searchParams.get("serviceKey")).toBe(DECODED_KEY)
    expect(url.searchParams.get("nameKr")).toBe("삼안총")
    expect(url.toString()).not.toContain("%252B")
    expect(init).toMatchObject({
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
    })

    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(DECODED_KEY)
    expect(serialized).not.toContain("image-token")
    expect(serialized).not.toContain("serviceKey")
  })

  it("normalizes detail, nested image, and related-list shapes without exposing image URLs", async () => {
    const detail = successEnvelope(relicRecord({
      nationalityName1: "한국",
      nationalityName2: "조선",
      materialName1: "금속",
      materialName2: "동합금",
      sizeInfo: "길이 10cm",
      desc: " 상세\r\n설명\t ",
    }), {
      pageNo: null,
      numOfRows: null,
      imageList: {
        totalCount: 1,
        list: {
          id: "PS0100100100100000100000",
          imgId: "PS0100100100100000100000000001",
          museumCode: "PS01001001001",
          imgOrder: "1",
          imgThumUriL:
            "www.emuseum.go.kr/openapi/img?serviceKey=image-download-token&imageId=download-image-id",
        },
      },
      relationList: {
        totalCount: 1,
        list: [{
          id: "PS0100100100100000100000",
          reltId: "PS0100100100100000200000",
          reltOrder: 1,
          reltRelicName: "연관 유물",
          reltImgUri:
            "www.emuseum.go.kr/openapi/img?serviceKey=related-token&imageId=related-image-id",
        }],
      },
    })
    const imageBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(jsonResponse(detail))
      .mockResolvedValueOnce(new Response(imageBytes, {
        status: 200,
        headers: { "content-type": "image/jpeg", "content-length": "4" },
      }))
    const client = createEmuseumClient({
      apiKey: DECODED_KEY,
      baseUrl: API_BASE_URL,
      fetchImpl: fetchMock,
    })

    const result = await client.getRelicDetail("PS0100100100100000100000")

    expect(result).toMatchObject({
      totalCount: 1,
      items: [{
        nationalityName1: "한국",
        nationalityName2: "조선",
        materialName2: "동합금",
        sizeInfo: "길이 10cm",
        description: "상세\n설명",
      }],
      images: [{
        sourceImageId: "PS0100100100100000100000000001",
        order: 1,
      }],
      related: [{
        relatedArtifactId: "PS0100100100100000200000",
        name: "연관 유물",
        images: { original: { imageId: "related-image-id", variant: "original" } },
      }],
    })

    const imageReference = result.images[0].images.large
    expect(imageReference).toBeDefined()
    const download = await client.downloadImage(imageReference!)

    expect(download).toEqual({
      bytes: imageBytes,
      contentType: "image/jpeg",
      extension: "jpg",
    })
    const imageRequest = fetchMock.mock.calls[1][0]
    const imageUrl = imageRequest instanceof URL ? imageRequest : new URL(String(imageRequest))
    expect(imageUrl.protocol).toBe("https:")
    expect(imageUrl.searchParams.get("serviceKey")).toBe("image-download-token")
    expect(imageUrl.searchParams.get("imageId")).toBe("download-image-id")
    expect(JSON.stringify(result)).not.toContain("image-download-token")
  })

  it("returns safe, classified API errors and does not retry quota failures", async () => {
    const fetchMock = createFetchMock(async () => jsonResponse({
      params: { serviceKey: DECODED_KEY },
      resultCode: "3005",
      resultMsg: `quota failure for ${DECODED_KEY}`,
    }))
    const client = createEmuseumClient({ apiKey: DECODED_KEY, fetchImpl: fetchMock })

    const error = await client.listCodes().catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(EmuseumClientError)
    expect(error).toMatchObject({
      code: "API_ERROR",
      resultCode: "3005",
      retryable: false,
    })
    expect(JSON.stringify(error)).not.toContain(DECODED_KEY)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("normalizes the documented short success code and accepts a single list object", async () => {
    const fetchMock = createFetchMock(async () => jsonResponse({
      pageNo: "1",
      numOfRows: "10",
      totalCount: "1",
      resultCode: "00",
      list: {
        level: "3",
        code: "PS01001",
        nameKr: "국립1",
      },
    }))
    const client = createEmuseumClient({ apiKey: DECODED_KEY, fetchImpl: fetchMock })

    await expect(client.listCodes({ parentCode: "PS01" })).resolves.toEqual({
      pageNo: 1,
      numOfRows: 10,
      totalCount: 1,
      items: [{ level: 3, code: "PS01001", nameKr: "국립1" }],
    })
  })

  it("times out the full response read and never includes the URL in the error", async () => {
    const fetchMock = createFetchMock((_input: RequestInfo | URL, init?: RequestInit) => (
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("request URL contains a secret")))
      })
    ))
    const client = createEmuseumClient({
      apiKey: DECODED_KEY,
      fetchImpl: fetchMock,
      timeoutMs: 5,
    })

    const error = await client.listCodes().catch((reason: unknown) => reason)

    expect(error).toMatchObject({ code: "TIMEOUT", retryable: true })
    expect(JSON.stringify(error)).not.toContain("secret")
    expect(JSON.stringify(error)).not.toContain(DECODED_KEY)
  })

  it("rejects oversized bodies, unsafe origins, and forged image references", async () => {
    const fetchMock = createFetchMock(async () => new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json", "content-length": "2048" },
    }))
    const client = createEmuseumClient({
      apiKey: DECODED_KEY,
      fetchImpl: fetchMock,
      maxResponseBytes: 1024,
    })

    await expect(client.listCodes()).rejects.toMatchObject({ code: "RESPONSE_TOO_LARGE" })
    await expect(client.downloadImage({ imageId: "forged", variant: "original" }))
      .rejects.toMatchObject({ code: "UNSAFE_IMAGE" })
    expect(() => createEmuseumClient({
      apiKey: DECODED_KEY,
      baseUrl: "http://www.emuseum.go.kr/openapi",
      fetchImpl: fetchMock,
    })).toThrow("plain HTTP requires explicit opt-in")
    expect(() => createEmuseumClient({
      apiKey: DECODED_KEY,
      baseUrl: "https://example.com/openapi",
      fetchImpl: fetchMock,
    })).toThrow("eMuseum /openapi endpoint")
  })

  it("allows the exact legacy HTTP endpoint only after an explicit opt-in", async () => {
    const fetchMock = createFetchMock(async () => jsonResponse({
      pageNo: 1,
      numOfRows: 1,
      totalCount: 1,
      resultCode: "0000",
      list: { code: "PS01", nameKr: "소장구분" },
    }))
    const client = createEmuseumClient({
      apiKey: DECODED_KEY,
      baseUrl: "http://www.emuseum.go.kr/openapi",
      allowInsecureHttp: true,
      fetchImpl: fetchMock,
    })

    await client.listCodes({ numOfRows: 1 })

    const request = fetchMock.mock.calls[0][0]
    const url = request instanceof URL ? request : new URL(String(request))
    expect(url.protocol).toBe("http:")
    expect(url.hostname).toBe("www.emuseum.go.kr")
  })

  it("rejects untrusted image URLs before they can be fetched", async () => {
    const fetchMock = createFetchMock(async () => jsonResponse(successEnvelope([
      relicRecord({
        imgUri: "https://evil.example/openapi/img?serviceKey=x&imageId=y",
        imgThumUriL: null,
      }),
    ])))
    const client = createEmuseumClient({ apiKey: DECODED_KEY, fetchImpl: fetchMock })

    await expect(client.listRelics()).rejects.toMatchObject({ code: "UNSAFE_IMAGE" })
  })
})
