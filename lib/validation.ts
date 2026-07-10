import { isHallName } from '@/types/hall'
import { isSupportedLanguage } from '@/types/language'

// 검색어 sanitization
export function sanitizeSearchInput(input: string): string {
  // Script/style blocks must be removed with their contents before stripping
  // ordinary markup. React escapes search text, but this keeps query logging and
  // future API adapters free of executable-looking input.
  const withoutExecutableBlocks = input
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  const withoutTags = withoutExecutableBlocks.replace(/<[^>]*>/g, '')
  
  // 특수 문자 이스케이프
  const escaped = withoutTags
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    
  // 최대 길이 제한
  return escaped.slice(0, 100).trim()
}

// 언어 코드 검증
export function isValidLanguage(lang: string): boolean {
  return isSupportedLanguage(lang)
}

// ID 검증
export function isValidId(id: string): boolean {
  if (!/^[1-9]\d*$/.test(id)) return false

  const numId = Number(id)
  return Number.isSafeInteger(numId) && numId <= 100
}

// URL 파라미터 검증
export function validateUrlParams(params: Record<string, string>) {
  const validated: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(params)) {
    // 키 검증
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      continue
    }
    
    // 값 검증 및 sanitization
    const sanitized = value.replace(/[<>'"]/g, '').slice(0, 200)
    validated[key] = sanitized
  }
  
  return validated
}

// 전시관 이름 검증
export function isValidHall(hall: string): boolean {
  return isHallName(hall)
}

// 환경 변수 검증
export function validateEnvVars() {
  const required = [
    'NEXT_PUBLIC_APP_URL',
  ]
  
  const missing = required.filter((key) => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`⚠️ 누락된 환경 변수: ${missing.join(', ')}`)
  }
  
  return missing.length === 0
}
