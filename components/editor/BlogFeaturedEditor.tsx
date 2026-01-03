"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  BlogFeaturedContent,
  BlogFeaturedLayout,
} from "@/lib/section-types";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";
import {
  LayoutGrid,
  Rows3,
  Image as ImageIcon,
  AlignLeft,
} from "lucide-react";

interface BlogFeaturedEditorProps {
  content: BlogFeaturedContent;
  onChange: (content: BlogFeaturedContent) => void;
  siteId: string;
}

const LAYOUT_OPTIONS: {
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

export function BlogFeaturedEditor({
  content,
  onChange,
  siteId,
}: BlogFeaturedEditorProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Merge with defaults for backwards compatibility
  const settings: BlogFeaturedContent = {
    postId: content.postId ?? null,
    layout: content.layout ?? "split",
    showFullContent: content.showFullContent ?? false,
    contentLimit: content.contentLimit ?? 0,
    showReadMore: content.showReadMore ?? true,
    showCategory: content.showCategory ?? true,
    showAuthor: content.showAuthor ?? true,
    overlayColor: content.overlayColor ?? "#000000",
    overlayOpacity: content.overlayOpacity ?? 50,
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`/api/blog/${siteId}/posts?limit=50`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
      setIsLoading(false);
    }
    fetchPosts();
  }, [siteId]);

  function updateSettings(updates: Partial<BlogFeaturedContent>) {
    onChange({ ...settings, ...updates });
  }

  return (
    <div className="space-y-6">
      {/* Post Selector */}
      <div className="space-y-2">
        <Label>Select Post to Feature</Label>
        <Select
          value={settings.postId || "none"}
          onValueChange={(value) =>
            updateSettings({ postId: value === "none" ? null : value })
          }
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={isLoading ? "Loading posts..." : "Select a post"}
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
        {posts.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">
            No published posts yet. Create and publish a post in the Blog tab
            first.
          </p>
        )}
      </div>

      {/* Layout Selector */}
      <div className="space-y-2">
        <Label>Layout</Label>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_OPTIONS.map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => updateSettings({ layout: layout.value })}
              className={cn(
                "flex flex-col items-center gap-1 p-3 border rounded-lg transition-colors",
                "hover:border-primary/50 hover:bg-accent",
                settings.layout === layout.value &&
                  "border-primary bg-primary/5 ring-1 ring-primary"
              )}
            >
              <div
                className={cn(
                  "text-muted-foreground",
                  settings.layout === layout.value && "text-primary"
                )}
              >
                {layout.icon}
              </div>
              <span className="text-sm font-medium">{layout.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {LAYOUT_OPTIONS.find((l) => l.value === settings.layout)?.description}
        </p>
      </div>

      {/* Content Display Options */}
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
            checked={settings.showFullContent}
            onCheckedChange={(checked) =>
              updateSettings({ showFullContent: checked })
            }
          />
        </div>

        {settings.showFullContent && (
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            <Label htmlFor="contentLimit">Character Limit</Label>
            <Input
              id="contentLimit"
              type="number"
              min={0}
              step={100}
              value={settings.contentLimit}
              onChange={(e) =>
                updateSettings({
                  contentLimit: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0 = no limit"
            />
            <p className="text-xs text-muted-foreground">
              {settings.contentLimit === 0
                ? "No limit - shows full content"
                : `Truncates after ${settings.contentLimit} characters`}
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
            checked={settings.showReadMore}
            onCheckedChange={(checked) =>
              updateSettings({ showReadMore: checked })
            }
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
            checked={settings.showCategory}
            onCheckedChange={(checked) =>
              updateSettings({ showCategory: checked })
            }
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
            checked={settings.showAuthor}
            onCheckedChange={(checked) =>
              updateSettings({ showAuthor: checked })
            }
          />
        </div>
      </div>

      {/* Hero Overlay Settings */}
      {settings.layout === "hero" && (
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
                  value={settings.overlayColor}
                  onChange={(e) =>
                    updateSettings({ overlayColor: e.target.value })
                  }
                  className="w-12 h-10 p-1 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={settings.overlayColor}
                onChange={(e) =>
                  updateSettings({ overlayColor: e.target.value })
                }
                placeholder="#000000"
                className="flex-1 font-mono"
                maxLength={7}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="overlayOpacity">Overlay Opacity</Label>
              <span className="text-sm text-muted-foreground">
                {settings.overlayOpacity}%
              </span>
            </div>
            <Slider
              id="overlayOpacity"
              min={0}
              max={100}
              step={5}
              value={[settings.overlayOpacity]}
              onValueChange={([value]) =>
                updateSettings({ overlayOpacity: value })
              }
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Transparent</span>
              <span>Opaque</span>
            </div>
          </div>

          {/* Preview swatch */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="h-16 rounded-md border"
              style={{
                background: `linear-gradient(${settings.overlayColor}${Math.round(
                  (settings.overlayOpacity / 100) * 255
                )
                  .toString(16)
                  .padStart(2, "0")}, ${settings.overlayColor}${Math.round(
                  (settings.overlayOpacity / 100) * 255
                )
                  .toString(16)
                  .padStart(2, "0")}), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="10" height="10" fill="%23ccc"/><rect x="10" y="10" width="10" height="10" fill="%23ccc"/></svg>')`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
