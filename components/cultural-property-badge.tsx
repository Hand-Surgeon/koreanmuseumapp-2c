"use client"

import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"
import { BADGE_STYLES } from "@/lib/constants"

interface CulturalPropertyBadgeProps {
  type: 'nationalTreasure' | 'treasure'
  designation?: string
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export function CulturalPropertyBadge({ 
  type, 
  designation, 
  size = 'sm',
  showIcon = true 
}: CulturalPropertyBadgeProps) {
  const { t } = useLanguage()
  
  const badgeStyle = type === 'nationalTreasure' 
    ? BADGE_STYLES.nationalTreasure 
    : BADGE_STYLES.treasure

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <Badge className={`${badgeStyle} ${textSize}`}>
      {showIcon && <Award className={`${iconSize} mr-1`} />}
      {designation || (type === 'nationalTreasure' ? t.nationalTreasure : t.treasure)}
    </Badge>
  )
}