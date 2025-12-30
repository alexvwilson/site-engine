import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PostNavigationProps {
  basePath: string;
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export function PostNavigation({
  basePath,
  previous,
  next,
}: PostNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      className="border-t pt-8 mt-12"
      style={{ borderColor: "var(--theme-border)" }}
      aria-label="Post navigation"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Previous Post */}
        <div className="order-2 sm:order-1">
          {previous && (
            <Link
              href={`${basePath}/blog/${previous.slug}`}
              className="group block p-4 rounded-lg border transition-colors hover:border-opacity-50"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-background)",
              }}
            >
              <div
                className="flex items-center gap-1 text-xs mb-2"
                style={{ color: "var(--theme-muted-text)" }}
              >
                <ChevronLeft className="w-3 h-3" />
                Previous
              </div>
              <div
                className="font-medium line-clamp-2 group-hover:underline"
                style={{
                  color: "var(--theme-text)",
                  fontFamily: "var(--theme-font-heading)",
                }}
              >
                {previous.title}
              </div>
            </Link>
          )}
        </div>

        {/* Next Post */}
        <div className="order-1 sm:order-2 sm:text-right">
          {next && (
            <Link
              href={`${basePath}/blog/${next.slug}`}
              className="group block p-4 rounded-lg border transition-colors hover:border-opacity-50"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-background)",
              }}
            >
              <div
                className="flex items-center gap-1 text-xs mb-2 sm:justify-end"
                style={{ color: "var(--theme-muted-text)" }}
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </div>
              <div
                className="font-medium line-clamp-2 group-hover:underline"
                style={{
                  color: "var(--theme-text)",
                  fontFamily: "var(--theme-font-heading)",
                }}
              >
                {next.title}
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
