export default function PostLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--theme-background)" }}>
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link Skeleton */}
          <div className="h-5 w-28 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-8" />

          {/* Header Skeleton */}
          <div className="mb-8 md:mb-12">
            <div className="h-12 w-3/4 rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="h-5 w-48 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Featured Image Skeleton */}
          <div className="aspect-video mb-8 md:mb-12 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-700" />

          {/* Content Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-full rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-5/6 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-4/5 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-3/4 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
