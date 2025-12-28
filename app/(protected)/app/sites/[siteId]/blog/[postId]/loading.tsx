import { Skeleton } from "@/components/ui/skeleton";

export default function PostEditorLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumbs skeleton */}
      <div className="border-b px-4 py-2">
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Editor column */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
