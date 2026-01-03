"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createPost } from "@/app/actions/blog";
import { PostsList } from "./PostsList";
import { BlogFilterBar, type BlogSortOption } from "./BlogFilterBar";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";
import type { Page } from "@/lib/drizzle/schema/pages";

interface BlogTabProps {
  siteId: string;
  posts: (BlogPost & { categoryName: string | null; pageName: string | null })[];
  pages: Page[];
}

function sortPosts(
  posts: BlogTabProps["posts"],
  sortBy: BlogSortOption
): BlogTabProps["posts"] {
  const sorted = [...posts];
  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case "updated":
      return sorted.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    case "alphabetical":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "status":
      return sorted.sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === "draft" ? -1 : 1;
      });
    default:
      return sorted;
  }
}

export function BlogTab({ siteId, posts, pages }: BlogTabProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Initialize state with defaults (will be updated from localStorage in useEffect)
  const [sortBy, setSortBy] = useState<BlogSortOption>("newest");
  const [pageFilter, setPageFilter] = useState("all");

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedSort = localStorage.getItem(`blog-sort-${siteId}`);
    const savedFilter = localStorage.getItem(`blog-page-filter-${siteId}`);
    if (savedSort) setSortBy(savedSort as BlogSortOption);
    if (savedFilter) setPageFilter(savedFilter);
  }, [siteId]);

  // Persist preferences to localStorage
  const handleSortChange = (value: BlogSortOption) => {
    setSortBy(value);
    localStorage.setItem(`blog-sort-${siteId}`, value);
  };

  const handlePageFilterChange = (value: string) => {
    setPageFilter(value);
    localStorage.setItem(`blog-page-filter-${siteId}`, value);
  };

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Apply page filter
    if (pageFilter !== "all") {
      result = result.filter((p) =>
        pageFilter === "unassigned" ? !p.page_id : p.page_id === pageFilter
      );
    }

    // Apply sort
    return sortPosts(result, sortBy);
  }, [posts, sortBy, pageFilter]);

  const handleCreatePost = async () => {
    setIsCreating(true);
    const result = await createPost(siteId);
    if (result.success && result.postId) {
      router.push(`/app/sites/${siteId}/blog/${result.postId}`);
    }
    setIsCreating(false);
  };

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  // Show filter info when filtering is active
  const isFiltering = pageFilter !== "all";
  const filterInfo = isFiltering
    ? `${filteredPosts.length} of ${posts.length} posts`
    : `${publishedCount} published, ${draftCount} draft${draftCount !== 1 ? "s" : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">
            {posts.length === 0
              ? "Create and manage blog posts for your site"
              : filterInfo}
          </p>
        </div>
        <Button onClick={handleCreatePost} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Creating..." : "New Post"}
        </Button>
      </div>

      {posts.length > 0 && (
        <BlogFilterBar
          sortBy={sortBy}
          onSortChange={handleSortChange}
          pageFilter={pageFilter}
          onPageFilterChange={handlePageFilterChange}
          pages={pages}
        />
      )}

      <PostsList posts={filteredPosts} siteId={siteId} />
    </div>
  );
}
