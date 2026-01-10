'use client';

import React, { type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
          <Card className='w-full max-w-md border-red-200 dark:border-red-900'>
            <CardHeader className='bg-red-50 dark:bg-red-950/30'>
              <div className='flex items-center gap-3'>
                <AlertCircle className='w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0' />
                <CardTitle className='text-red-900 dark:text-red-100'>
                  Something went wrong
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='pt-6 space-y-4'>
              <div className='space-y-2'>
                <p className='text-sm text-foreground/70'>
                  We encountered an unexpected error. Please try refreshing the
                  page or returning to the home page.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className='mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded text-xs font-mono text-foreground/60 overflow-auto max-h-40'>
                    <summary className='cursor-pointer font-semibold mb-2'>
                      Error Details (Development Only)
                    </summary>
                    <div className='space-y-1'>
                      <p className='text-red-600 dark:text-red-400'>
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className='whitespace-pre-wrap break-words'>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}
              </div>
              <div className='flex gap-3'>
                <Button
                  onClick={() => window.location.reload()}
                  variant='outline'
                  className='flex-1'
                >
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Refresh Page
                </Button>
                <Button onClick={this.handleReset} className='flex-1'>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
