import React, { useState } from 'react'

interface ErrorFallbackProps {
    error?: Error
    errorInfo?: React.ErrorInfo
    onReset: () => void
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
    const [showDetails, setShowDetails] = useState(false)

    return (
        <div className="error-container">
            <div className="error-content">
                <div className="error-icon">⚠️</div>
                <h2 className="error-title">Something went wrong</h2>
                <p className="error-message">
                    The application encountered an unexpected error. Please try refreshing the page.
                </p>

                <div className="error-actions">
                    <button onClick={onReset} className="error-primary-button" aria-label="Try again">
                        Try Again
                    </button>
                    <button onClick={() => window.location.reload()} className="error-secondary-button">
                        Refresh Page
                    </button>
                    <button onClick={() => setShowDetails(!showDetails)} className="error-details-button">
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>

                {showDetails && (
                    <div className="error-details">
                        <h4 className="error-details-title">Error Details:</h4>
                        <pre className="error-content-message">{error?.toString()}</pre>
                        {errorInfo?.componentStack && (
                            <>
                                <h5 className="error-stack-title">Stack trace:</h5>
                                <pre className="error-stack-trace">{errorInfo.componentStack}</pre>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
