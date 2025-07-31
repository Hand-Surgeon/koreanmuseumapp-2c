"use client"

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw } from 'lucide-react'
import { withLanguage, WithLanguageProps } from '@/hooks/withLanguage'

interface Props extends WithLanguageProps {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  isOffline: boolean
}

class NetworkErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false,
      isOffline: !navigator.onLine 
    }
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }

  handleOnline = () => {
    this.setState({ isOffline: false, hasError: false })
  }

  handleOffline = () => {
    this.setState({ isOffline: true })
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a network error
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return { hasError: true, isOffline: !navigator.onLine }
    }
    return { hasError: true, isOffline: false }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Network error:', error, errorInfo)
  }

  handleRetry = () => {
    if (navigator.onLine) {
      this.setState({ hasError: false })
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError || this.state.isOffline) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="bg-orange-100 p-4 rounded-full inline-block">
              <WifiOff className="h-12 w-12 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {this.state.isOffline ? '인터넷 연결 끊김' : '네트워크 오류'}
              </h2>
              <p className="text-gray-600">
                {this.state.isOffline 
                  ? '인터넷 연결을 확인해 주세요.'
                  : '네트워크 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
              </p>
            </div>
            <Button
              onClick={this.handleRetry}
              variant="default"
              className="gap-2"
              disabled={this.state.isOffline}
            >
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const NetworkErrorBoundary = withLanguage(NetworkErrorBoundaryComponent)