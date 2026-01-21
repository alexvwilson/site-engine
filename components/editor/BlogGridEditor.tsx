"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  StylingControls,
  CardBackgroundPanel,
} from "@/components/editor/StylingControls";
import type {
  BlogGridContent,
  BlogGridPageFilter,
} from "@/lib/section-types";
import { getPagesForSite } from "@/app/actions/pages";

interface PageOption {
  id: string;
  title: string;
  slug: string;
  is_home: boolean;
}

interface BlogGridEditorProps {
  content: BlogGridContent;
  onChange: (content: BlogGridContent) => void;
  siteId: string;
  currentPageId?: string;
  disabled?: boolean;
}

export function BlogGridEditor({
  content,
  onChange,
  siteId,
  currentPageId,
  disabled,
}: BlogGridEditorProps) {
  const [pages, setPages] = useState<PageOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pages for the dropdown
  useEffect(() => {
    async function fetchPages() {
      try {
        const result = await getPagesForSite(siteId);
        setPages(result);
      } catch (error) {
        console.error("Failed to fetch pages:", error);
      }
      setIsLoading(false);
    }
    fetchPages();
  }, [siteId]);

  // Get current page name for display
  const currentPageName = pages.find((p) => p.id === currentPageId)?.title;

  // Get display label for current filter value
  const getFilterLabel = (filter: BlogGridPageFilter | undefined): string => {
    if (!filter || filter === "all") return "All Pages";
    if (filter === "current")
      return currentPageName ? `This Page (${currentPageName})` : "This Page";
    if (filter === "unassigned") return "Unassigned Posts";
    const page = pages.find((p) => p.id === filter);
    return page?.title || "Unknown Page";
  };

  const updateField = <K extends keyof BlogGridContent>(
    field: K,
    value: BlogGridContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="section-title">Section Title (optional)</Label>
          <Input
            id="section-title"
            value={content.sectionTitle || ""}
            onChange={(e) => updateField("sectionTitle", e.target.value)}
            placeholder="Latest Posts"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="section-subtitle">Section Subtitle (optional)</Label>
          <Textarea
            id="section-subtitle"
            value={content.sectionSubtitle || ""}
            onChange={(e) => updateField("sectionSubtitle", e.target.value)}
            placeholder="Stay up to date with our latest articles and news"
            rows={2}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Page Filter */}
      <div className="space-y-2">
        <Label>Show Posts From</Label>
        <Select
          value={content.pageFilter ?? "all"}
          onValueChange={(value) =>
            onChange({ ...content, pageFilter: value as BlogGridPageFilter })
          }
          disabled={isLoading || disabled}
        >
          <SelectTrigger>
            <SelectValue>
              {isLoading
                ? "Loading pages..."
                : getFilterLabel(content.pageFilter)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages</SelectItem>
            <SelectItem value="current">
              This Page{currentPageName ? ` (${currentPageName})` : ""}
            </SelectItem>
            <SelectItem value="unassigned">Unassigned Posts</SelectItem>
            {pages.length > 0 && <Separator className="my-1" />}
            {pages.map((page) => (
              <SelectItem key={page.id} value={page.id}>
                {page.title}
                {page.is_home ? " (Home)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Filter posts by their page assignment. &quot;This Page&quot; shows
          posts assigned to the current page.
        </p>
      </div>

      {/* Number of Posts */}
      <div className="space-y-2">
        <Label>Number of Posts</Label>
        <Select
          value={String(content.postCount)}
          onValueChange={(value) =>
            onChange({ ...content, postCount: Number(value) as 3 | 6 | 9 })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Posts (1 row)</SelectItem>
            <SelectItem value="6">6 Posts (2 rows)</SelectItem>
            <SelectItem value="9">9 Posts (3 rows)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Posts are displayed in a responsive grid (3 columns on desktop, 2 on
          tablet, 1 on mobile)
        </p>
      </div>

      {/* Show Excerpts */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="show-excerpt">Show Excerpts</Label>
          <p className="text-xs text-muted-foreground">
            Display post excerpts below titles
          </p>
        </div>
        <Switch
          id="show-excerpt"
          checked={content.showExcerpt}
          onCheckedChange={(checked) =>
            onChange({ ...content, showExcerpt: checked })
          }
          disabled={disabled}
        />
      </div>

      {/* Show Author */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="show-author">Show Author</Label>
          <p className="text-xs text-muted-foreground">
            Display author name on post cards
          </p>
        </div>
        <Switch
          id="show-author"
          checked={content.showAuthor ?? true}
          onCheckedChange={(checked) =>
            onChange({ ...content, showAuthor: checked })
          }
          disabled={disabled}
        />
      </div>

      {/* Card Border Color */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Card Border Color</Label>
          <Select
            value={content.cardBorderMode ?? "default"}
            onValueChange={(value) =>
              updateField("cardBorderMode", value as "default" | "primary" | "custom")
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Blog Default</SelectItem>
              <SelectItem value="primary">Theme Primary</SelectItem>
              <SelectItem value="custom">Custom Color</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Border color for each post card
          </p>
        </div>

        {content.cardBorderMode === "custom" && (
          <div className="space-y-2">
            <Label>Custom Border Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={content.cardBorderColor || "#E5E7EB"}
                onChange={(e) =>
                  updateField("cardBorderColor", e.target.value)
                }
                disabled={disabled}
                className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-muted-foreground">
                {content.cardBorderColor || "#E5E7EB"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Styling Section */}
      <StylingControls
        content={content}
        onChange={onChange}
        disabled={disabled}
        siteId={siteId}
        textSizeDescription="Scales post titles and excerpts proportionally."
      >
        {/* Card Background Panel */}
        <CardBackgroundPanel
          title="Post Cards"
          showCardBackground={content.showCardBackground ?? true}
          cardBackgroundColor={content.cardBackgroundColor}
          onShowCardBackgroundChange={(checked) =>
            updateField("showCardBackground", checked)
          }
          onCardBackgroundColorChange={(color) =>
            updateField("cardBackgroundColor", color)
          }
          onCardBackgroundColorReset={() => updateField("cardBackgroundColor", "")}
          disabled={disabled}
          showDescription="Cards have solid backgrounds (text uses theme colors)"
          hideDescription="Cards are transparent (text adapts to section background)"
        />
      </StylingControls>
    </div>
  );
}
