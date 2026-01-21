"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  StylingControls,
  CardBackgroundPanel,
} from "@/components/editor/StylingControls";
import { cn } from "@/lib/utils";
import type {
  BlogContent,
  BlogMode,
  BlogFeaturedLayout,
  BlogGridLayout,
  BlogGridPageFilter,
  ImageFit,
} from "@/lib/section-types";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";
import type { EditorMode } from "../inspector/EditorModeToggle";
import { getPagesForSite } from "@/app/actions/pages";
import {
  LayoutGrid,
  Rows3,
  Image as ImageIcon,
  AlignLeft,
  Newspaper,
  Grid3X3,
  List,
  LayoutTemplate,
} from "lucide-react";

// =============================================================================
// Types & Constants
// =============================================================================

interface BlogEditorProps {
  content: BlogContent;
  onChange: (content: BlogContent) => void;
  siteId: string;
  currentPageId?: string;
  disabled?: boolean;
  editorMode?: EditorMode;
}

interface PageOption {
  id: string;
  title: string;
  slug: string;
  is_home: boolean;
}

const MODE_LABELS: Record<BlogMode, string> = {
  featured: "Featured Post",
  grid: "Post Grid",
};

const FEATURED_LAYOUT_OPTIONS: {
  value: BlogFeaturedLayout;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "split",
    label: "Split",
    icon: <LayoutGrid className="h-5 w-5" />,
    description: "Image and content side by side",
  },
  {
    value: "stacked",
    label: "Stacked",
    icon: <Rows3 className="h-5 w-5" />,
    description: "Image on top, content below",
  },
  {
    value: "hero",
    label: "Hero",
    icon: <ImageIcon className="h-5 w-5" />,
    description: "Full-width background image",
  },
  {
    value: "minimal",
    label: "Minimal",
    icon: <AlignLeft className="h-5 w-5" />,
    description: "Text only, no image",
  },
];

