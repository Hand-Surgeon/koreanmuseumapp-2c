import { Artifact } from '@/types/artifact'

// 전시관별로 데이터를 분할 로드
export async function loadArtifactsByHall(hall: string): Promise<Artifact[]> {
  // 실제 프로덕션에서는 API 호출이나 동적 import를 사용
  const { artifacts } = await import('@/data/artifacts')
  return artifacts.filter(a => a.hall === hall)
}

// 특정 유물 로드
export async function loadArtifactById(id: number): Promise<Artifact | undefined> {
  const { artifacts } = await import('@/data/artifacts')
  return artifacts.find(a => a.id === id)
}

// 페이지네이션을 위한 유물 로드
export async function loadArtifactsPaginated(
  page: number = 1, 
  limit: number = 12,
  hall?: string
): Promise<{ artifacts: Artifact[], total: number, hasMore: boolean }> {
  const { artifacts } = await import('@/data/artifacts')
  
  let filtered = artifacts
  if (hall) {
    filtered = filtered.filter(a => a.hall === hall)
  }
  
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedArtifacts = filtered.slice(start, end)
  
  return {
    artifacts: paginatedArtifacts,
    total: filtered.length,
    hasMore: end < filtered.length
  }
}