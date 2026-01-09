"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Loader2, Globe, Search, Link2, Palette, LayoutTemplate, Construction, BookOpen, Mail, CheckCircle, Clock, Shield, Trash2, RefreshCw, Image as ImageIcon, Share2, FileText } from "lucide-react";
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
import {
  addCustomDomain,
  retryDomainVerification,
  removeCustomDomain,
  checkDomainFeatureAvailable,
} from "@/app/actions/domains";
import type { Site, ColorMode, BrandPersonality, BlogImageFit } from "@/lib/drizzle/schema/sites";
import { Badge } from "@/components/ui/badge";
import { DnsInstructionsCard } from "@/components/sites/DnsInstructionsCard";
import { formatDnsInstructions, type DnsInstruction } from "@/lib/domain-utils";
import type { BlogCategory } from "@/lib/drizzle/schema/blog-categories";
import type { Theme } from "@/lib/drizzle/schema/themes";
import type { HeaderContent, FooterContent, SocialLink, SocialIconStyle } from "@/lib/section-types";
import { HeaderEditor } from "@/components/editor/blocks/HeaderEditor";
import { FooterEditor } from "@/components/editor/blocks/FooterEditor";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { DocumentUpload } from "@/components/editor/DocumentUpload";
import { ImageLibraryModal } from "@/components/sites/ImageLibraryModal";
import { AlbumManager } from "@/components/sites/AlbumManager";
import { LegalPagesCard } from "@/components/sites/LegalPagesCard";
import { SeoScorecard } from "@/components/sites/SeoScorecard";
import { SocialLinksManager } from "@/components/sites/SocialLinksManager";
import { sectionDefaults } from "@/lib/section-defaults";

interface SettingsTabProps {
  site: Site;
  categories?: BlogCategory[];
  activeTheme: Theme | null;
}

// Helper to compare objects for change detection
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Default theme primary color used as fallback
const DEFAULT_PRIMARY_COLOR = "#2563eb";

