import { Skeleton } from "@/components/ui/skeleton";

export default function TranscriptLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header skeleton */}
      <div className="space-y-10">
        {/* Back navigation skeleton */}
        <Skeleton className="h-4 w-40" />

        {/* File name, metadata, and action buttons */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            {/* File name skeleton */}
            <Skeleton className="h-8 w-64" />

            {/* Metadata row skeleton */}
            <div className="flex flex-wrap items-center space-x-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="w-full space-y-6">
        {/* Tab triggers skeleton */}
        <div className="border-b w-full">
          <div className="flex w-fit pb-0">
            <Skeleton className="h-10 w-24 rounded-none" />
            <Skeleton className="h-10 w-28 rounded-none ml-4" />
            <Skeleton className="h-10 w-24 rounded-none ml-4" />
          </div>
        </div>

        {/* Tab content skeleton */}
        <div className="space-y-6">
          {/* Search bar skeleton */}
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <Skeleton className="h-10 w-10" />
          </div>

          {/* Transcript content skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-10/12" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-9/12" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-10/12" />
          </div>
        </div>
      </div>
    </div>
  );
}
