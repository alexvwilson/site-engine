import Link from "next/link";
import Image from "next/image";
import { getPublishedPostsBySite } from "@/lib/queries/blog";
import type { BlogGridContent } from "@/lib/section-types";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";

interface BlogGridBlockProps {
  content: BlogGridContent;
  theme: ThemeData;
  siteId: string;
  basePath: string;
  showAuthor?: boolean;
  pageId?: string;
}

export async function BlogGridBlock({
  content,
  siteId,
  basePath,
  showAuthor = true,
  pageId,
}: BlogGridBlockProps) {
  // Resolve pageFilter to effective pageId for query
  let effectivePageId: string | null | undefined;

  const pageFilter = content.pageFilter ?? "all"; // Backwards compat for existing blocks

  if (pageFilter === "all") {
    effectivePageId = undefined; // No filter - all posts
  } else if (pageFilter === "current") {
    effectivePageId = pageId; // Use current page (undefined if no page context)
  } else if (pageFilter === "unassigned") {
    effectivePageId = null; // Only posts with no page assignment
  } else {
    effectivePageId = pageFilter; // Specific page ID
  }

  const posts = await getPublishedPostsBySite(
    siteId,
    content.postCount,
    0,
    effectivePageId
  );

  if (posts.length === 0) {
    return (
      <section
        className="py-16 text-center"
        style={{ backgroundColor: "var(--theme-background)" }}
      >
        <p style={{ color: "var(--theme-muted-text)" }}>
          No published posts yet.
        </p>
      </section>
    );
  }

  return (
    <section
      className="py-12 md:py-16"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const formattedDate = post.published_at
              ? new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "";

            return (
              <Link
                key={post.id}
                href={`${basePath}/blog/${post.slug}`}
                className="group block overflow-hidden rounded-lg border transition-all hover:shadow-lg"
                style={{
                  borderColor: "var(--theme-border)",
                  backgroundColor: "var(--theme-background)",
                }}
              >
                {post.featured_image ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-video flex items-center justify-center"
                    style={{ backgroundColor: "var(--theme-muted)" }}
                  >
                    <svg
                      className="w-12 h-12"
                      style={{ color: "var(--theme-muted-text)" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <h3
                    className="font-semibold text-lg line-clamp-2 group-hover:underline"
                    style={{
                      color: "var(--theme-text)",
                      fontFamily: "var(--theme-font-heading)",
                    }}
                  >
                    {post.title}
                  </h3>
                  {content.showExcerpt && post.excerpt && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{
                        color: "var(--theme-muted-text)",
                        fontFamily: "var(--theme-font-body)",
                      }}
                    >
                      {post.excerpt}
                    </p>
                  )}
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--theme-muted-text)" }}
                  >
                    {showAuthor && post.authorName && (
                      <>
                        <span>{post.authorName}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
