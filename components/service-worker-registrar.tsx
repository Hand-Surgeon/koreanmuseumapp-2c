"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/service-worker"

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      void registerServiceWorker()
    }
  }, [])

  return null
}
