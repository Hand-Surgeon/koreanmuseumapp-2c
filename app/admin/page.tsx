"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Image,
  Users,
  Heart,
  Eye,
  TrendingUp,
  Calendar,
  FileText,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import { artifacts } from '@/data/artifacts'
import { useAdminAuth } from '@/contexts/admin-auth-context'

export default function AdminDashboard() {
  const { user } = useAdminAuth()

  // 통계 데이터 (실제로는 API에서 가져와야 함)
  const stats = {
    totalArtifacts: artifacts.length,
    totalViews: 156789,
    totalFavorites: 4523,
    activeUsers: 892,
    monthlyGrowth: 12.5,
    lastUpdated: new Date().toLocaleDateString('ko-KR'),
  }

  const quickActions = [
    { title: '새 유물 추가', href: '/admin/artifacts/new', icon: Image },
    { title: '콘텐츠 편집', href: '/admin/content', icon: FileText },
    { title: '번역 관리', href: '/admin/translations', icon: Globe },
    { title: '사용자 관리', href: '/admin/users', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-500 mt-2">
          환영합니다, {user?.name}님. 오늘도 좋은 하루 되세요!
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">전체 유물</CardTitle>
            <Image className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArtifacts}</div>
            <p className="text-xs text-gray-500 mt-1">
              국보 12점, 보물 24점 포함
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              이번 달 +{stats.monthlyGrowth}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">즐겨찾기</CardTitle>
            <Heart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalFavorites.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              활성 사용자 {stats.activeUsers}명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">마지막 업데이트</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastUpdated}</div>
            <p className="text-xs text-gray-500 mt-1">
              자동 백업 활성화됨
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 작업 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
          <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Icon className="h-6 w-6" />
                    <span className="text-sm">{action.title}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 편집된 유물</CardTitle>
            <CardDescription>최근 7일간 수정된 유물 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {artifacts.slice(0, 5).map((artifact) => (
                <div key={artifact.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{artifact.name.ko}</p>
                    <p className="text-sm text-gray-500">{artifact.period.ko}</p>
                  </div>
                  <Link href={`/admin/artifacts/${artifact.id}`}>
                    <Button size="sm" variant="ghost">
                      편집
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>인기 유물 TOP 5</CardTitle>
            <CardDescription>이번 달 가장 많이 조회된 유물</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {artifacts.slice(0, 5).map((artifact, index) => (
                <div key={artifact.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{artifact.name.ko}</p>
                    <p className="text-sm text-gray-500">
                      조회수 {Math.floor(Math.random() * 10000 + 5000).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}