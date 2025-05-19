import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading commission groups..." }: LoadingStateProps) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p>{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p className="mb-4 text-muted-foreground">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
