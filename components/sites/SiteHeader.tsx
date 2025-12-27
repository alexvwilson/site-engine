"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MoreHorizontal, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { SiteStatusBadge } from "./SiteStatusBadge";
import { updateSite, deleteSite, publishSite, unpublishSite } from "@/app/actions/sites";
import type { Site } from "@/lib/drizzle/schema/sites";
import { toast } from "sonner";

interface SiteHeaderProps {
  site: Site;
}

export function SiteHeader({ site }: SiteHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(site.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSaveName = () => {
    if (!editedName.trim()) {
      setEditedName(site.name);
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const result = await updateSite(site.id, { name: editedName.trim() });
      if (result.success) {
        setIsEditing(false);
        toast.success("Site name updated");
      } else {
        toast.error(result.error || "Failed to update site name");
      }
    });
  };

  const handleCancelEdit = () => {
    setEditedName(site.name);
    setIsEditing(false);
  };

  const handleTogglePublish = () => {
    startTransition(async () => {
      const action = site.status === "published" ? unpublishSite : publishSite;
      const result = await action(site.id);
      if (result.success) {
        toast.success(site.status === "published" ? "Site unpublished" : "Site published");
      } else {
        toast.error(result.error || "Failed to update site status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSite(site.id);
      if (result.success) {
        toast.success("Site deleted");
        router.push("/app");
      } else {
        toast.error(result.error || "Failed to delete site");
      }
    });
  };

  return (
    <>
      <div className="mb-8">
        {/* Back link */}
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sites
        </Link>

        {/* Site name and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold h-10 w-64"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSaveName}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <h1
                className="text-3xl font-bold cursor-pointer hover:text-muted-foreground transition-colors"
                onClick={() => setIsEditing(true)}
                title="Click to edit"
              >
                {site.name}
              </h1>
            )}
            <SiteStatusBadge status={site.status} />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={site.status === "published" ? "outline" : "default"}
              onClick={handleTogglePublish}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {site.status === "published" ? "Unpublish" : "Publish"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Site
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Site</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{site.name}&quot;? This action cannot
              be undone. All pages within this site will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
