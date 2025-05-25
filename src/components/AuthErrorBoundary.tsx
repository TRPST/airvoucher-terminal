import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  maxAutoRetries?: number;
  autoRetryDelay?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
  autoRetryCount: number;
  isAutoRetrying: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;

  public state: State = {
    hasError: false,
    retryCount: 0,
    autoRetryCount: 0,
    isAutoRetrying: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0, autoRetryCount: 0, isAutoRetrying: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an authentication error:', error);
    console.error('Error info:', errorInfo);

    // Check if this is the specific useState error we're dealing with
    if (error.message.includes('Cannot read properties of null') && error.message.includes('useState')) {
      console.error('Detected useState hydration error in auth component');
      
      // Attempt automatic retry for hydration errors (usually resolved after a brief delay)
      this.attemptAutoRetry();
    }
  }

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private attemptAutoRetry = () => {
    const maxAutoRetries = this.props.maxAutoRetries ?? 2;
    const autoRetryDelay = this.props.autoRetryDelay ?? 1500;

    if (this.state.autoRetryCount < maxAutoRetries) {
      console.log(`Auto-retrying auth component in ${autoRetryDelay}ms (attempt ${this.state.autoRetryCount + 1}/${maxAutoRetries})`);
      
      this.setState({ isAutoRetrying: true });
      
      this.retryTimeout = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: undefined,
          autoRetryCount: prevState.autoRetryCount + 1,
          isAutoRetrying: false
        }));
        
        if (this.props.onRetry) {
          this.props.onRetry();
        }
      }, autoRetryDelay);
    }
  };

  private handleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1,
      isAutoRetrying: false
    }));
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Show loading state during auto-retry
      if (this.state.isAutoRetrying) {
        return (
          <div className="w-full max-w-md mx-auto space-y-6 p-6 border border-border rounded-lg bg-card">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              </div>
            </div>
            
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold">Retrying...</h3>
              <p className="text-sm text-muted-foreground">
                Attempting to reload the authentication form.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full max-w-md mx-auto space-y-6 p-6 border border-border rounded-lg bg-card">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">Authentication Error</h3>
            <p className="text-sm text-muted-foreground">
              We encountered an issue loading the authentication form. 
              {this.state.autoRetryCount > 0 && ` We've already tried ${this.state.autoRetryCount} time(s) automatically.`}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={this.handleRetry}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              {this.state.retryCount > 0 ? `Try Again (${this.state.retryCount + 1})` : 'Try Again'}
            </button>
            
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <LogIn className="h-4 w-4" />
              Reload Page
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="text-left">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                Error Details (Development)
              </summary>
              <div className="mt-2 text-xs font-mono">
                <div className="rounded-md bg-muted p-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                <div className="rounded-md bg-muted p-2 mt-1">
                  <strong>Auto Retries:</strong> {this.state.autoRetryCount} / {this.props.maxAutoRetries ?? 2}
                </div>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
} 