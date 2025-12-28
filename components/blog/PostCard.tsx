"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Pencil, Trash2, Globe, EyeOff } from "lucide-react";
import { deletePost, publishPost, unpublishPost } from "@/app/actions/blog";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";

interface PostCardProps {
  post: BlogPost;
  siteId: string;
}

export function PostCard({ post, siteId }: PostCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isPublished = post.status === "published";

  const handleDelete = async () => {
    setIsDeleting(true);
    await deletePost(post.id);
    setIsDeleting(false);
    setShowDeleteDialog(false);
    router.refresh();
  };

  const handleTogglePublish = async () => {
    setIsUpdating(true);
    if (isPublished) {
      await unpublishPost(post.id);
    } else {
      await publishPost(post.id);
    }
    setIsUpdating(false);
    router.refresh();
  };

  const formattedDate = post.updated_at
    ? new Date(post.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <>
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        {/* Thumbnail */}
        <div className="hidden sm:block w-20 h-14 rounded overflow-hidden bg-muted flex-shrink-0">
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt=""
              width={80}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/app/sites/${siteId}/blog/${post.id}`}
              className="font-medium hover:underline truncate"
            >
              {post.title}
            </Link>
            <Badge variant={isPublished ? "default" : "secondary"} className="flex-shrink-0">
              {isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {post.excerpt || "No excerpt"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Updated {formattedDate}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/sites/${siteId}/blog/${post.id}`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/app/sites/${siteId}/blog/${post.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTogglePublish} disabled={isUpdating}>
                {isPublished ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{post.title}&quot;. This action cannot be
              undone.
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
