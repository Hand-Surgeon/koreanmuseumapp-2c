import { renderHook, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage'
import { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('useLanguage', () => {
  beforeEach(() => {
    // localStorage 초기화
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('기본 언어는 한국어이다', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    expect(result.current.language).toBe('ko')
  })

  it('언어를 변경할 수 있다', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    act(() => {
      result.current.setLanguage('en')
    })
    
    expect(result.current.language).toBe('en')
  })

  it('언어 변경 시 localStorage에 저장된다', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    act(() => {
      result.current.setLanguage('ja')
    })
    
    expect(setItemSpy).toHaveBeenCalledWith('museum-language', 'ja')
  })

  it('올바른 번역을 반환한다', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })

    expect(result.current.t.nationalMuseum).toBe('국립중앙박물관')
    
    act(() => {
      result.current.setLanguage('en')
    })
    
    expect(result.current.t.nationalMuseum).toBe('National Museum of Korea')
  })

  it('초기 locale을 적용한다', () => {
    const initialLocaleWrapper = ({ children }: { children: ReactNode }) => (
      <LanguageProvider initialLocale="zh">{children}</LanguageProvider>
    )

    const { result } = renderHook(() => useLanguage(), { wrapper: initialLocaleWrapper })

    expect(result.current.language).toBe('zh')
    expect(result.current.t.nationalMuseum).toBe('韩国国立中央博物馆')
  })

  it('경로 locale을 저장소와 쿠키의 정본으로 동기화한다', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
    renderHook(() => useLanguage(), { wrapper })

    expect(setItemSpy).toHaveBeenCalledWith('museum-language', 'ko')
    expect(document.cookie).toContain('locale=ko')
  })
})
