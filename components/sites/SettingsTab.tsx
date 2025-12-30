"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, Globe, Search, Link2, Palette, LayoutTemplate, Construction, BookOpen, Mail } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { updateSiteSettings } from "@/app/actions/sites";
import type { Site, ColorMode, BrandPersonality } from "@/lib/drizzle/schema/sites";
import type { BlogCategory } from "@/lib/drizzle/schema/blog-categories";
import type { HeaderContent, FooterContent } from "@/lib/section-types";
import { HeaderEditor } from "@/components/editor/blocks/HeaderEditor";
import { FooterEditor } from "@/components/editor/blocks/FooterEditor";
import { sectionDefaults } from "@/lib/section-defaults";

interface SettingsTabProps {
  site: Site;
  categories?: BlogCategory[];
}

// Helper to compare objects for change detection
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function SettingsTab({ site, categories = [] }: SettingsTabProps) {
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(site.slug);
  const [customDomain, setCustomDomain] = useState(site.custom_domain || "");
  const [metaTitle, setMetaTitle] = useState(site.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(
    site.meta_description || ""
  );
  const [colorMode, setColorMode] = useState<ColorMode>(site.color_mode);
  const [brandPersonality, setBrandPersonality] = useState<BrandPersonality | null>(
    site.brand_personality as BrandPersonality | null
  );

  // Under construction mode
  const [underConstruction, setUnderConstruction] = useState(site.under_construction);
  const [constructionTitle, setConstructionTitle] = useState(site.construction_title || "");
  const [constructionDescription, setConstructionDescription] = useState(site.construction_description || "");

  // Blog settings
  const [showBlogAuthor, setShowBlogAuthor] = useState(site.show_blog_author);
  const [defaultBlogCategoryId, setDefaultBlogCategoryId] = useState<string | null>(
    site.default_blog_category_id ?? null
  );

  // Contact form settings
  const [contactNotificationEmail, setContactNotificationEmail] = useState(
    site.contact_notification_email || ""
  );

  // Site-level header/footer configuration
  const [headerContent, setHeaderContent] = useState<HeaderContent>(
    site.header_content ?? { ...sectionDefaults.header, siteName: site.name }
  );
  const [footerContent, setFooterContent] = useState<FooterContent>(
    site.footer_content ?? sectionDefaults.footer
  );

  // Track if any changes have been made
  const initialHeader = site.header_content ?? { ...sectionDefaults.header, siteName: site.name };
  const initialFooter = site.footer_content ?? sectionDefaults.footer;

  const hasChanges =
    slug !== site.slug ||
    customDomain !== (site.custom_domain || "") ||
    metaTitle !== (site.meta_title || "") ||
    metaDescription !== (site.meta_description || "") ||
    colorMode !== site.color_mode ||
    brandPersonality !== (site.brand_personality as BrandPersonality | null) ||
    underConstruction !== site.under_construction ||
    constructionTitle !== (site.construction_title || "") ||
    constructionDescription !== (site.construction_description || "") ||
    showBlogAuthor !== site.show_blog_author ||
    defaultBlogCategoryId !== (site.default_blog_category_id ?? null) ||
    contactNotificationEmail !== (site.contact_notification_email || "") ||
    !deepEqual(headerContent, initialHeader) ||
    !deepEqual(footerContent, initialFooter);

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
    setBrandPersonality(site.brand_personality as BrandPersonality | null);
    setUnderConstruction(site.under_construction);
    setConstructionTitle(site.construction_title || "");
    setConstructionDescription(site.construction_description || "");
    setShowBlogAuthor(site.show_blog_author);
    setDefaultBlogCategoryId(site.default_blog_category_id ?? null);
    setContactNotificationEmail(site.contact_notification_email || "");
    setHeaderContent(site.header_content ?? { ...sectionDefaults.header, siteName: site.name });
    setFooterContent(site.footer_content ?? sectionDefaults.footer);
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
      brandPersonality: brandPersonality !== (site.brand_personality as BrandPersonality | null) ? brandPersonality : undefined,
      underConstruction: underConstruction !== site.under_construction ? underConstruction : undefined,
      constructionTitle: constructionTitle !== (site.construction_title || "") ? constructionTitle || null : undefined,
      constructionDescription: constructionDescription !== (site.construction_description || "") ? constructionDescription || null : undefined,
      showBlogAuthor: showBlogAuthor !== site.show_blog_author ? showBlogAuthor : undefined,
      defaultBlogCategoryId: defaultBlogCategoryId !== (site.default_blog_category_id ?? null) ? defaultBlogCategoryId : undefined,
      contactNotificationEmail: contactNotificationEmail !== (site.contact_notification_email || "") ? contactNotificationEmail || null : undefined,
      headerContent: !deepEqual(headerContent, initialHeader) ? headerContent : undefined,
      footerContent: !deepEqual(footerContent, initialFooter) ? footerContent : undefined,
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

      {/* Under Construction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5" />
            Under Construction
          </CardTitle>
          <CardDescription>
            Show a &quot;Coming Soon&quot; page to visitors while you continue building
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="underConstruction">Enable Under Construction Mode</Label>
              <p className="text-sm text-muted-foreground">
                Public visitors will see a Coming Soon page. You can still view your site when logged in.
              </p>
            </div>
            <Switch
              id="underConstruction"
              checked={underConstruction}
              onCheckedChange={setUnderConstruction}
              disabled={loading}
            />
          </div>

          {underConstruction && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="constructionTitle">Coming Soon Title</Label>
                <Input
                  id="constructionTitle"
                  placeholder={site.name}
                  value={constructionTitle}
                  onChange={(e) => setConstructionTitle(e.target.value)}
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Defaults to your site name if empty
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="constructionDescription">Coming Soon Message</Label>
                <Textarea
                  id="constructionDescription"
                  placeholder="We're working on something exciting. Check back soon!"
                  value={constructionDescription}
                  onChange={(e) => setConstructionDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>
            </>
          )}
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

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="brandPersonality">Brand Personality</Label>
            <Select
              value={brandPersonality ?? "none"}
              onValueChange={(value) =>
                setBrandPersonality(value === "none" ? null : (value as BrandPersonality))
              }
              disabled={loading}
            >
              <SelectTrigger className="w-full max-w-xs" id="brandPersonality">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                <SelectItem value="professional">Professional / Enterprise</SelectItem>
                <SelectItem value="consumer">Consumer / Friendly</SelectItem>
                <SelectItem value="tech">Tech / AI</SelectItem>
                <SelectItem value="creative">Creative / Artistic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Used by the Logo Generator to create prompts that match your brand style.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Blog Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Blog Settings
          </CardTitle>
          <CardDescription>
            Configure how your blog posts are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showBlogAuthor">Show Author on Posts</Label>
              <p className="text-sm text-muted-foreground">
                Display the author name and date on published blog posts
              </p>
            </div>
            <Switch
              id="showBlogAuthor"
              checked={showBlogAuthor}
              onCheckedChange={setShowBlogAuthor}
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="defaultBlogCategory">Default Category</Label>
            <Select
              value={defaultBlogCategoryId ?? "none"}
              onValueChange={(value) => setDefaultBlogCategoryId(value === "none" ? null : value)}
              disabled={loading}
            >
              <SelectTrigger className="w-full max-w-xs" id="defaultBlogCategory">
                <SelectValue placeholder="Uncategorized" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              New blog posts will be assigned this category by default. You can create categories when editing a post.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Form Notifications
          </CardTitle>
          <CardDescription>
            Receive email notifications when visitors submit contact forms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactNotificationEmail">Notification Email</Label>
            <Input
              id="contactNotificationEmail"
              type="email"
              placeholder="you@example.com"
              value={contactNotificationEmail}
              onChange={(e) => setContactNotificationEmail(e.target.value)}
              disabled={loading}
              className="max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to disable email notifications. Submissions will still be saved.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Site Header & Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            Site Header & Footer
          </CardTitle>
          <CardDescription>
            Configure the header and footer that appear on all pages of your published site.
            These settings override individual page header/footer sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Header Configuration</Label>
            <div className="border rounded-lg p-4 bg-muted/30">
              <HeaderEditor
                content={headerContent}
                onChange={setHeaderContent}
                disabled={loading}
                siteId={site.id}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-semibold">Footer Configuration</Label>
            <div className="border rounded-lg p-4 bg-muted/30">
              <FooterEditor
                content={footerContent}
                onChange={setFooterContent}
                disabled={loading}
                siteId={site.id}
              />
            </div>
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
