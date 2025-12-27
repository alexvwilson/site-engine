"use client";

import { useState, useTransition } from "react";
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Home,
  Globe,
  GlobeLock,
  Trash2,
  Loader2,
} from "lucide-react";
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
import {
  deletePage,
  duplicatePage,
  publishPage,
  unpublishPage,
  setAsHomePage,
} from "@/app/actions/pages";
import type { Page } from "@/lib/drizzle/schema/pages";
import { toast } from "sonner";

interface PageActionsProps {
  page: Page;
  onEdit: () => void;
}

export function PageActions({ page, onEdit }: PageActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicatePage(page.id);
      if (result.success) {
        toast.success("Page duplicated");
      } else {
        toast.error(result.error || "Failed to duplicate page");
      }
    });
  };

  const handleSetAsHome = () => {
    startTransition(async () => {
      const result = await setAsHomePage(page.id);
      if (result.success) {
        toast.success("Page set as homepage");
      } else {
        toast.error(result.error || "Failed to set as homepage");
      }
    });
  };

  const handleTogglePublish = () => {
    startTransition(async () => {
      const action = page.status === "published" ? unpublishPage : publishPage;
      const result = await action(page.id);
      if (result.success) {
        toast.success(
          page.status === "published" ? "Page unpublished" : "Page published"
        );
      } else {
        toast.error(result.error || "Failed to update page status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePage(page.id);
      if (result.success) {
        toast.success("Page deleted");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Failed to delete page");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          {!page.is_home && (
            <DropdownMenuItem onClick={handleSetAsHome}>
              <Home className="h-4 w-4 mr-2" />
              Set as Homepage
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleTogglePublish}>
            {page.status === "published" ? (
              <>
                <GlobeLock className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{page.title}&quot;? This action
              cannot be undone.
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
