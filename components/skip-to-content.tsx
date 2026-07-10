import { i18n, type Locale } from "@/i18n.config"

const labels: Record<Locale, string> = {
  ko: "본문으로 건너뛰기",
  en: "Skip to main content",
  zh: "跳到主要内容",
  ja: "本文へ移動",
  th: "ข้ามไปยังเนื้อหาหลัก",
}

export function SkipToContent({ locale = i18n.defaultLocale }: { locale?: Locale }) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {labels[locale]}
    </a>
  )
}
