"use client";

import { useState } from "react";
import { Rss } from "lucide-react";
import { PublicPostCard } from "./PublicPostCard";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";
import type { ImageFit } from "@/lib/section-types";

interface PostWithAuthor extends BlogPost {
  authorName?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
}

interface BlogListingPageProps {
  initialPosts: PostWithAuthor[];
  basePath: string;
  siteId: string;
  siteName: string;
  showAuthor: boolean;
  totalCount: number;
  postsPerPage?: number;
  imageFit?: ImageFit;
  blogTitle?: string | null;
}

export function BlogListingPage({
  initialPosts,
  basePath,
  siteId,
  siteName,
  showAuthor,
  totalCount,
  postsPerPage = 9,
  imageFit = "cover",
  blogTitle,
}: BlogListingPageProps) {
  const displayTitle = blogTitle || "Blog";
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(initialPosts.length);

  const hasMore = posts.length < totalCount;

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/blog/${siteId}/posts?offset=${offset}&limit=${postsPerPage}`
      );
      if (response.ok) {
        const newPosts = await response.json();
        setPosts((prev) => [...prev, ...newPosts]);
        setOffset((prev) => prev + newPosts.length);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    }
    setIsLoading(false);
  };

  if (posts.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h1
            className="text-3xl font-bold"
            style={{
              color: "var(--theme-text)",
              fontFamily: "var(--theme-font-heading)",
            }}
          >
            {displayTitle}
          </h1>
          <p
            className="text-lg"
            style={{
              color: "var(--theme-muted-text)",
              fontFamily: "var(--theme-font-body)",
            }}
          >
            No posts yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-12 md:py-16"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              color: "var(--theme-text)",
              fontFamily: "var(--theme-font-heading)",
            }}
          >
            {displayTitle}
          </h1>
          <p
            className="text-lg mb-4"
            style={{
              color: "var(--theme-muted-text)",
              fontFamily: "var(--theme-font-body)",
            }}
          >
            Latest posts from {siteName}
          </p>
          <a
            href={`${basePath}/blog/rss.xml`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-colors hover:opacity-80"
            style={{
              backgroundColor: "var(--theme-muted)",
              color: "var(--theme-text)",
            }}
          >
            <Rss className="w-4 h-4" />
            RSS Feed
          </a>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PublicPostCard
              key={post.id}
              post={post}
              basePath={basePath}
              showAuthor={showAuthor}
              authorName={post.authorName}
              categoryName={post.categoryName}
              categorySlug={post.categorySlug}
              imageFit={imageFit}
            />
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--theme-primary)",
                color: "var(--theme-background)",
              }}
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