const GRID_LAYOUT_OPTIONS: {
  value: BlogGridLayout;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "grid",
    label: "Grid",
    icon: <Grid3X3 className="h-5 w-5" />,
    description: "Classic card grid layout",
  },
  {
    value: "list",
    label: "List",
    icon: <List className="h-5 w-5" />,
    description: "Full-width list with side images",
  },
  {
    value: "magazine",
    label: "Magazine",
    icon: <LayoutTemplate className="h-5 w-5" />,
    description: "Large featured + smaller grid",
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if switching modes would cause data loss
 */
function hasDataForMode(content: BlogContent, mode: BlogMode): boolean {
  switch (mode) {
    case "featured":
      return !!content.postId;
    case "grid":
      // Grid doesn't have specific data that would be lost
      return false;
    default:
      return false;
  }
}

// =============================================================================
// Main Component
// =============================================================================

export function BlogEditor({
  content,
  onChange,
  siteId,
  currentPageId,
  disabled,
  editorMode = "all",
}: BlogEditorProps): React.ReactElement {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  // Data loading state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingPages, setIsLoadingPages] = useState(true);

  // Mode switching state
  const [pendingMode, setPendingMode] = useState<BlogMode | null>(null);
  const [showModeWarning, setShowModeWarning] = useState(false);

  const currentMode: BlogMode = content.mode || "featured";

  // Fetch posts for featured mode
  useEffect(() => {
    async function fetchPosts(): Promise<void> {
      try {
        const response = await fetch(`/api/blog/${siteId}/posts?limit=50`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
      setIsLoadingPosts(false);
    }
    fetchPosts();
  }, [siteId]);

  // Fetch pages for grid mode filter
  useEffect(() => {
    async function fetchPages(): Promise<void> {
      try {
        const result = await getPagesForSite(siteId);
        setPages(result);
      } catch (error) {
        console.error("Failed to fetch pages:", error);
      }
      setIsLoadingPages(false);
    }
    fetchPages();
  }, [siteId]);

  // Mode switching logic
  const handleModeChange = (newMode: BlogMode): void => {
    if (newMode === currentMode) return;

    if (hasDataForMode(content, currentMode)) {
      setPendingMode(newMode);
      setShowModeWarning(true);
    } else {
      applyModeChange(newMode);
    }
  };

  const applyModeChange = (newMode: BlogMode): void => {
    // Keep styling settings, update mode
    onChange({
      ...content,
      mode: newMode,
      // Clear mode-specific selections when switching
      postId: newMode === "featured" ? content.postId : null,
    });
  };

  const confirmModeChange = (): void => {
    if (pendingMode) {
      applyModeChange(pendingMode);
      setPendingMode(null);
      setShowModeWarning(false);
    }
  };

  const cancelModeChange = (): void => {
    setPendingMode(null);
    setShowModeWarning(false);
  };

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

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      {showLayout && (
        <div className="space-y-2">
          <Label>Display Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(MODE_LABELS) as BlogMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeChange(mode)}
                disabled={disabled}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors",
                  "hover:border-primary/50 hover:bg-accent",
                  currentMode === mode &&
                    "border-primary bg-primary/5 ring-1 ring-primary",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {mode === "featured" ? (
                  <Newspaper className="h-5 w-5" />
                ) : (
                  <Grid3X3 className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">{MODE_LABELS[mode]}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentMode === "featured"
              ? "Showcase a single post with prominent display"
              : "Display multiple posts in a grid layout"}
          </p>
        </div>
      )}

      {/* Mode-specific controls */}
      {currentMode === "featured" ? (
        <FeaturedModeControls
          content={content}
          onChange={onChange}
          posts={posts}
          isLoadingPosts={isLoadingPosts}
          disabled={disabled}
          showContent={showContent}
          showLayout={showLayout}
          siteId={siteId}
        />
      ) : (
        <GridModeControls
          content={content}
          onChange={onChange}
          pages={pages}
          isLoadingPages={isLoadingPages}
          currentPageName={currentPageName}
          getFilterLabel={getFilterLabel}
          disabled={disabled}
          showContent={showContent}
          showLayout={showLayout}
          siteId={siteId}
        />
      )}

      {/* Mode switch warning dialog */}
      <AlertDialog open={showModeWarning} onOpenChange={setShowModeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Display Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching from {MODE_LABELS[currentMode]} to{" "}
              {pendingMode ? MODE_LABELS[pendingMode] : ""} may clear some
              settings specific to the current mode.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelModeChange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange}>
              Switch Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =============================================================================
// Featured Mode Controls
// =============================================================================

interface FeaturedModeControlsProps {
  content: BlogContent;
  onChange: (content: BlogContent) => void;
  posts: BlogPost[];
  isLoadingPosts: boolean;
  disabled?: boolean;
  showContent: boolean;
  showLayout: boolean;
  siteId: string;
}

function FeaturedModeControls({
  content,
  onChange,
  posts,
  isLoadingPosts,
  disabled,
  showContent,
  showLayout,
  siteId,
}: FeaturedModeControlsProps): React.ReactElement {
  const updateField = <K extends keyof BlogContent>(
    field: K,
    value: BlogContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  const featuredLayout = content.featuredLayout || "split";

  return (
    <>
      {/* Post Selector */}
      {showContent && (
        <div className="space-y-2">
          <Label>Select Post to Feature</Label>
          <Select
            value={content.postId || "none"}
            onValueChange={(value) =>
              updateField("postId", value === "none" ? null : value)
            }
            disabled={isLoadingPosts || disabled}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={isLoadingPosts ? "Loading posts..." : "Select a post"}
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
          {posts.length === 0 && !isLoadingPosts && (
            <p className="text-sm text-muted-foreground">
              No published posts yet. Create and publish a post in the Blog tab
              first.
            </p>
          )}
        </div>
      )}

      {/* Layout Selector */}
      {showLayout && (
        <div className="space-y-2">
          <Label>Layout</Label>
          <div className="grid grid-cols-2 gap-2">
            {FEATURED_LAYOUT_OPTIONS.map((layout) => (
              <button
                key={layout.value}
                type="button"
                onClick={() => updateField("featuredLayout", layout.value)}
                disabled={disabled}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 border rounded-lg transition-colors",
                  "hover:border-primary/50 hover:bg-accent",
                  featuredLayout === layout.value &&
                    "border-primary bg-primary/5 ring-1 ring-primary",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "text-muted-foreground",
                    featuredLayout === layout.value && "text-primary"
                  )}
                >
                  {layout.icon}
                </div>
                <span className="text-sm font-medium">{layout.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {FEATURED_LAYOUT_OPTIONS.find((l) => l.value === featuredLayout)
              ?.description}
          </p>
        </div>
      )}

      {/* Image Fit - only for layouts that show images */}
      {showLayout &&
        featuredLayout !== "minimal" &&
        featuredLayout !== "hero" && (
          <div className="space-y-2">
            <Label>Image Display</Label>
            <Select
              value={content.imageFit || "cover"}
              onValueChange={(value) =>
                updateField("imageFit", value as ImageFit)
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover (crops to fill)</SelectItem>
                <SelectItem value="contain">
                  Contain (shows full image)
                </SelectItem>
                <SelectItem value="fill">Fill (stretches to fit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

      {/* Content Display Options */}
      {showContent && (
        <div className="space-y-4">
          <Label className="text-base font-medium">Content Display</Label>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showFullContent" className="cursor-pointer">
                Show Full Content
              </Label>
              <p className="text-xs text-muted-foreground">
                Display post content instead of excerpt
              </p>
            </div>
            <Switch
              id="showFullContent"
              checked={content.showFullContent || false}
              onCheckedChange={(checked) =>
                updateField("showFullContent", checked)
              }
              disabled={disabled}
            />
          </div>

          {content.showFullContent && (
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <Label htmlFor="contentLimit">Character Limit</Label>
              <Input
                id="contentLimit"
                type="number"
                min={0}
                step={100}
                value={content.contentLimit || 0}
                onChange={(e) =>
                  updateField("contentLimit", parseInt(e.target.value) || 0)
                }
                placeholder="0 = no limit"
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                {(content.contentLimit || 0) === 0
                  ? "No limit - shows full content"
                  : `Truncates after ${content.contentLimit} characters`}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showReadMore" className="cursor-pointer">
                Show &quot;Read More&quot; Link
              </Label>
              <p className="text-xs text-muted-foreground">
                Link to full post page
              </p>
            </div>
            <Switch
              id="showReadMore"
              checked={content.showReadMore ?? true}
              onCheckedChange={(checked) => updateField("showReadMore", checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showCategory" className="cursor-pointer">
                Show Category Badge
              </Label>
              <p className="text-xs text-muted-foreground">
                Display category if assigned
              </p>
            </div>
            <Switch
              id="showCategory"
              checked={content.showCategory ?? true}
              onCheckedChange={(checked) => updateField("showCategory", checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showAuthor" className="cursor-pointer">
                Show Author
              </Label>
              <p className="text-xs text-muted-foreground">
                Display author name and date
              </p>
            </div>
            <Switch
              id="showAuthor"
              checked={content.showAuthor ?? true}
              onCheckedChange={(checked) => updateField("showAuthor", checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showDate" className="cursor-pointer">
                Show Date
              </Label>
              <p className="text-xs text-muted-foreground">
                Display publish date
              </p>
            </div>
            <Switch
              id="showDate"
              checked={content.showDate ?? true}
              onCheckedChange={(checked) => updateField("showDate", checked)}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* Hero Overlay Settings */}
      {showLayout && featuredLayout === "hero" && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <Label className="text-base font-medium">Hero Overlay</Label>
          <p className="text-xs text-muted-foreground -mt-2">
            Customize the overlay on the background image
          </p>

          <div className="space-y-2">
            <Label htmlFor="overlayColor">Overlay Color</Label>
            <div className="flex gap-2">
              <div className="relative">
                <Input
                  id="overlayColor"
                  type="color"
                  value={content.overlayColor || "#000000"}
                  onChange={(e) => updateField("overlayColor", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                  disabled={disabled}
                />
              </div>
              <Input
                type="text"
                value={content.overlayColor || "#000000"}
                onChange={(e) => updateField("overlayColor", e.target.value)}
                placeholder="#000000"
                className="flex-1 font-mono"
                maxLength={7}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="overlayOpacity">Overlay Opacity</Label>
              <span className="text-sm text-muted-foreground">
                {content.overlayOpacity ?? 0}%
              </span>
            </div>
            <Slider
              id="overlayOpacity"
              min={0}
              max={100}
              step={5}
              value={[content.overlayOpacity ?? 0]}
              onValueChange={([value]) => updateField("overlayOpacity", value)}
              className="py-2"
              disabled={disabled}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Transparent</span>
              <span>Opaque</span>
            </div>
          </div>
        </div>
      )}

      {/* Styling Controls */}
      {showLayout && (
        <StylingControls
          content={content}
          onChange={onChange}
          disabled={disabled}
          siteId={siteId}
          textSizeDescription="Scales post title and excerpt proportionally."
        />
      )}
    </>
  );
}

// =============================================================================
// Grid Mode Controls
// =============================================================================

interface GridModeControlsProps {
  content: BlogContent;
  onChange: (content: BlogContent) => void;
  pages: PageOption[];
  isLoadingPages: boolean;
  currentPageName?: string;
  getFilterLabel: (filter: BlogGridPageFilter | undefined) => string;
  disabled?: boolean;
  showContent: boolean;
  showLayout: boolean;
  siteId: string;
}

function GridModeControls({
  content,
  onChange,
  pages,
  isLoadingPages,
  currentPageName,
  getFilterLabel,
  disabled,
  showContent,
  showLayout,
  siteId,
}: GridModeControlsProps): React.ReactElement {
  const updateField = <K extends keyof BlogContent>(
    field: K,
    value: BlogContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  const gridLayout = content.gridLayout || "grid";

  return (
    <>
      {/* Section Header */}
      {showContent && (
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
            <Label htmlFor="section-subtitle">
              Section Subtitle (optional)
            </Label>
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
      )}

      {/* Layout Selector */}
      {showLayout && (
        <div className="space-y-2">
          <Label>Layout</Label>
          <div className="grid grid-cols-3 gap-2">
            {GRID_LAYOUT_OPTIONS.map((layout) => (
              <button
                key={layout.value}
                type="button"
                onClick={() => updateField("gridLayout", layout.value)}
                disabled={disabled}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 border rounded-lg transition-colors",
                  "hover:border-primary/50 hover:bg-accent",
                  gridLayout === layout.value &&
                    "border-primary bg-primary/5 ring-1 ring-primary",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "text-muted-foreground",
                    gridLayout === layout.value && "text-primary"
                  )}
                >
                  {layout.icon}
                </div>
                <span className="text-sm font-medium">{layout.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {GRID_LAYOUT_OPTIONS.find((l) => l.value === gridLayout)
              ?.description}
          </p>
        </div>
      )}

      {/* Page Filter */}
      {showContent && (
        <div className="space-y-2">
          <Label>Show Posts From</Label>
          <Select
            value={content.pageFilter ?? "all"}
            onValueChange={(value) =>
              updateField("pageFilter", value as BlogGridPageFilter)
            }
            disabled={isLoadingPages || disabled}
          >
            <SelectTrigger>
              <SelectValue>
                {isLoadingPages
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
      )}

      {/* Number of Posts */}
      {showLayout && (
        <div className="space-y-2">
          <Label>Number of Posts</Label>
          <Select
            value={String(content.postCount || 6)}
            onValueChange={(value) =>
              updateField("postCount", Number(value) as 3 | 6 | 9)
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Posts</SelectItem>
              <SelectItem value="6">6 Posts</SelectItem>
              <SelectItem value="9">9 Posts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Columns - only for grid layout */}
      {showLayout && gridLayout === "grid" && (
        <div className="space-y-2">
          <Label>Columns</Label>
          <Select
            value={String(content.columns || 3)}
            onValueChange={(value) =>
              updateField("columns", Number(value) as 2 | 3 | 4)
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Responsive: adjusts on smaller screens
          </p>
        </div>
      )}

      {/* Display Options */}
      {showContent && (
        <div className="space-y-4">
          <Label className="text-base font-medium">Display Options</Label>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-excerpt">Show Excerpts</Label>
              <p className="text-xs text-muted-foreground">
                Display post excerpts below titles
              </p>
            </div>
            <Switch
              id="show-excerpt"
              checked={content.showExcerpt ?? true}
              onCheckedChange={(checked) => updateField("showExcerpt", checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-category-grid">Show Category</Label>
              <p className="text-xs text-muted-foreground">
                Display category badges on cards
              </p>
            </div>
            <Switch
              id="show-category-grid"
              checked={content.showCategory ?? true}
              onCheckedChange={(checked) => updateField("showCategory", checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-author-grid">Show Author</Label>
              <p className="text-xs text-muted-foreground">
                Display author name on post cards
              </p>
            </div>
            <Switch
              id="show-author-grid"
              checked={content.showAuthor ?? true}
              onCheckedChange={(checked) => updateField("showAuthor", checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-date-grid">Show Date</Label>
              <p className="text-xs text-muted-foreground">
                Display publish date on post cards
              </p>
            </div>
            <Switch
              id="show-date-grid"
              checked={content.showDate ?? true}
              onCheckedChange={(checked) => updateField("showDate", checked)}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* Image Fit */}
      {showLayout && (
        <div className="space-y-2">
          <Label>Image Display</Label>
          <Select
            value={content.imageFit || "cover"}
            onValueChange={(value) => updateField("imageFit", value as ImageFit)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover (crops to fill)</SelectItem>
              <SelectItem value="contain">Contain (shows full image)</SelectItem>
              <SelectItem value="fill">Fill (stretches to fit)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Card Border Color */}
      {showLayout && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Card Border Color</Label>
            <Select
              value={content.cardBorderMode ?? "default"}
              onValueChange={(value) =>
                updateField(
                  "cardBorderMode",
                  value as "default" | "primary" | "custom"
                )
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
      )}

      {/* Styling Controls */}
      {showLayout && (
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
            onCardBackgroundColorReset={() =>
              updateField("cardBackgroundColor", "")
            }
            disabled={disabled}
            showDescription="Cards have solid backgrounds (text uses theme colors)"
            hideDescription="Cards are transparent (text adapts to section background)"
          />
        </StylingControls>
      )}
    </>
  );
}
