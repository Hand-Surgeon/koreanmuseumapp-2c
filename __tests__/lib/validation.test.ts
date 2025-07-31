import {
  sanitizeSearchInput,
  isValidLanguage,
  isValidId,
  validateUrlParams,
  isValidHall,
} from '@/lib/validation'

describe('validation 유틸리티', () => {
  describe('sanitizeSearchInput', () => {
    it('HTML 태그를 제거한다', () => {
      const input = '<script>alert("XSS")</script>청자'
      expect(sanitizeSearchInput(input)).toBe('청자')
    })

    it('특수 문자를 이스케이프한다', () => {
      const input = 'javascript:alert("XSS")'
      expect(sanitizeSearchInput(input)).toBe('alert("XSS")')
    })

    it('최대 길이를 제한한다', () => {
      const input = 'a'.repeat(150)
      expect(sanitizeSearchInput(input)).toHaveLength(100)
    })

    it('앞뒤 공백을 제거한다', () => {
      const input = '  청자  '
      expect(sanitizeSearchInput(input)).toBe('청자')
    })
  })

  describe('isValidLanguage', () => {
    it('유효한 언어 코드를 확인한다', () => {
      expect(isValidLanguage('ko')).toBe(true)
      expect(isValidLanguage('en')).toBe(true)
      expect(isValidLanguage('zh')).toBe(true)
      expect(isValidLanguage('ja')).toBe(true)
      expect(isValidLanguage('th')).toBe(true)
    })

    it('유효하지 않은 언어 코드를 거부한다', () => {
      expect(isValidLanguage('fr')).toBe(false)
      expect(isValidLanguage('invalid')).toBe(false)
      expect(isValidLanguage('')).toBe(false)
    })
  })

  describe('isValidId', () => {
    it('유효한 ID를 확인한다', () => {
      expect(isValidId('1')).toBe(true)
      expect(isValidId('50')).toBe(true)
      expect(isValidId('100')).toBe(true)
    })

    it('유효하지 않은 ID를 거부한다', () => {
      expect(isValidId('0')).toBe(false)
      expect(isValidId('101')).toBe(false)
      expect(isValidId('-1')).toBe(false)
      expect(isValidId('abc')).toBe(false)
      expect(isValidId('')).toBe(false)
    })
  })

  describe('validateUrlParams', () => {
    it('유효한 파라미터를 통과시킨다', () => {
      const params = {
        page: '1',
        category: 'ceramics',
        hall: 'art'
      }
      const validated = validateUrlParams(params)
      
      expect(validated).toEqual(params)
    })

    it('특수 문자를 제거한다', () => {
      const params = {
        search: '<script>alert("XSS")</script>',
        category: 'ceramics"onclick="alert()'
      }
      const validated = validateUrlParams(params)
      
      expect(validated.search).toBe('scriptalert(XSS)/script')
      expect(validated.category).toBe('ceramicsonclick=alert()')
    })

    it('유효하지 않은 키를 제거한다', () => {
      const params = {
        'valid-key': 'value',
        'invalid key!': 'value',
        'script>': 'value'
      }
      const validated = validateUrlParams(params)
      
      expect(validated['valid-key']).toBe('value')
      expect(validated['invalid key!']).toBeUndefined()
      expect(validated['script>']).toBeUndefined()
    })

    it('값 길이를 제한한다', () => {
      const params = {
        search: 'a'.repeat(300)
      }
      const validated = validateUrlParams(params)
      
      expect(validated.search).toHaveLength(200)
    })
  })

  describe('isValidHall', () => {
    it('유효한 전시관 이름을 확인한다', () => {
      expect(isValidHall('archaeology')).toBe(true)
      expect(isValidHall('art')).toBe(true)
      expect(isValidHall('history')).toBe(true)
      expect(isValidHall('asia')).toBe(true)
      expect(isValidHall('donation')).toBe(true)
    })

    it('유효하지 않은 전시관 이름을 거부한다', () => {
      expect(isValidHall('invalid')).toBe(false)
      expect(isValidHall('')).toBe(false)
      expect(isValidHall('museum')).toBe(false)
    })
  })
})