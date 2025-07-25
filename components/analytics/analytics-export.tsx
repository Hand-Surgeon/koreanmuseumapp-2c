"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Download, FileSpreadsheet, FileText, FileBarChart } from 'lucide-react'

interface AnalyticsExportProps {
  onExport: (format: string, options: ExportOptions) => void
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf'
  dateRange: string
  includeCharts: boolean
  dataTypes: string[]
}

export function AnalyticsExport({ onExport }: AnalyticsExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv')
  const [dateRange, setDateRange] = useState('7days')
  const [includeCharts, setIncludeCharts] = useState(false)
  const [dataTypes, setDataTypes] = useState<string[]>(['views', 'users', 'favorites'])

  const handleExport = () => {
    onExport(format, {
      format,
      dateRange,
      includeCharts,
      dataTypes
    })
    setIsOpen(false)
  }

  const formatIcons = {
    csv: FileSpreadsheet,
    xlsx: FileSpreadsheet,
    pdf: FileText
  }

  const FormatIcon = formatIcons[format]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          내보내기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>분석 데이터 내보내기</DialogTitle>
          <DialogDescription>
            내보낼 데이터 형식과 옵션을 선택하세요
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 파일 형식 선택 */}
          <div className="space-y-3">
            <Label>파일 형식</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (쉼표로 구분된 값)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel (XLSX)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  PDF 보고서
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 기간 선택 */}
          <div className="space-y-2">
            <Label htmlFor="dateRange">데이터 기간</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger id="dateRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">오늘</SelectItem>
                <SelectItem value="7days">최근 7일</SelectItem>
                <SelectItem value="30days">최근 30일</SelectItem>
                <SelectItem value="90days">최근 90일</SelectItem>
                <SelectItem value="year">올해</SelectItem>
                <SelectItem value="all">전체 기간</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 포함할 데이터 선택 */}
          <div className="space-y-2">
            <Label>포함할 데이터</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="views"
                  checked={dataTypes.includes('views')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDataTypes([...dataTypes, 'views'])
                    } else {
                      setDataTypes(dataTypes.filter(t => t !== 'views'))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="views" className="cursor-pointer">조회수 데이터</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="users"
                  checked={dataTypes.includes('users')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDataTypes([...dataTypes, 'users'])
                    } else {
                      setDataTypes(dataTypes.filter(t => t !== 'users'))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="users" className="cursor-pointer">사용자 데이터</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="favorites"
                  checked={dataTypes.includes('favorites')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDataTypes([...dataTypes, 'favorites'])
                    } else {
                      setDataTypes(dataTypes.filter(t => t !== 'favorites'))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="favorites" className="cursor-pointer">즐겨찾기 데이터</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="artifacts"
                  checked={dataTypes.includes('artifacts')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDataTypes([...dataTypes, 'artifacts'])
                    } else {
                      setDataTypes(dataTypes.filter(t => t !== 'artifacts'))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="artifacts" className="cursor-pointer">유물별 통계</Label>
              </div>
            </div>
          </div>

          {/* PDF 옵션 */}
          {format === 'pdf' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeCharts"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="includeCharts" className="cursor-pointer">
                차트 이미지 포함
              </Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button onClick={handleExport} disabled={dataTypes.length === 0}>
            <FormatIcon className="mr-2 h-4 w-4" />
            내보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}