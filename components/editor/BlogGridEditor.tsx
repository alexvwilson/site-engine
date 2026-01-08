"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Palette } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type {
  BlogGridContent,
  BlogGridPageFilter,
  TextBorderWidth,
  TextBorderRadius,
  TextSize,
  TextColorMode,
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
  const [stylingOpen, setStylingOpen] = useState(false);
  const [themePrimaryColor, setThemePrimaryColor] = useState("#3B82F6");

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

  // Get theme primary color for styling defaults
  useEffect(() => {
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root)
      .getPropertyValue("--color-primary")
      .trim();
    if (primaryColor) {
      setThemePrimaryColor(primaryColor);
    }
  }, []);

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Collapsible
            open={stylingOpen}
            onOpenChange={setStylingOpen}
            className="flex-1"
          >
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Palette className="h-4 w-4" />
              Styling
              <ChevronDown
                className={`h-4 w-4 transition-transform ${stylingOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
          </Collapsible>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="enable-styling"
              className="text-sm text-muted-foreground"
            >
              {content.enableStyling ?? false ? "On" : "Off"}
            </Label>
            <Switch
              id="enable-styling"
              checked={content.enableStyling ?? false}
              onCheckedChange={(checked) => {
                updateField("enableStyling", checked);
                if (checked && !stylingOpen) {
                  setStylingOpen(true);
                }
              }}
              disabled={disabled}
            />
          </div>
        </div>

        <Collapsible open={stylingOpen} onOpenChange={setStylingOpen}>
          <CollapsibleContent className="space-y-6">
            {/* Border Controls */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Border
              </Label>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-border">Show Border</Label>
                <Switch
                  id="show-border"
                  checked={content.showBorder ?? false}
                  onCheckedChange={(checked) =>
                    updateField("showBorder", checked)
                  }
                  disabled={disabled}
                />
              </div>

              {content.showBorder && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Width</Label>
                      <Select
                        value={content.borderWidth ?? "medium"}
                        onValueChange={(v) =>
                          updateField("borderWidth", v as TextBorderWidth)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="thin">Thin (1px)</SelectItem>
                          <SelectItem value="medium">Medium (2px)</SelectItem>
                          <SelectItem value="thick">Thick (4px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Corners</Label>
                      <Select
                        value={content.borderRadius ?? "medium"}
                        onValueChange={(v) =>
                          updateField("borderRadius", v as TextBorderRadius)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Square</SelectItem>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="full">Pill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Border Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={content.borderColor || themePrimaryColor}
                        onChange={(e) =>
                          updateField("borderColor", e.target.value)
                        }
                        disabled={disabled}
                        className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground">
                        {content.borderColor || "Using theme primary"}
                      </span>
                      {content.borderColor && (
                        <button
                          type="button"
                          onClick={() => updateField("borderColor", "")}
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                          disabled={disabled}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Box Background</Label>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="use-theme-bg" className="font-normal">
                        Use Theme Background
                      </Label>
                      <Switch
                        id="use-theme-bg"
                        checked={content.useThemeBackground ?? true}
                        onCheckedChange={(checked) => {
                          updateField("useThemeBackground", checked);
                          if (checked) {
                            updateField("boxBackgroundColor", "");
                          }
                        }}
                        disabled={disabled}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {content.useThemeBackground ?? true
                        ? "Automatically adapts to light/dark mode"
                        : "Use a custom fixed color"}
                    </p>

                    {!(content.useThemeBackground ?? true) && (
                      <div className="space-y-2">
                        <Label>Custom Color</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={content.boxBackgroundColor || "#FFFFFF"}
                            onChange={(e) =>
                              updateField("boxBackgroundColor", e.target.value)
                            }
                            disabled={disabled}
                            className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                          />
                          <span className="text-sm text-muted-foreground">
                            {content.boxBackgroundColor || "#FFFFFF"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Background Opacity</Label>
                        <span className="text-sm text-muted-foreground">
                          {content.boxBackgroundOpacity ?? 100}%
                        </span>
                      </div>
                      <Slider
                        value={[content.boxBackgroundOpacity ?? 100]}
                        onValueChange={([v]) =>
                          updateField("boxBackgroundOpacity", v)
                        }
                        min={0}
                        max={100}
                        step={5}
                        disabled={
                          disabled || (content.useThemeBackground ?? true)
                        }
                      />
                      {(content.useThemeBackground ?? true) && (
                        <p className="text-xs text-muted-foreground">
                          Opacity requires a custom color (theme backgrounds
                          don&apos;t support transparency)
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Background & Overlay Controls */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Background
              </Label>

              <div className="space-y-2">
                <Label>Background Image</Label>
                <ImageUpload
                  value={content.backgroundImage || ""}
                  onChange={(url) => updateField("backgroundImage", url)}
                  siteId={siteId}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Overlay Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={content.overlayColor || "#000000"}
                    onChange={(e) =>
                      updateField("overlayColor", e.target.value)
                    }
                    disabled={disabled}
                    className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-sm text-muted-foreground">
                    {content.overlayColor || "#000000"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Overlay Opacity</Label>
                  <span className="text-sm text-muted-foreground">
                    {content.overlayOpacity ?? 0}%
                  </span>
                </div>
                <Slider
                  value={[content.overlayOpacity ?? 0]}
                  onValueChange={([v]) => updateField("overlayOpacity", v)}
                  min={0}
                  max={100}
                  step={5}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  {content.backgroundImage
                    ? "Overlay tints the background image"
                    : "Acts as a solid background color when no image is set"}
                </p>
              </div>
            </div>

            {/* Card Background Controls */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Post Cards
              </Label>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-card-bg">Show Card Background</Label>
                <Switch
                  id="show-card-bg"
                  checked={content.showCardBackground ?? true}
                  onCheckedChange={(checked) =>
                    updateField("showCardBackground", checked)
                  }
                  disabled={disabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {content.showCardBackground ?? true
                  ? "Cards have solid backgrounds (text uses theme colors)"
                  : "Cards are transparent (text adapts to section background)"}
              </p>

              {(content.showCardBackground ?? true) && (
                <div className="space-y-2">
                  <Label>Card Background Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={content.cardBackgroundColor || "#FFFFFF"}
                      onChange={(e) =>
                        updateField("cardBackgroundColor", e.target.value)
                      }
                      disabled={disabled}
                      className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-sm text-muted-foreground">
                      {content.cardBackgroundColor || "Using theme card style"}
                    </span>
                    {content.cardBackgroundColor && (
                      <button
                        type="button"
                        onClick={() => updateField("cardBackgroundColor", "")}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                        disabled={disabled}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Typography Controls */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Typography
              </Label>

              <div className="space-y-2">
                <Label>Text Size</Label>
                <Select
                  value={content.textSize ?? "normal"}
                  onValueChange={(v) => updateField("textSize", v as TextSize)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Scales post titles and excerpts proportionally.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Text Color</Label>
                <Select
                  value={content.textColorMode ?? "auto"}
                  onValueChange={(v) =>
                    updateField("textColorMode", v as TextColorMode)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Auto (detect from background)
                    </SelectItem>
                    <SelectItem value="light">Light (white text)</SelectItem>
                    <SelectItem value="dark">Dark (black text)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Auto uses light text when a background image is set.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
