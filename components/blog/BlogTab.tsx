"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createPost } from "@/app/actions/blog";
import { PostsList } from "./PostsList";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";

interface BlogTabProps {
  siteId: string;
  posts: BlogPost[];
}

export function BlogTab({ siteId, posts }: BlogTabProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">
            {posts.length === 0
              ? "Create and manage blog posts for your site"
              : `${publishedCount} published, ${draftCount} draft${draftCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={handleCreatePost} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Creating..." : "New Post"}
        </Button>
      </div>

      <PostsList posts={posts} siteId={siteId} />
    </div>
  );
}
