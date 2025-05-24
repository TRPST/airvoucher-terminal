import { useRouter } from "next/router";
import { Loader2, AlertCircle, Store } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading retailer details..." }: LoadingStateProps) {
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
}

export function ErrorState({ error }: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p className="mb-4 text-muted-foreground">{error}</p>
        <button
          onClick={() => router.push("/admin/retailers")}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Back to Retailers
        </button>
      </div>
    </div>
  );
}

export function NotFoundState() {
  const router = useRouter();

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <Store className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Retailer Not Found</h2>
        <p className="mb-4 text-muted-foreground">
          The retailer you are looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/admin/retailers")}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Back to Retailers
        </button>
      </div>
    </div>
  );
}