export function SettingsTab({ site, categories = [], activeTheme }: SettingsTabProps) {
  // Extract primary color from active theme, falling back to default
  const themePrimaryColor = activeTheme?.data?.colors?.primary ?? DEFAULT_PRIMARY_COLOR;
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(site.slug);
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
  const [blogImageFit, setBlogImageFit] = useState<BlogImageFit>(
    (site.blog_image_fit as BlogImageFit) ?? "cover"
  );
  const [defaultBlogCategoryId, setDefaultBlogCategoryId] = useState<string | null>(
    site.default_blog_category_id ?? null
  );
  const [blogMetaTitle, setBlogMetaTitle] = useState(site.blog_meta_title || "");
  const [blogMetaDescription, setBlogMetaDescription] = useState(
    site.blog_meta_description || ""
  );
  const [blogTitle, setBlogTitle] = useState(site.blog_title || "");

  // Contact form settings
  const [contactNotificationEmail, setContactNotificationEmail] = useState(
    site.contact_notification_email || ""
  );

  // Favicon and branding
  const [faviconUrl, setFaviconUrl] = useState(site.favicon_url || "");
  const [useSeparateFavicon, setUseSeparateFavicon] = useState(site.use_separate_favicon);

  // Social sharing / OG image
  const [ogImageUrl, setOgImageUrl] = useState(site.og_image_url || "");

  // Site-level header/footer configuration
  const [headerContent, setHeaderContent] = useState<HeaderContent>(
    site.header_content ?? { ...sectionDefaults.header, siteName: site.name }
  );
  const [footerContent, setFooterContent] = useState<FooterContent>(
    site.footer_content ?? sectionDefaults.footer
  );

  // Social links configuration
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    (site.social_links as SocialLink[]) ?? []
  );
  const [socialIconStyle, setSocialIconStyle] = useState<SocialIconStyle>(
    (site.social_icon_style as SocialIconStyle) ?? "brand"
  );

  // Custom domain management (separate from main form)
  const [domainInput, setDomainInput] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainFeatureAvailable, setDomainFeatureAvailable] = useState(false);
  const [dnsInstructions, setDnsInstructions] = useState<DnsInstruction[]>([]);

  // Check if domain features are available on mount
  useEffect(() => {
    checkDomainFeatureAvailable().then(setDomainFeatureAvailable);
  }, []);

  // Generate DNS instructions from site data
  useEffect(() => {
    if (
      site.custom_domain &&
      site.domain_verification_status === "pending" &&
      site.domain_verification_challenges
    ) {
      const challenges = site.domain_verification_challenges as Array<{
        type: string;
        domain: string;
        value: string;
      }>;
      setDnsInstructions(formatDnsInstructions(site.custom_domain, challenges));
    } else {
      setDnsInstructions([]);
    }
  }, [site.custom_domain, site.domain_verification_status, site.domain_verification_challenges]);

  // Track if any changes have been made
  const initialHeader = site.header_content ?? { ...sectionDefaults.header, siteName: site.name };
  const initialFooter = site.footer_content ?? sectionDefaults.footer;
  const initialSocialLinks = (site.social_links as SocialLink[]) ?? [];
  const initialSocialIconStyle = (site.social_icon_style as SocialIconStyle) ?? "brand";

  const hasChanges =
    slug !== site.slug ||
    metaTitle !== (site.meta_title || "") ||
    metaDescription !== (site.meta_description || "") ||
    colorMode !== site.color_mode ||
    brandPersonality !== (site.brand_personality as BrandPersonality | null) ||
    underConstruction !== site.under_construction ||
    constructionTitle !== (site.construction_title || "") ||
    constructionDescription !== (site.construction_description || "") ||
    showBlogAuthor !== site.show_blog_author ||
    blogImageFit !== ((site.blog_image_fit as BlogImageFit) ?? "cover") ||
    defaultBlogCategoryId !== (site.default_blog_category_id ?? null) ||
    blogMetaTitle !== (site.blog_meta_title || "") ||
    blogMetaDescription !== (site.blog_meta_description || "") ||
    blogTitle !== (site.blog_title || "") ||
    contactNotificationEmail !== (site.contact_notification_email || "") ||
    faviconUrl !== (site.favicon_url || "") ||
    useSeparateFavicon !== site.use_separate_favicon ||
    ogImageUrl !== (site.og_image_url || "") ||
    !deepEqual(headerContent, initialHeader) ||
    !deepEqual(footerContent, initialFooter) ||
    !deepEqual(socialLinks, initialSocialLinks) ||
    socialIconStyle !== initialSocialIconStyle;

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
    setMetaTitle(site.meta_title || "");
    setMetaDescription(site.meta_description || "");
    setColorMode(site.color_mode);
    setBrandPersonality(site.brand_personality as BrandPersonality | null);
    setUnderConstruction(site.under_construction);
    setConstructionTitle(site.construction_title || "");
    setConstructionDescription(site.construction_description || "");
    setShowBlogAuthor(site.show_blog_author);
    setBlogImageFit((site.blog_image_fit as BlogImageFit) ?? "cover");
    setDefaultBlogCategoryId(site.default_blog_category_id ?? null);
    setBlogMetaTitle(site.blog_meta_title || "");
    setBlogMetaDescription(site.blog_meta_description || "");
    setBlogTitle(site.blog_title || "");
    setContactNotificationEmail(site.contact_notification_email || "");
    setFaviconUrl(site.favicon_url || "");
    setUseSeparateFavicon(site.use_separate_favicon);
    setOgImageUrl(site.og_image_url || "");
    setHeaderContent(site.header_content ?? { ...sectionDefaults.header, siteName: site.name });
    setFooterContent(site.footer_content ?? sectionDefaults.footer);
    setSocialLinks((site.social_links as SocialLink[]) ?? []);
    setSocialIconStyle((site.social_icon_style as SocialIconStyle) ?? "brand");
    setDomainInput("");
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
      blogImageFit: blogImageFit !== ((site.blog_image_fit as BlogImageFit) ?? "cover") ? blogImageFit : undefined,
      defaultBlogCategoryId: defaultBlogCategoryId !== (site.default_blog_category_id ?? null) ? defaultBlogCategoryId : undefined,
      blogMetaTitle: blogMetaTitle !== (site.blog_meta_title || "") ? blogMetaTitle || null : undefined,
      blogMetaDescription: blogMetaDescription !== (site.blog_meta_description || "") ? blogMetaDescription || null : undefined,
      blogTitle: blogTitle !== (site.blog_title || "") ? blogTitle || null : undefined,
      contactNotificationEmail: contactNotificationEmail !== (site.contact_notification_email || "") ? contactNotificationEmail || null : undefined,
      faviconUrl: faviconUrl !== (site.favicon_url || "") ? faviconUrl || null : undefined,
      useSeparateFavicon: useSeparateFavicon !== site.use_separate_favicon ? useSeparateFavicon : undefined,
      ogImageUrl: ogImageUrl !== (site.og_image_url || "") ? ogImageUrl || null : undefined,
      headerContent: !deepEqual(headerContent, initialHeader) ? headerContent : undefined,
      footerContent: !deepEqual(footerContent, initialFooter) ? footerContent : undefined,
      socialLinks: !deepEqual(socialLinks, initialSocialLinks) ? socialLinks : undefined,
      socialIconStyle: socialIconStyle !== initialSocialIconStyle ? socialIconStyle : undefined,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Settings saved successfully");
    } else {
      toast.error(result.error || "Failed to save settings");
    }
  };

  const publicUrl = `/sites/${slug}`;

  // Domain management handlers
  const handleAddDomain = async (): Promise<void> => {
    if (!domainInput.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    setDomainLoading(true);
    const result = await addCustomDomain(site.id, domainInput.trim());
    setDomainLoading(false);

    if (result.success) {
      setDomainInput("");
      if (result.verified) {
        toast.success("Domain connected and verified!");
      } else {
        toast.success("Domain added! Configure your DNS records below.");
      }
    } else {
      toast.error(result.error || "Failed to add domain");
    }
  };

  const handleRemoveDomain = async (): Promise<void> => {
    if (!site.custom_domain) return;

    setDomainLoading(true);
    const result = await removeCustomDomain(site.id);
    setDomainLoading(false);

    if (result.success) {
      toast.success("Domain removed successfully");
    } else {
      toast.error(result.error || "Failed to remove domain");
    }
  };

  const handleRetryVerification = async (): Promise<void> => {
    setDomainLoading(true);
    const result = await retryDomainVerification(site.id);
    setDomainLoading(false);

    if (result.success) {
      if (result.verified) {
        toast.success("Domain verified successfully!");
      } else {
        toast.info("Verification in progress. DNS records are being checked.");
      }
    } else {
      toast.error(result.error || "Verification failed");
    }
  };

  // Reusable save button component
  const SaveButton = () => (
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
  );

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

          <div className="space-y-4">
            <Label>Custom Domain</Label>

            {/* Feature not available */}
            {!domainFeatureAvailable && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Custom domains require Vercel API configuration. Add VERCEL_API_TOKEN and VERCEL_PROJECT_ID to your environment variables.
                </p>
              </div>
            )}

            {/* No domain connected */}
            {domainFeatureAvailable && !site.custom_domain && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="www.example.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    disabled={domainLoading}
                    className="max-w-md"
                  />
                  <Button
                    type="button"
                    onClick={handleAddDomain}
                    disabled={domainLoading || !domainInput.trim()}
                  >
                    {domainLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Connect Domain"
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your own domain. Your site will be accessible at both your custom domain and {publicUrl}
                </p>
              </div>
            )}

            {/* Domain pending verification */}
            {domainFeatureAvailable && site.custom_domain && site.domain_verification_status === "pending" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">{site.custom_domain}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                          Pending Verification
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRetryVerification}
                      disabled={domainLoading}
                    >
                      {domainLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Check Verification
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDomain}
                      disabled={domainLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* DNS Instructions */}
                <DnsInstructionsCard instructions={dnsInstructions} />
              </div>
            )}

            {/* Domain verified */}
            {domainFeatureAvailable && site.custom_domain && site.domain_verification_status === "verified" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <a
                        href={`https://${site.custom_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline flex items-center gap-1"
                      >
                        {site.custom_domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          Verified
                        </Badge>
                        {site.domain_ssl_status === "issued" && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            SSL Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveDomain}
                    disabled={domainLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    {domainLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* SEO Files */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">SEO Files</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <a
                      href={`https://${site.custom_domain}/sitemap.xml`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      sitemap.xml
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href={`https://${site.custom_domain}/robots.txt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      robots.txt
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Auto-generated for search engine optimization
                  </p>
                </div>
              </div>
            )}

            {/* Domain failed */}
            {domainFeatureAvailable && site.custom_domain && site.domain_verification_status === "failed" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">{site.custom_domain}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                          Verification Failed
                        </Badge>
                      </div>
                      {site.domain_error_message && (
                        <p className="text-sm text-red-600 mt-1">{site.domain_error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRetryVerification}
                      disabled={domainLoading}
                    >
                      {domainLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Retry
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDomain}
                      disabled={domainLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logo & Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo & Branding
          </CardTitle>
          <CardDescription>
            Your site logo and favicon (browser tab icon)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <ImageUpload
              value={headerContent.logoUrl || ""}
              onChange={(url) => {
                setHeaderContent({ ...headerContent, logoUrl: url });
                if (!useSeparateFavicon) {
                  setFaviconUrl(url);
                }
              }}
              siteId={site.id}
              disabled={loading}
              placeholder="Drag & drop your logo"
            />
            <p className="text-sm text-muted-foreground">
              Your logo appears in the site header
            </p>
          </div>

          <Separator />

          {/* Favicon Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="useSeparateFavicon">Use different image for favicon</Label>
                <p className="text-sm text-muted-foreground">
                  {useSeparateFavicon
                    ? "Upload a separate favicon image below"
                    : "Your logo will be used as the favicon"}
                </p>
              </div>
              <Switch
                id="useSeparateFavicon"
                checked={useSeparateFavicon}
                onCheckedChange={(checked) => {
                  setUseSeparateFavicon(checked);
                  if (!checked) {
                    setFaviconUrl(headerContent.logoUrl || "");
                  }
                }}
                disabled={loading}
              />
            </div>

            {useSeparateFavicon && (
              <div className="space-y-2">
                <Label>Favicon</Label>
                <ImageUpload
                  value={faviconUrl}
                  onChange={setFaviconUrl}
                  siteId={site.id}
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Square image recommended (512x512px).{" "}
                  <a
                    href="https://realfavicongenerator.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Create a favicon from your logo
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Links
          </CardTitle>
          <CardDescription>
            Add links to your social media profiles. These can be displayed in your header, footer, or as a standalone block.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SocialLinksManager
            links={socialLinks}
            iconStyle={socialIconStyle}
            onLinksChange={setSocialLinks}
            onIconStyleChange={setSocialIconStyle}
            disabled={loading}
            primaryColor={themePrimaryColor}
          />
        </CardContent>
      </Card>

      <SaveButton />

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
          <div className="space-y-2">
            <Label htmlFor="blogTitle">Blog Page Title</Label>
            <Input
              id="blogTitle"
              placeholder="Blog"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              disabled={loading}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              The title displayed at the top of your blog page. Defaults to &quot;Blog&quot; if empty.
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showBlogAuthor">Show Author on Post Pages</Label>
              <p className="text-sm text-muted-foreground">
                Display author info on individual blog post pages. Blog Grid and Featured blocks have their own author toggle.
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
            <Label htmlFor="blogImageFit">Featured Image Display</Label>
            <Select
              value={blogImageFit}
              onValueChange={(value) => setBlogImageFit(value as BlogImageFit)}
              disabled={loading}
            >
              <SelectTrigger className="w-full max-w-xs" id="blogImageFit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover (Recommended)</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {blogImageFit === "cover" && "Crops the image to fill the container. Best for consistent layouts but may cut off parts of the image."}
              {blogImageFit === "contain" && "Shows the entire image without cropping. May leave empty space if aspect ratios don't match."}
              {blogImageFit === "fill" && "Stretches the image to fill the container. May distort the image."}
            </p>
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

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="blogMetaTitle">Blog Page Meta Title</Label>
            <Input
              id="blogMetaTitle"
              placeholder={`Blog | ${site.name}`}
              value={blogMetaTitle}
              onChange={(e) => setBlogMetaTitle(e.target.value)}
              disabled={loading}
              maxLength={60}
            />
            <p className="text-sm text-muted-foreground">
              The title shown in search results for your main blog page (max 60 characters).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blogMetaDescription">Blog Page Meta Description</Label>
            <Textarea
              id="blogMetaDescription"
              placeholder={`Latest blog posts from ${site.name}`}
              value={blogMetaDescription}
              onChange={(e) => setBlogMetaDescription(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={160}
            />
            <p className="text-sm text-muted-foreground">
              A brief summary of your blog shown in search results (max 160 characters).
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

      <SaveButton />

      {/* Legal Pages */}
      <LegalPagesCard site={site} />

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

      <SaveButton />

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

          <Separator />

          {/* Social Sharing Image */}
          <div className="space-y-2">
            <Label>Social Sharing Image (OG Image)</Label>
            <ImageUpload
              value={ogImageUrl}
              onChange={setOgImageUrl}
              siteId={site.id}
              disabled={loading}
              placeholder="Upload an image for social sharing"
            />
            <p className="text-sm text-muted-foreground">
              This image appears when your site is shared on Twitter, Facebook, LinkedIn, and other platforms.
              Recommended size: 1200x630 pixels.
            </p>
          </div>

          {/* Social Share Preview */}
          {(ogImageUrl || metaTitle || metaDescription) && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Social Share Preview</Label>
              <div className="border rounded-lg overflow-hidden max-w-md">
                {ogImageUrl && (
                  <div className="aspect-[1200/630] bg-muted relative">
                    <img
                      src={ogImageUrl}
                      alt="Social share preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {site.custom_domain || `headstringweb.com${publicUrl}`}
                  </p>
                  <p className="font-semibold text-sm line-clamp-1">
                    {metaTitle || site.name}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {metaDescription || site.description || "No description set"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Health Check */}
      <SeoScorecard siteId={site.id} />

      <SaveButton />

      {/* Image Library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Library
          </CardTitle>
          <CardDescription>
            Organize images into albums and manage all uploaded images for this site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Album Management */}
          <div>
            <h4 className="text-sm font-medium mb-3">Albums</h4>
            <AlbumManager siteId={site.id} />
          </div>

          <Separator />

          {/* Image Library Modal */}
          <div>
            <h4 className="text-sm font-medium mb-3">All Images</h4>
            <ImageLibraryModal siteId={site.id} />
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <CardDescription>
            Upload PDFs and documents. Copy URLs to use in header links, CTA buttons, or footer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUpload siteId={site.id} siteSlug={site.slug} disabled={loading} />
        </CardContent>
      </Card>
    </form>
  );
}
