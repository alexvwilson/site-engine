"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { PublicPostCard } from "./PublicPostCard";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";
import type { BlogCategory } from "@/lib/drizzle/schema/blog-categories";

interface PostWithAuthor extends BlogPost {
  authorName?: string | null;
  categoryName?: string | null;
}

interface CategoryListingPageProps {
  initialPosts: PostWithAuthor[];
  siteSlug: string;
  siteId: string;
  category: BlogCategory;
  showAuthor: boolean;
  totalCount: number;
  postsPerPage?: number;
}

export function CategoryListingPage({
  initialPosts,
  siteSlug,
  siteId,
  category,
  showAuthor,
  totalCount,
  postsPerPage = 9,
}: CategoryListingPageProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(initialPosts.length);

  const hasMore = posts.length < totalCount;

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/blog/${siteId}/posts?offset=${offset}&limit=${postsPerPage}&category=${category.slug}`
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
      <div
        className="py-12 md:py-16"
        style={{ backgroundColor: "var(--theme-background)" }}
      >
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <Link
            href={`/sites/${siteSlug}/blog`}
            className="inline-flex items-center gap-2 mb-8 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--theme-primary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center space-y-4 px-4">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  color: "var(--theme-background)",
                }}
              >
                <Tag className="w-4 h-4" />
                {category.name}
              </div>
              <h1
                className="text-3xl font-bold"
                style={{
                  color: "var(--theme-text)",
                  fontFamily: "var(--theme-font-heading)",
                }}
              >
                No posts yet
              </h1>
              <p
                className="text-lg"
                style={{
                  color: "var(--theme-muted-text)",
                  fontFamily: "var(--theme-font-body)",
                }}
              >
                Check back soon for posts in this category!
              </p>
            </div>
          </div>
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
        {/* Back Link */}
        <Link
          href={`/sites/${siteSlug}/blog`}
          className="inline-flex items-center gap-2 mb-8 text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--theme-primary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              backgroundColor: "var(--theme-primary)",
              color: "var(--theme-background)",
            }}
          >
            <Tag className="w-4 h-4" />
            {category.name}
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              color: "var(--theme-text)",
              fontFamily: "var(--theme-font-heading)",
            }}
          >
            {category.name}
          </h1>
          {category.description && (
            <p
              className="text-lg mb-2"
              style={{
                color: "var(--theme-muted-text)",
                fontFamily: "var(--theme-font-body)",
              }}
            >
              {category.description}
            </p>
          )}
          <p
            className="text-sm"
            style={{
              color: "var(--theme-muted-text)",
              fontFamily: "var(--theme-font-body)",
            }}
          >
            {totalCount} {totalCount === 1 ? "post" : "posts"}
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
              categoryName={post.categoryName}
              categorySlug={category.slug}
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
