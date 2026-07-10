declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function pageview(url: string, measurementId: string) {
  window.gtag?.("config", measurementId, { page_path: url })
}
