import Link from "next/link";
import Image from "next/image";
import { getPublishedPostById } from "@/lib/queries/blog";
import type { BlogFeaturedContent } from "@/lib/section-types";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";

interface BlogFeaturedBlockProps {
  content: BlogFeaturedContent;
  theme: ThemeData;
  siteSlug: string;
  showAuthor?: boolean;
}

export async function BlogFeaturedBlock({
  content,
  siteSlug,
  showAuthor = true,
}: BlogFeaturedBlockProps) {
  if (!content.postId) {
    return (
      <section
        className="py-16 text-center"
        style={{ backgroundColor: "var(--theme-muted)" }}
      >
        <p style={{ color: "var(--theme-muted-text)" }}>
          No post selected. Edit this section to choose a featured post.
        </p>
      </section>
    );
  }

  const post = await getPublishedPostById(content.postId);

  if (!post) {
    return (
      <section
        className="py-16 text-center"
        style={{ backgroundColor: "var(--theme-muted)" }}
      >
        <p style={{ color: "var(--theme-muted-text)" }}>
          Selected post is no longer available.
        </p>
      </section>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <section
      className="py-12 md:py-20"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="container mx-auto px-4">
        <Link
          href={`/sites/${siteSlug}/blog/${post.slug}`}
          className="group block"
        >
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {post.featured_image ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div
                className="aspect-video rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--theme-muted)" }}
              >
                <svg
                  className="w-16 h-16"
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
            <div className="space-y-4">
              <h2
                className="text-3xl md:text-4xl font-bold group-hover:underline"
                style={{
                  color: "var(--theme-text)",
                  fontFamily: "var(--theme-font-heading)",
                }}
              >
                {post.title}
              </h2>
              {post.excerpt && (
                <p
                  className="text-lg"
                  style={{
                    color: "var(--theme-muted-text)",
                    fontFamily: "var(--theme-font-body)",
                  }}
                >
                  {post.excerpt}
                </p>
              )}
              <div
                className="flex items-center gap-2 text-sm"
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
          </div>
        </Link>
      </div>
    </section>
  );
}
