import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublishedPostBySlug } from "@/lib/queries/blog";
import { getActiveTheme } from "@/lib/queries/themes";
import { getCurrentUserId } from "@/lib/auth";
import { ThemeStyles, ColorModeScript } from "@/components/render/ThemeStyles";
import { ColorModeToggle } from "@/components/render/ColorModeToggle";
import { HeaderBlock } from "@/components/render/blocks/HeaderBlock";
import { FooterBlock } from "@/components/render/blocks/FooterBlock";
import { ComingSoonPage } from "@/components/render/ComingSoonPage";
import { PostContent } from "@/components/render/blog/PostContent";
import { DEFAULT_THEME } from "@/lib/default-theme";
import type { HeaderContent, FooterContent } from "@/lib/section-types";

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

  return {
    title: `${post.title} | ${post.site.name}`,
    description: post.excerpt || `Read ${post.title} on ${post.site.name}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title} on ${post.site.name}`,
      type: "article",
      publishedTime: post.published_at?.toISOString(),
      authors: post.author?.full_name ? [post.author.full_name] : undefined,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function PublishedPostPage({ params }: PageProps) {
  const { siteSlug, postSlug } = await params;

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

  const activeTheme = await getActiveTheme(site.id);
  const theme = activeTheme?.data ?? DEFAULT_THEME;
  const colorMode = site.color_mode;

  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const showAuthor = post.site.show_blog_author;

  return (
    <>
      <ColorModeScript colorMode={colorMode} />
      <ThemeStyles theme={theme} colorMode={colorMode} />
      <div className="relative min-h-screen flex flex-col">
        {colorMode === "user_choice" && (
          <div className="fixed top-4 right-4 z-[60]">
            <ColorModeToggle />
          </div>
        )}
        {siteHeader && <HeaderBlock content={siteHeader} theme={theme} />}
        <main className="flex-1" style={{ backgroundColor: "var(--theme-background)" }}>
          <article className="py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Back Link */}
              <Link
                href={`/sites/${siteSlug}/blog`}
                className="inline-flex items-center gap-2 mb-8 text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--theme-primary)" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
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
                </div>
              </header>

              {/* Featured Image */}
              {post.featured_image && (
                <div className="relative aspect-video mb-8 md:mb-12 rounded-lg overflow-hidden">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Post Content */}
              <PostContent content={post.content} />
            </div>
          </article>
        </main>
        {siteFooter && <FooterBlock content={siteFooter} theme={theme} />}
      </div>
    </>
  );
}
