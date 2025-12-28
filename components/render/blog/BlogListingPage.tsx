"use client";

import { useState } from "react";
import { PublicPostCard } from "./PublicPostCard";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";

interface PostWithAuthor extends BlogPost {
  authorName?: string | null;
}

interface BlogListingPageProps {
  initialPosts: PostWithAuthor[];
  siteSlug: string;
  siteId: string;
  siteName: string;
  showAuthor: boolean;
  totalCount: number;
  postsPerPage?: number;
}

export function BlogListingPage({
  initialPosts,
  siteSlug,
  siteId,
  siteName,
  showAuthor,
  totalCount,
  postsPerPage = 9,
}: BlogListingPageProps) {
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
            Blog
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
            Blog
          </h1>
          <p
            className="text-lg"
            style={{
              color: "var(--theme-muted-text)",
              fontFamily: "var(--theme-font-body)",
            }}
          >
            Latest posts from {siteName}
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PublicPostCard
              key={post.id}
              post={post}
              siteSlug={siteSlug}
              showAuthor={showAuthor}
              authorName={post.authorName}
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
