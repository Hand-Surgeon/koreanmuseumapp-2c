import { Suspense, type ReactNode } from 'react'
import { ErrorBoundary } from './error-boundary'
import { Skeleton } from '@/components/ui/skeleton'

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

/**
 * Combines Suspense and ErrorBoundary for async components
 * Handles both loading states and errors gracefully
 */
export function AsyncErrorBoundary({ 
  children, 
  fallback,
  loadingFallback 
}: AsyncErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={loadingFallback || <DefaultLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

function DefaultLoadingFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  )
}