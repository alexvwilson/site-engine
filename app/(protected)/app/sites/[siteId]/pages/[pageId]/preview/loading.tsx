import { Skeleton } from "@/components/ui/skeleton";

export default function PreviewLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header Skeleton */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Device Toggle Skeleton */}
      <div className="flex justify-center py-4 border-b bg-background">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 flex justify-center overflow-auto p-4 bg-muted/30">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Hero skeleton */}
          <Skeleton className="h-64 w-full" />

          {/* Content skeleton */}
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Features skeleton */}
          <div className="p-8 bg-muted/20">
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-3">
                  <Skeleton className="h-14 w-14 rounded-full mx-auto" />
                  <Skeleton className="h-5 w-24 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
