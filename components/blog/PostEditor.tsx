"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Globe, EyeOff, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
} from "@/app/actions/blog";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(
  () => import("@/components/editor/TiptapEditor").then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-muted rounded-md" />,
  }
);

interface PostEditorProps {
  post: BlogPost;
  siteId: string;
}

export function PostEditor({ post, siteId }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt || "");
  const [content, setContent] = useState(post.content?.html || "");
  const [featuredImage, setFeaturedImage] = useState(post.featured_image || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isPublished = post.status === "published";

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    const result = await updatePost(post.id, {
      title,
      slug,
      excerpt,
      content: { html: content },
      featured_image: featuredImage || null,
    });
    setIsSaving(false);

    if (result.success) {
      toast.success("Post saved");
    } else {
      toast.error(result.error || "Failed to save post");
    }
    return result.success;
  }, [post.id, title, slug, excerpt, content, featuredImage]);

  const handlePublish = async () => {
    setIsPublishing(true);
    const saved = await handleSave();
    if (!saved) {
      setIsPublishing(false);
      return;
    }

    const result = await publishPost(post.id);
    setIsPublishing(false);

    if (result.success) {
      toast.success("Post published!");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to publish");
    }
  };

  const handleUnpublish = async () => {
    const result = await unpublishPost(post.id);
    if (result.success) {
      toast.success("Post unpublished");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to unpublish");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePost(post.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success("Post deleted");
      router.push(`/app/sites/${siteId}?tab=blog`);
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const generateSlugFromTitle = () => {
    const newSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);
    setSlug(newSlug);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/app/sites/${siteId}?tab=blog`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant={isPublished ? "default" : "secondary"}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
            {isPublished && post.published_at && (
              <span className="text-sm text-muted-foreground">
                {new Date(post.published_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Editor Column */}
          <div className="space-y-4 min-w-0">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="text-xl font-semibold h-auto py-3"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Content</Label>
              <div className="border rounded-md">
                <TiptapEditor value={content} onChange={setContent} />
              </div>
            </div>
          </div>

          {/* Sidebar - Stacks on mobile */}
          <div className="space-y-4">
            {/* Actions Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="outline"
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>
                {isPublished ? (
                  <Button
                    variant="outline"
                    onClick={handleUnpublish}
                    className="w-full"
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full"
                  >
                    {isPublishing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="mr-2 h-4 w-4" />
                    )}
                    {isPublishing ? "Publishing..." : "Publish"}
                  </Button>
                )}
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </Button>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={featuredImage}
                  onChange={setFeaturedImage}
                  siteId={siteId}
                />
              </CardContent>
            </Card>

            {/* Post Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) =>
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                      }
                      placeholder="post-url-slug"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSlugFromTitle}
                      className="shrink-0"
                    >
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    /blog/{slug || "post-slug"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief description for listings..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown in blog listing cards
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{post.title}&quot;. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
