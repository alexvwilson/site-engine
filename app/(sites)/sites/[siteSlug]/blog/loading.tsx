export default function BlogLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--theme-background)" }}>
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="text-center mb-10 md:mb-12">
            <div className="h-10 w-32 mx-auto rounded animate-pulse bg-gray-200 dark:bg-gray-700 mb-3" />
            <div className="h-6 w-64 mx-auto rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Posts Grid Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--theme-border)" }}
              >
                {/* Image Skeleton */}
                <div className="aspect-video animate-pulse bg-gray-200 dark:bg-gray-700" />
                {/* Content Skeleton */}
                <div className="p-5 space-y-3">
                  <div className="h-6 w-3/4 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-full rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-2/3 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-1/3 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
