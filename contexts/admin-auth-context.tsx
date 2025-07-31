"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
}

interface AdminAuthContextType {
  user: AdminUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  hasPermission: (permission: string) => boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// 임시 인증 (실제로는 API 연동 필요)
const DEMO_USERS = {
  'admin@museum.kr': { 
    password: 'admin123', 
    user: { id: '1', email: 'admin@museum.kr', name: '관리자', role: 'admin' as const }
  },
  'editor@museum.kr': { 
    password: 'editor123', 
    user: { id: '2', email: 'editor@museum.kr', name: '편집자', role: 'editor' as const }
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 세션 확인
  useEffect(() => {
    const checkSession = () => {
      try {
        const stored = localStorage.getItem('admin-session')
        if (stored) {
          const session = JSON.parse(stored)
          if (session.expires > Date.now()) {
            setUser(session.user)
          } else {
            localStorage.removeItem('admin-session')
          }
        }
      } catch (error) {
        console.error('세션 확인 실패:', error)
      }
      setIsLoading(false)
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // 데모 인증
    const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS]
    
    if (demoUser && demoUser.password === password) {
      const session = {
        user: demoUser.user,
        expires: Date.now() + 24 * 60 * 60 * 1000 // 24시간
      }
      
      localStorage.setItem('admin-session', JSON.stringify(session))
      setUser(demoUser.user)
      return true
    }
    
    return false
  }

  const logout = () => {
    localStorage.removeItem('admin-session')
    setUser(null)
    router.push('/admin/login')
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    const permissions: Record<string, string[]> = {
      admin: ['view', 'edit', 'delete', 'manage-users'],
      editor: ['view', 'edit'],
      viewer: ['view']
    }
    
    return permissions[user.role]?.includes(permission) || false
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        hasPermission
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}