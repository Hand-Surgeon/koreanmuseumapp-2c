"use client"

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { withLanguage, WithLanguageProps } from '@/hooks/withLanguage'

interface Props extends WithLanguageProps {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

class DataErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Data fetching error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="bg-red-100 p-3 rounded-full inline-block">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                데이터를 불러올 수 없습니다
              </h3>
              <p className="text-sm text-gray-600">
                일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            </div>
            {this.props.onRetry && (
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const DataErrorBoundary = withLanguage(DataErrorBoundaryComponent)