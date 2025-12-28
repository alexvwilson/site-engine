"use client";

import { PostCard } from "./PostCard";
import { FileText } from "lucide-react";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";

interface PostsListProps {
  posts: BlogPost[];
  siteId: string;
}

export function PostsList({ posts, siteId }: PostsListProps) {
  if (posts.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No posts yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first blog post to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} siteId={siteId} />
      ))}
    </div>
  );
}
