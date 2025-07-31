import dynamic from 'next/dynamic'

// 무거운 컴포넌트들을 동적으로 import
// 현재 사용하지 않는 컴포넌트들은 주석 처리
/*
export const DynamicChart = dynamic(
  () => import('@/components/ui/chart').then(mod => mod.ChartContainer),
  { ssr: false }
)

export const DynamicCarousel = dynamic(
  () => import('@/components/ui/carousel').then(mod => mod.Carousel),
  { ssr: false }
)

export const DynamicCalendar = dynamic(
  () => import('@/components/ui/calendar').then(mod => mod.Calendar),
  { ssr: false }
)

export const DynamicDrawer = dynamic(
  () => import('@/components/ui/drawer').then(mod => mod.Drawer),
  { ssr: false }
)
*/