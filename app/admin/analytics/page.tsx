"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Clock,
  Globe,
  Download,
  Calendar
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'

// 샘플 데이터
const viewsData = [
  { name: '1월', views: 4000, users: 2400 },
  { name: '2월', views: 3000, users: 1398 },
  { name: '3월', views: 2000, users: 9800 },
  { name: '4월', views: 2780, users: 3908 },
  { name: '5월', views: 1890, users: 4800 },
  { name: '6월', views: 2390, users: 3800 },
  { name: '7월', views: 3490, users: 4300 },
]

const artifactPopularity = [
  { name: '금동대향로', views: 4532 },
  { name: '백제금동대향로', views: 3678 },
  { name: '신라금관', views: 3241 },
  { name: '청자상감운학문매병', views: 2856 },
  { name: '경천사지십층석탑', views: 2341 },
]

const categoryData = [
  { name: '토기', value: 30, color: '#8884d8' },
  { name: '도자기', value: 25, color: '#82ca9d' },
  { name: '회화', value: 20, color: '#ffc658' },
  { name: '금속공예', value: 15, color: '#ff7c7c' },
  { name: '조각', value: 10, color: '#8dd1e1' },
]

const deviceData = [
  { name: '모바일', value: 60, color: '#0088FE' },
  { name: '데스크톱', value: 30, color: '#00C49F' },
  { name: '태블릿', value: 10, color: '#FFBB28' },
]

const languageData = [
  { name: '한국어', users: 45, percentage: 45 },
  { name: '영어', users: 25, percentage: 25 },
  { name: '중국어', users: 15, percentage: 15 },
  { name: '일본어', users: 10, percentage: 10 },
  { name: '태국어', users: 5, percentage: 5 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days')
  const [exportFormat, setExportFormat] = useState('csv')

  const handleExport = () => {
    console.log(`Exporting analytics data as ${exportFormat}`)
    // 실제 구현에서는 데이터를 선택한 형식으로 내보내기
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">분석 대시보드</h1>
          <p className="text-gray-500 mt-2">방문자 행동 및 콘텐츠 성과 분석</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">오늘</SelectItem>
              <SelectItem value="7days">최근 7일</SelectItem>
              <SelectItem value="30days">최근 30일</SelectItem>
              <SelectItem value="90days">최근 90일</SelectItem>
              <SelectItem value="year">올해</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            내보내기
          </Button>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 방문자</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28,453</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% 전월 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">페이지 조회수</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156,789</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3% 전월 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">평균 체류시간</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3분 24초</div>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              -2.1% 전월 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">즐겨찾기 추가</CardTitle>
            <Heart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,523</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18.7% 전월 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="artifacts">유물 분석</TabsTrigger>
          <TabsTrigger value="users">사용자 분석</TabsTrigger>
          <TabsTrigger value="performance">성능 지표</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* 방문자 추이 */}
          <Card>
            <CardHeader>
              <CardTitle>방문자 및 조회수 추이</CardTitle>
              <CardDescription>월별 방문자 수와 페이지 조회수</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" name="조회수" />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" name="방문자" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 기기별 방문 */}
            <Card>
              <CardHeader>
                <CardTitle>기기별 방문 비율</CardTitle>
                <CardDescription>방문자가 사용한 기기 유형</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 언어별 사용자 */}
            <Card>
              <CardHeader>
                <CardTitle>언어별 사용자 분포</CardTitle>
                <CardDescription>선호 언어 설정 통계</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languageData.map((lang) => (
                    <div key={lang.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{lang.name}</span>
                        <span className="text-sm text-gray-500">{lang.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="artifacts" className="space-y-4">
          {/* 인기 유물 */}
          <Card>
            <CardHeader>
              <CardTitle>인기 유물 TOP 10</CardTitle>
              <CardDescription>가장 많이 조회된 유물</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={artifactPopularity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 카테고리별 조회수 */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 조회 분포</CardTitle>
              <CardDescription>유물 카테고리별 사용자 관심도</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* 사용자 행동 패턴 */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 행동 흐름</CardTitle>
              <CardDescription>주요 페이지 간 이동 경로</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">홈 → 유물 상세</p>
                      <p className="text-sm text-gray-500">가장 일반적인 경로</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">65%</p>
                    <p className="text-sm text-gray-500">사용자</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">검색 → 유물 상세</p>
                      <p className="text-sm text-gray-500">검색 활용</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">25%</p>
                    <p className="text-sm text-gray-500">사용자</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">즐겨찾기 → 유물 상세</p>
                      <p className="text-sm text-gray-500">재방문 사용자</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">10%</p>
                    <p className="text-sm text-gray-500">사용자</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* 성능 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>페이지 로드 시간</CardTitle>
                <CardDescription>평균 로드 시간 (초)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">홈페이지</span>
                      <span className="text-sm font-medium">1.2s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">유물 상세</span>
                      <span className="text-sm font-medium">1.8s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">검색 결과</span>
                      <span className="text-sm font-medium">0.9s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>에러율</CardTitle>
                <CardDescription>페이지별 에러 발생률</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">404 Not Found</span>
                    <span className="text-sm font-medium text-red-600">0.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">500 Server Error</span>
                    <span className="text-sm font-medium text-red-600">0.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">JavaScript Error</span>
                    <span className="text-sm font-medium text-yellow-600">0.3%</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">전체 에러율</span>
                      <span className="text-sm font-bold text-green-600">0.9%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}