"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { artifacts } from '@/data/artifacts'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function ArtifactsManagementPage() {
  const { hasPermission } = useAdminAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterHall, setFilterHall] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  
  const canEdit = hasPermission('edit')
  const canDelete = hasPermission('delete')

  // 필터링된 유물 목록
  const filteredArtifacts = artifacts.filter((artifact) => {
    const matchesSearch = artifact.name.ko.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artifact.id.toString().includes(searchTerm)
    const matchesHall = filterHall === 'all' || artifact.hall === filterHall
    const matchesCategory = filterCategory === 'all' || artifact.category === filterCategory
    
    return matchesSearch && matchesHall && matchesCategory
  })

  const handleDelete = (id: number) => {
    console.log('삭제할 유물 ID:', id)
    // 실제로는 API 호출
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">유물 관리</h1>
          <p className="text-gray-500 mt-2">전체 {artifacts.length}개의 유물</p>
        </div>
        {canEdit && (
          <Link href="/admin/artifacts/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              새 유물 추가
            </Button>
          </Link>
        )}
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="유물명 또는 ID로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterHall} onValueChange={setFilterHall}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="전시관 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 전시관</SelectItem>
            <SelectItem value="archaeology">고고관</SelectItem>
            <SelectItem value="art">미술관</SelectItem>
            <SelectItem value="history">역사관</SelectItem>
            <SelectItem value="asia">아시아관</SelectItem>
            <SelectItem value="donation">기증관</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 카테고리</SelectItem>
            <SelectItem value="pottery">토기</SelectItem>
            <SelectItem value="ceramics">도자기</SelectItem>
            <SelectItem value="metalcraft">금속공예</SelectItem>
            <SelectItem value="painting">회화</SelectItem>
            <SelectItem value="sculpture">조각</SelectItem>
            <SelectItem value="calligraphy">서예</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 유물 테이블 */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>유물명</TableHead>
              <TableHead>시대</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>전시관</TableHead>
              <TableHead>문화재</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArtifacts.map((artifact) => (
              <TableRow key={artifact.id}>
                <TableCell className="font-medium">{artifact.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{artifact.name.ko}</p>
                    <p className="text-sm text-gray-500">{artifact.name.en}</p>
                  </div>
                </TableCell>
                <TableCell>{artifact.period.ko}</TableCell>
                <TableCell>
                  <Badge variant="outline">{artifact.category}</Badge>
                </TableCell>
                <TableCell>{artifact.hall}</TableCell>
                <TableCell>
                  {artifact.culturalProperty && (
                    <Badge className="bg-red-100 text-red-700">
                      {artifact.culturalProperty}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/artifact/${artifact.id}`} target="_blank">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {canEdit && (
                      <Link href={`/admin/artifacts/${artifact.id}/edit`}>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>유물 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              정말로 "{artifact.name.ko}"을(를) 삭제하시겠습니까?
                              이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(artifact.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}