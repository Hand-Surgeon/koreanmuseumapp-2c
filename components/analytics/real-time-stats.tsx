"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, Eye, Globe } from 'lucide-react'

interface RealTimeStats {
  activeUsers: number
  currentPageViews: number
  topPage: string
  topCountry: string
}

export function RealTimeStats() {
  const [stats, setStats] = useState<RealTimeStats>({
    activeUsers: 0,
    currentPageViews: 0,
    topPage: '',
    topCountry: ''
  })
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // 실시간 데이터 시뮬레이션
    const updateStats = () => {
      setStats({
        activeUsers: Math.floor(Math.random() * 50) + 20,
        currentPageViews: Math.floor(Math.random() * 100) + 50,
        topPage: ['/artifact/1', '/artifact/2', '/artifact/3', '/'][Math.floor(Math.random() * 4)],
        topCountry: ['한국', '미국', '중국', '일본'][Math.floor(Math.random() * 4)]
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 5000) // 5초마다 업데이트

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">실시간 통계</CardTitle>
        <Badge variant={isLive ? "default" : "secondary"} className="gap-1">
          <Activity className="h-3 w-3" />
          {isLive ? 'LIVE' : 'OFFLINE'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">활성 사용자</span>
            </div>
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">현재 조회수</span>
            </div>
            <p className="text-2xl font-bold">{stats.currentPageViews}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">인기 페이지</span>
            </div>
            <p className="text-sm font-medium">{stats.topPage}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">상위 국가</span>
            </div>
            <p className="text-sm font-medium">{stats.topCountry}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}