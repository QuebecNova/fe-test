import React, { type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallback } from './components/Error'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    resetKeys?: any[]
}

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
    resetCount: number
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            resetCount: 0,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        this.setState({
            errorInfo,
        })

        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps): void {
        if (this.state.hasError) {
            if (this.props.resetKeys && prevProps.resetKeys !== this.props.resetKeys) {
                this.resetErrorBoundary()
            }
        }
    }

    resetErrorBoundary = (): void => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            resetCount: this.state.resetCount + 1,
        })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    onReset={this.resetErrorBoundary}
                />
            )
        }

        return this.props.children
    }
}
