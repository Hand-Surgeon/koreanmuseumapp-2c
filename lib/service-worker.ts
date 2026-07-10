/** Register the production service worker once the browser is interactive. */
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return undefined

  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" })
  } catch (error) {
    console.error("Service worker registration failed:", error)
    return undefined
  }
}
