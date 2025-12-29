"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlogFeaturedContent } from "@/lib/section-types";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";

interface BlogFeaturedEditorProps {
  content: BlogFeaturedContent;
  onChange: (content: BlogFeaturedContent) => void;
  siteId: string;
}

export function BlogFeaturedEditor({
  content,
  onChange,
  siteId,
}: BlogFeaturedEditorProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`/api/blog/${siteId}/posts?limit=50`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
      setIsLoading(false);
    }
    fetchPosts();
  }, [siteId]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Post to Feature</Label>
        <Select
          value={content.postId || "none"}
          onValueChange={(value) =>
            onChange({ postId: value === "none" ? null : value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={isLoading ? "Loading posts..." : "Select a post"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No post selected</SelectItem>
            {posts.map((post) => (
              <SelectItem key={post.id} value={post.id}>
                {post.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {posts.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">
            No published posts yet. Create and publish a post in the Blog tab
            first.
          </p>
        )}
      </div>
    </div>
  );
}
