import { redirect } from 'next/navigation'
import { i18n } from '@/i18n.config'

// 루트 경로 접근 시 기본 언어로 리다이렉트
export default function RootPage() {
  redirect(`/${i18n.defaultLocale}`)
}