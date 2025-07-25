"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Image,
  FileText,
  Users,
  Settings,
  BarChart3,
  FolderOpen,
  Tag,
  Globe,
  Building,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/admin-auth-context'

const menuItems = [
  {
    title: '대시보드',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'view'
  },
  {
    title: '유물 관리',
    href: '/admin/artifacts',
    icon: Image,
    permission: 'view'
  },
  {
    title: '카테고리',
    href: '/admin/categories',
    icon: FolderOpen,
    permission: 'edit'
  },
  {
    title: '전시관',
    href: '/admin/halls',
    icon: Building,
    permission: 'edit'
  },
  {
    title: '태그 관리',
    href: '/admin/tags',
    icon: Tag,
    permission: 'edit'
  },
  {
    title: '콘텐츠 관리',
    href: '/admin/content',
    icon: FileText,
    permission: 'edit'
  },
  {
    title: '다국어 관리',
    href: '/admin/translations',
    icon: Globe,
    permission: 'edit'
  },
  {
    title: '사용자 관리',
    href: '/admin/users',
    icon: Users,
    permission: 'manage-users'
  },
  {
    title: '분석',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'view'
  },
  {
    title: '설정',
    href: '/admin/settings',
    icon: Settings,
    permission: 'admin'
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { hasPermission } = useAdminAuth()

  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(item.permission)
  )

  return (
    <aside className="fixed left-0 top-16 w-64 h-full bg-white border-r border-gray-200">
      <nav className="p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

