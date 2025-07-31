import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { artifacts } from '@/data/artifacts'
import ArtifactDetailClient from './artifact-detail-client'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const artifact = artifacts.find((a) => a.id === Number.parseInt(id))
  
  if (!artifact) {
    return {
      title: '유물을 찾을 수 없습니다',
    }
  }

  return {
    title: `${artifact.name.ko} - 국립중앙박물관`,
    description: artifact.description.ko,
    openGraph: {
      title: artifact.name.ko,
      description: artifact.description.ko,
      images: [artifact.image],
    },
  }
}

export default async function ArtifactDetail({ params }: Props) {
  const { id } = await params
  const artifact = artifacts.find((a) => a.id === Number.parseInt(id))
  
  if (!artifact) {
    notFound()
  }

  const relatedArtifacts = artifacts
    .filter(
      (a) =>
        a.id !== artifact.id &&
        (a.category === artifact.category ||
          a.hall === artifact.hall)
    )
    .slice(0, 3)

  return (
    <ArtifactDetailClient 
      artifact={artifact} 
      relatedArtifacts={relatedArtifacts} 
    />
  )
}