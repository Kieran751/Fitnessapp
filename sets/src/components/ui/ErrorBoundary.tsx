import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Render error:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-dvh px-6"
          style={{ background: 'var(--bg-primary)' }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[var(--glass-border)] p-7 flex flex-col items-center gap-5 text-center"
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: 'var(--danger-surface)' }}
            >
              <AlertTriangle size={28} className="text-[var(--danger)]" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col gap-2">
              <h1
                className="text-2xl font-bold text-[var(--text-primary)] tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Something went wrong
              </h1>
              <p
                className="text-sm text-[var(--text-tertiary)] break-words"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {this.state.error.message || 'An unexpected error occurred.'}
              </p>
            </div>
            <Button fullWidth onClick={this.handleReload}>
              Reload App
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
