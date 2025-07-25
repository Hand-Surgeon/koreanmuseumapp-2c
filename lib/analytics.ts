import { NextWebVitalsMetric } from 'next/app'

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void
    dataLayer: any[]
  }
}

// Web Vitals 보고
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // 개발 환경에서 콘솔 출력
  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }

  // Google Analytics로 전송
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // 성능 임계값 체크
  const thresholds = {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    TTFB: 800, // Time to First Byte
    CLS: 0.1,  // Cumulative Layout Shift
  }

  if (metric.name in thresholds) {
    const threshold = thresholds[metric.name as keyof typeof thresholds]
    if (metric.value > threshold) {
      console.warn(`⚠️ ${metric.name} 성능 저하: ${metric.value} (임계값: ${threshold})`)
      
      // Sentry로 성능 이슈 전송
      if (process.env.NODE_ENV === 'production' && window.Sentry) {
        window.Sentry.captureMessage(`성능 저하: ${metric.name}`, {
          level: 'warning',
          extra: {
            metric: metric.name,
            value: metric.value,
            threshold,
          },
        })
      }
    }
  }
}

// 페이지뷰 추적
export function pageview(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
    })
  }
}

// 이벤트 추적
export function event({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// 사용자 상호작용 추적
export function trackInteraction(
  element: string,
  action: string,
  label?: string
) {
  event({
    action,
    category: 'User Interaction',
    label: `${element}${label ? `: ${label}` : ''}`,
  })
}

// 검색 추적
export function trackSearch(searchTerm: string, resultsCount: number) {
  event({
    action: 'search',
    category: 'Search',
    label: searchTerm,
    value: resultsCount,
  })
}

// 유물 조회 추적
export function trackArtifactView(artifactId: number, artifactName: string) {
  event({
    action: 'view_item',
    category: 'Artifact',
    label: `${artifactId}: ${artifactName}`,
  })
}