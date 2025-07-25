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
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    act(() => {
      result.current.setLanguage('ja')
    })
    
    expect(localStorage.setItem).toHaveBeenCalledWith('museum-language', 'ja')
  })

  it('올바른 번역을 반환한다', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    expect(result.current.t.museumName).toBe('국립중앙박물관')
    
    act(() => {
      result.current.setLanguage('en')
    })
    
    expect(result.current.t.museumName).toBe('National Museum of Korea')
  })

  it('저장된 언어 설정을 불러온다', () => {
    localStorage.getItem.mockReturnValue('zh')
    
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    // useEffect가 실행될 때까지 대기
    expect(localStorage.getItem).toHaveBeenCalledWith('museum-language')
  })

  it('유효하지 않은 언어는 무시한다', () => {
    localStorage.getItem.mockReturnValue('invalid')
    
    const { result } = renderHook(() => useLanguage(), { wrapper })
    
    expect(result.current.language).toBe('ko')
  })
})