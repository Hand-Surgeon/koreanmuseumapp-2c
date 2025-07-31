import { HallStats } from '@/lib/artifact-utils'
import { Artifact } from './artifact'

export interface Hall {
  name: string
  translatedName: string
  description: string
  icon: string
  color: string
  textColor: string
  stats: HallStats
  featured: Artifact[]
}