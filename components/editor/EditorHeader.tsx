"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SaveIndicator, type SaveStatus } from "./SaveIndicator";
import { updatePage, publishPage, unpublishPage } from "@/app/actions/pages";
import type { Page } from "@/lib/drizzle/schema/pages";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  page: Page;
  siteId: string;
  saveStatus?: SaveStatus;
  onRetry?: () => void;
}

export function EditorHeader({
  page,
  siteId,
  saveStatus = "idle",
  onRetry,
}: EditorHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [isPending, startTransition] = useTransition();

  const handleTitleSubmit = (): void => {
    if (title.trim() && title !== page.title) {
      startTransition(async () => {
        await updatePage(page.id, { title: title.trim() });
      });
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setTitle(page.title);
      setIsEditing(false);
    }
  };

  const handlePublishToggle = (): void => {
    startTransition(async () => {
      if (page.status === "published") {
        await unpublishPage(page.id);
      } else {
        await publishPage(page.id);
      }
    });
  };

  return (
    <div className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/app/sites/${siteId}`}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="h-8 text-lg font-semibold max-w-sm"
              autoFocus
              disabled={isPending}
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={cn(
                "text-lg font-semibold truncate max-w-sm text-left",
                "hover:text-primary transition-colors",
                isPending && "opacity-50"
              )}
              disabled={isPending}
            >
              {page.title}
            </button>
          )}

          <Badge
            variant={page.status === "published" ? "default" : "secondary"}
            className="flex-shrink-0"
          >
            {page.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <SaveIndicator status={saveStatus} onRetry={onRetry} />

          <Button variant="outline" size="sm" asChild>
            <Link href={`/app/sites/${siteId}/pages/${page.id}/preview`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>

          <Button
            variant={page.status === "published" ? "outline" : "default"}
            size="sm"
            onClick={handlePublishToggle}
            disabled={isPending}
          >
            {page.status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
