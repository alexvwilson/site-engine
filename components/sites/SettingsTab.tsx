"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, Globe, Search, Link2, Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { updateSiteSettings } from "@/app/actions/sites";
import type { Site, ColorMode } from "@/lib/drizzle/schema/sites";

interface SettingsTabProps {
  site: Site;
}

export function SettingsTab({ site }: SettingsTabProps) {
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(site.slug);
  const [customDomain, setCustomDomain] = useState(site.custom_domain || "");
  const [metaTitle, setMetaTitle] = useState(site.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(
    site.meta_description || ""
  );
  const [colorMode, setColorMode] = useState<ColorMode>(site.color_mode);

  // Track if any changes have been made
  const hasChanges =
    slug !== site.slug ||
    customDomain !== (site.custom_domain || "") ||
    metaTitle !== (site.meta_title || "") ||
    metaDescription !== (site.meta_description || "") ||
    colorMode !== site.color_mode;

  // Validate slug format
  const slugError =
    slug && !/^[a-z0-9-]+$/.test(slug)
      ? "Only lowercase letters, numbers, and hyphens allowed"
      : slug.length === 0
        ? "Slug cannot be empty"
        : null;

  // Reset form when site changes
  useEffect(() => {
    setSlug(site.slug);
    setCustomDomain(site.custom_domain || "");
    setMetaTitle(site.meta_title || "");
    setMetaDescription(site.meta_description || "");
    setColorMode(site.color_mode);
  }, [site]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (slugError) {
      toast.error(slugError);
      return;
    }

    setLoading(true);
    const result = await updateSiteSettings(site.id, {
      slug: slug !== site.slug ? slug : undefined,
      customDomain:
        customDomain !== (site.custom_domain || "")
          ? customDomain || null
          : undefined,
      metaTitle:
        metaTitle !== (site.meta_title || "") ? metaTitle || null : undefined,
      metaDescription:
        metaDescription !== (site.meta_description || "")
          ? metaDescription || null
          : undefined,
      colorMode: colorMode !== site.color_mode ? colorMode : undefined,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Settings saved successfully");
    } else {
      toast.error(result.error || "Failed to save settings");
    }
  };

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sites/${slug}`
      : `/sites/${slug}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            URL Settings
          </CardTitle>
          <CardDescription>
            Configure how visitors access your published site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Site Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/sites/</span>
              <Input
                id="slug"
                placeholder="my-site"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                disabled={loading}
                className="max-w-xs"
              />
            </div>
            {slugError && (
              <p className="text-sm text-destructive">{slugError}</p>
            )}
            <p className="text-sm text-muted-foreground">
              This is the URL path where your site will be accessible
            </p>
          </div>

          {site.status === "published" && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm">Your site is live at:</span>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                {publicUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="customDomain">
              Custom Domain{" "}
              <span className="text-muted-foreground">(Coming Soon)</span>
            </Label>
            <Input
              id="customDomain"
              placeholder="www.example.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              disabled={true}
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Connect your own domain to this site. This feature will be
              available soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Settings
          </CardTitle>
          <CardDescription>
            Optimize how your site appears in search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              placeholder={site.name}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={loading}
              maxLength={60}
            />
            <p className="text-sm text-muted-foreground">
              The title that appears in search results and browser tabs (max 60
              characters). Defaults to your site name if empty.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              placeholder="A brief description of your site..."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={160}
            />
            <p className="text-sm text-muted-foreground">
              A brief summary shown in search results (max 160 characters).
              Defaults to your site description if empty.
            </p>
          </div>

          {/* SEO Preview */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-1">
            <p className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
              {metaTitle || site.name}
            </p>
            <p className="text-xs text-green-700">{publicUrl}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {metaDescription || site.description || "No description set"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Control how your site looks for visitors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="colorMode">Color Mode</Label>
            <Select
              value={colorMode}
              onValueChange={(value) => setColorMode(value as ColorMode)}
              disabled={loading}
            >
              <SelectTrigger className="w-full max-w-xs" id="colorMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Always Light</SelectItem>
                <SelectItem value="dark">Always Dark</SelectItem>
                <SelectItem value="system">Follow System Preference</SelectItem>
                <SelectItem value="user_choice">Let Visitors Choose</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {colorMode === "light" && "Your site will always display in light mode."}
              {colorMode === "dark" && "Your site will always display in dark mode."}
              {colorMode === "system" && "Your site will follow the visitor's system preference (light or dark)."}
              {colorMode === "user_choice" && "Visitors can toggle between light and dark mode with a button on your site."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !hasChanges || !!slugError}
          className="min-w-[120px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
