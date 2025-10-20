"use client"

import { Component, type ReactNode } from "react"
import { logger } from "@/lib/error/logger"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    logger.error("Error caught by boundary", error, {
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Something went wrong</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{this.state.error?.message || "An unexpected error occurred"}</p>
                {process.env.NODE_ENV === "development" && (
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                    {this.state.error?.stack}
                  </pre>
                )}
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                    window.location.href = "/"
                  }}
                  className="w-full"
                >
                  Go Home
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      )
    }

    return this.props.children
  }
}
