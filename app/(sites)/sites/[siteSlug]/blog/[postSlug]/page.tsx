import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublishedPostBySlug, getAdjacentPosts } from "@/lib/queries/blog";
import { calculateReadingTime } from "@/lib/blog-utils";
import { SocialShare } from "@/components/render/blog/SocialShare";
import { PostNavigation } from "@/components/render/blog/PostNavigation";
import { getActiveTheme } from "@/lib/queries/themes";
import { getCurrentUserId } from "@/lib/auth";
import { ThemeStyles, ColorModeScript } from "@/components/render/ThemeStyles";
import { ColorModeToggle } from "@/components/render/ColorModeToggle";
import { HeaderBlock } from "@/components/render/blocks/HeaderBlock";
import { FooterBlock } from "@/components/render/blocks/FooterBlock";
import { ComingSoonPage } from "@/components/render/ComingSoonPage";
import { PostContent } from "@/components/render/blog/PostContent";
import { DEFAULT_THEME } from "@/lib/default-theme";
import { getBasePath, getPublicSiteUrl } from "@/lib/url-utils";
import type { HeaderContent, FooterContent, SocialLink, SocialIconStyle, ImageFit } from "@/lib/section-types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteSlug: string; postSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug, postSlug } = await params;
  const post = await getPublishedPostBySlug(siteSlug, postSlug);

  if (!post) {
    return { title: "Not Found" };
  }

  const title = post.meta_title || `${post.title} | ${post.site.name}`;
  const description = post.meta_description || post.excerpt || `Read ${post.title} on ${post.site.name}`;
  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sites/${siteSlug}/blog/${postSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.meta_title || post.title,
      description,
      type: "article",
      url: postUrl,
      siteName: post.site.name,
      publishedTime: post.published_at?.toISOString(),
      modifiedTime: post.updated_at?.toISOString(),
      authors: post.author?.full_name ? [post.author.full_name] : undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
    twitter: {
      card: post.featured_image ? "summary_large_image" : "summary",
      title: post.meta_title || post.title,
      description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
    ...(post.site.favicon_url && {
      icons: {
        icon: post.site.favicon_url,
        apple: post.site.favicon_url,
      },
    }),
  };
}

export default async function PublishedPostPage({ params }: PageProps) {
  const { siteSlug, postSlug } = await params;

  // Detect custom domain via middleware header
  const headersList = await headers();
  const isCustomDomain = headersList.has("x-site-base-path");
  const basePath = getBasePath(siteSlug, isCustomDomain);

  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) {
    notFound();
  }

  // Show Coming Soon page to non-owners when under construction
  if (site.under_construction) {
    const userId = await getCurrentUserId();
    if (userId !== site.user_id) {
      return <ComingSoonPage site={site} />;
    }
  }

  const post = await getPublishedPostBySlug(siteSlug, postSlug);
  if (!post) {
    notFound();
  }

  const [activeTheme, adjacentPosts] = await Promise.all([
    getActiveTheme(site.id),
    post.published_at ? getAdjacentPosts(site.id, post.published_at) : Promise.resolve({ previous: null, next: null }),
  ]);
  const theme = activeTheme?.data ?? DEFAULT_THEME;
  const colorMode = site.color_mode;

  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;
  const socialLinks = (site.social_links as SocialLink[]) ?? [];
  const socialIconStyle = (site.social_icon_style as SocialIconStyle) ?? "brand";
  const blogImageFit = (site.blog_image_fit as ImageFit) ?? "cover";
  const blogLabel = site.blog_title || "Blog";

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const showAuthor = post.site.show_blog_author;
  const readingTime = calculateReadingTime(post.content?.html);
  // Use custom domain for public URL if available, otherwise default app URL
  const publicSiteUrl = getPublicSiteUrl(siteSlug, site.custom_domain, process.env.NEXT_PUBLIC_APP_URL || "");
  const postUrl = `${publicSiteUrl}/blog/${postSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.featured_image || undefined,
    datePublished: post.published_at?.toISOString(),
    dateModified: post.updated_at?.toISOString(),
    author: post.author?.full_name
      ? {
          "@type": "Person",
          name: post.author.full_name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: post.site.name,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ColorModeScript colorMode={colorMode} />
      <ThemeStyles theme={theme} colorMode={colorMode} />
      <div className="relative min-h-screen flex flex-col">
        {colorMode === "user_choice" && (
          <div className="fixed top-4 right-4 z-[60]">
            <ColorModeToggle />
          </div>
        )}
        {siteHeader && <HeaderBlock content={siteHeader} theme={theme} basePath={basePath} socialLinks={socialLinks} socialIconStyle={socialIconStyle} />}
        <main className="flex-1" style={{ backgroundColor: "var(--theme-background)" }}>
          <article className="py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Back Link */}
              <Link
                href={`${basePath}/blog`}
                className="inline-flex items-center gap-2 mb-8 text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--theme-primary)" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {blogLabel}
              </Link>

              {/* Post Header */}
              <header className="mb-8 md:mb-12">
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                  style={{
                    color: "var(--theme-text)",
                    fontFamily: "var(--theme-font-heading)",
                  }}
                >
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div
                  className="flex flex-wrap items-center gap-3 text-sm"
                  style={{ color: "var(--theme-muted-text)" }}
                >
                  {showAuthor && post.author?.full_name && (
                    <>
                      <span
                        className="font-medium"
                        style={{ color: "var(--theme-text)" }}
                      >
                        {post.author.full_name}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <time dateTime={post.published_at?.toISOString()}>
                    {formattedDate}
                  </time>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {readingTime} min read
                  </span>
                  {post.category && (
                    <>
                      <span>•</span>
                      <Link
                        href={`${basePath}/blog/category/${post.category.slug}`}
                        className="inline-flex items-center gap-1 transition-colors hover:opacity-80"
                        style={{ color: "var(--theme-primary)" }}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {post.category.name}
                      </Link>
                    </>
                  )}
                </div>
              </header>

              {/* Featured Image */}
              {post.featured_image && (
                <div
                  className="relative aspect-video mb-8 md:mb-12 rounded-lg overflow-hidden"
                  style={{ backgroundColor: blogImageFit === "contain" ? "var(--theme-muted)" : undefined }}
                >
                  <Image
                    src={post.featured_image}
                    alt={post.featured_image_alt || post.title}
                    fill
                    className={
                      blogImageFit === "cover"
                        ? "object-cover"
                        : blogImageFit === "contain"
                          ? "object-contain"
                          : "object-fill"
                    }
                    priority
                  />
                </div>
              )}

              {/* Post Content */}
              <PostContent content={post.content} />

              {/* Social Sharing */}
              <div className="mt-10 pt-8 border-t" style={{ borderColor: "var(--theme-border)" }}>
                <SocialShare
                  url={postUrl}
                  title={post.title}
                  description={post.excerpt || undefined}
                />
              </div>

              {/* Post Navigation */}
              <PostNavigation
                basePath={basePath}
                previous={adjacentPosts.previous}
                next={adjacentPosts.next}
              />
            </div>
          </article>
        </main>
        {siteFooter && <FooterBlock content={siteFooter} theme={theme} basePath={basePath} socialLinks={socialLinks} socialIconStyle={socialIconStyle} />}
      </div>
    </>
  );
}
