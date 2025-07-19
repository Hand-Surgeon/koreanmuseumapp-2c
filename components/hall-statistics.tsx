"use client"

import { Users, Award } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"
import { HallStats } from "@/lib/artifact-utils"

interface HallStatisticsProps {
  stats: HallStats
  showTotal?: boolean
}

export function HallStatistics({ stats, showTotal = true }: HallStatisticsProps) {
  const { t } = useLanguage()
  
  return (
    <div className="flex items-center gap-6">
      {showTotal && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {t.totalItems} {stats.total}
          </span>
        </div>
      )}
      {stats.nationalTreasures > 0 && (
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-red-500" />
          <span className="text-sm text-gray-700">
            {t.nationalTreasure} {stats.nationalTreasures}
          </span>
        </div>
      )}
      {stats.treasures > 0 && (
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-700">
            {t.treasure} {stats.treasures}
          </span>
        </div>
      )}
    </div>
  )
}