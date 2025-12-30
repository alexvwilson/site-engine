import Link from "next/link";
import Image from "next/image";
import { Clock, Tag } from "lucide-react";
import { calculateReadingTime } from "@/lib/blog-utils";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";

interface PublicPostCardProps {
  post: BlogPost;
  basePath: string;
  showAuthor?: boolean;
  authorName?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
}

export function PublicPostCard({
  post,
  basePath,
  showAuthor = true,
  authorName,
  categoryName,
  categorySlug,
}: PublicPostCardProps) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const readingTime = calculateReadingTime(post.content?.html);

  return (
    <Link
      href={`${basePath}/blog/${post.slug}`}
      className="group block overflow-hidden rounded-lg border transition-all hover:shadow-lg"
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: "var(--theme-background)",
      }}
    >
      {/* Featured Image */}
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

      {/* Content */}
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

        {post.excerpt && (
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

        {/* Category Badge */}
        {categoryName && categorySlug && (
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit"
            style={{
              backgroundColor: "var(--theme-primary)",
              color: "var(--theme-background)",
              opacity: 0.9,
            }}
          >
            <Tag className="w-3 h-3" />
            {categoryName}
          </span>
        )}

        <div
          className="flex items-center gap-2 text-xs flex-wrap"
          style={{ color: "var(--theme-muted-text)" }}
        >
          {showAuthor && authorName && (
            <>
              <span>{authorName}</span>
              <span>•</span>
            </>
          )}
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}
