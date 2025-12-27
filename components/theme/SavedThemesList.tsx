"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Copy, MoreHorizontal, Trash2, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { activateTheme, deleteTheme, duplicateTheme } from "@/app/actions/theme";
import { toast } from "sonner";
import type { Theme } from "@/lib/drizzle/schema/themes";

interface SavedThemesListProps {
  themes: Theme[];
  onThemeSelect?: (theme: Theme) => void;
}

export function SavedThemesList({ themes, onThemeSelect }: SavedThemesListProps) {
  const [deletingThemeId, setDeletingThemeId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  const handleActivate = async (themeId: string) => {
    setIsActivating(themeId);
    const result = await activateTheme(themeId);
    setIsActivating(null);

    if (result.success) {
      toast.success("Theme activated");
    } else {
      toast.error(result.error || "Failed to activate theme");
    }
  };

  const handleDelete = async () => {
    if (!deletingThemeId) return;

    setIsDeleting(true);
    const result = await deleteTheme(deletingThemeId);
    setIsDeleting(false);
    setDeletingThemeId(null);

    if (result.success) {
      toast.success("Theme deleted");
    } else {
      toast.error(result.error || "Failed to delete theme");
    }
  };

  const handleDuplicate = async (themeId: string) => {
    setIsDuplicating(themeId);
    const result = await duplicateTheme(themeId);
    setIsDuplicating(null);

    if (result.success) {
      toast.success("Theme duplicated");
    } else {
      toast.error(result.error || "Failed to duplicate theme");
    }
  };

  if (themes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            No themes yet. Generate your first theme above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onSelect={() => onThemeSelect?.(theme)}
            onActivate={() => handleActivate(theme.id)}
            onDelete={() => setDeletingThemeId(theme.id)}
            onDuplicate={() => handleDuplicate(theme.id)}
            isActivating={isActivating === theme.id}
            isDuplicating={isDuplicating === theme.id}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingThemeId}
        onOpenChange={() => setDeletingThemeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this theme? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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

interface ThemeCardProps {
  theme: Theme;
  onSelect: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isActivating: boolean;
  isDuplicating: boolean;
}

function ThemeCard({
  theme,
  onSelect,
  onActivate,
  onDelete,
  onDuplicate,
  isActivating,
  isDuplicating,
}: ThemeCardProps) {
  const colors = theme.data.colors;

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{theme.name}</CardTitle>
              {theme.is_active && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              Created {formatDistanceToNow(new Date(theme.created_at), { addSuffix: true })}
              {theme.generation_job_id && " via AI"}
            </CardDescription>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!theme.is_active && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivate();
                  }}
                  disabled={isActivating}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isActivating ? "Activating..." : "Set as Active"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                disabled={isDuplicating}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isDuplicating ? "Duplicating..." : "Duplicate"}
              </DropdownMenuItem>
              {!theme.is_active && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Color Preview */}
        <div className="flex gap-1">
          {[
            colors.primary,
            colors.secondary,
            colors.accent,
            colors.background,
            colors.foreground,
          ].map((color, index) => (
            <div
              key={index}
              className="h-6 flex-1 first:rounded-l-md last:rounded-r-md"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
