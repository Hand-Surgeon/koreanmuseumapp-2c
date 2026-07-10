import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { FavoritesProvider, useFavorites } from "@/contexts/favorites-context"

const wrapper = ({ children }: { children: ReactNode }) => (
  <FavoritesProvider>{children}</FavoritesProvider>
)

describe("FavoritesProvider", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    localStorage.clear()
  })

  it("sanitizes persisted IDs and keeps them unique", async () => {
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(
      JSON.stringify([1, 1, 0, 101, "2", 2]),
    )

    const { result } = renderHook(() => useFavorites(), { wrapper })

    await waitFor(() => expect(result.current.favorites).toEqual([1, 2]))
    expect(result.current.favoritesCount).toBe(2)
  })

  it("toggles valid IDs, rejects invalid IDs, and follows storage events", async () => {
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null)
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addFavorite(3)
      result.current.addFavorite(999)
    })
    expect(result.current.favorites).toEqual([3])

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", {
        key: "museum-favorites",
        newValue: JSON.stringify([4, 4, -1]),
      }))
    })

    expect(result.current.favorites).toEqual([4])
  })
})
