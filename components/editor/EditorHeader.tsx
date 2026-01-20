"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SaveIndicator, type SaveStatus } from "./SaveIndicator";
import { ViewModeToggle, type ViewMode } from "./ViewModeToggle";
import { DeviceToggle, type DeviceType } from "@/components/preview/DeviceToggle";
import {
  ColorModePreviewToggle,
  type PreviewColorMode,
} from "@/components/preview/ColorModePreviewToggle";
import { updatePage, publishPage, unpublishPage } from "@/app/actions/pages";
import type { Page } from "@/lib/drizzle/schema/pages";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  page: Page;
  siteId: string;
  saveStatus?: SaveStatus;
  onRetry?: () => void;
  // Split view props (optional - when not provided, falls back to Preview link)
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  device?: DeviceType;
  onDeviceChange?: (device: DeviceType) => void;
  colorMode?: PreviewColorMode;
  onColorModeChange?: (mode: PreviewColorMode) => void;
  showPreviewControls?: boolean;
  disableSplit?: boolean;
}

export function EditorHeader({
  page,
  siteId,
  saveStatus = "idle",
  onRetry,
  viewMode = "builder",
  onViewModeChange,
  device = "desktop",
  onDeviceChange,
  colorMode = "light",
  onColorModeChange,
  showPreviewControls = false,
  disableSplit = false,
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

  const handleTitleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
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

          {/* View Mode Toggle (when EditorLayout provides the callback) */}
          {onViewModeChange ? (
            <ViewModeToggle
              value={viewMode}
              onChange={onViewModeChange}
              disableSplit={disableSplit}
            />
          ) : (
            // Fallback: Preview link for standalone usage
            <Button variant="outline" size="sm" asChild>
              <Link href={`/app/sites/${siteId}/pages/${page.id}/preview`}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </Button>
          )}

          {/* Device and Color Mode (shown when preview is visible) */}
          {showPreviewControls && onDeviceChange && onColorModeChange && (
            <>
              <div className="h-6 w-px bg-border" />
              <DeviceToggle device={device} onChange={onDeviceChange} />
              <ColorModePreviewToggle
                colorMode={colorMode}
                onChange={onColorModeChange}
              />
            </>
          )}

          <div className="h-6 w-px bg-border" />

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
