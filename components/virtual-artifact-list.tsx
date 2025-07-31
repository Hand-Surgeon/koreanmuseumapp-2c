"use client"

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useMemo } from 'react'
import { ArtifactCard } from './artifact-card'
import { Artifact } from '@/types/artifact'

interface VirtualArtifactListProps {
  artifacts: Artifact[]
  columns?: number
  basePath?: string
}

export function VirtualArtifactList({ 
  artifacts, 
  columns = 3,
  basePath = ''
}: VirtualArtifactListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Group artifacts into rows
  const rows = useMemo(() => {
    const rowsArray = []
    for (let i = 0; i < artifacts.length; i += columns) {
      rowsArray.push(artifacts.slice(i, i + columns))
    }
    return rowsArray
  }, [artifacts, columns])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  })

  return (
    <div 
      ref={parentRef}
      className="h-[calc(100vh-200px)] overflow-auto"
      style={{
        contain: 'strict'
      }}
      data-testid="virtual-scroll-container"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
                {row.map((artifact) => (
                  <div key={artifact.id} data-testid="artifact-card">
                    <ArtifactCard 
                      artifact={artifact} 
                      basePath={basePath}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}