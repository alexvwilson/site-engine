import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublishedPostsBySite, getPublishedPostCount } from "@/lib/queries/blog";
import { getActiveTheme } from "@/lib/queries/themes";
import { getCurrentUserId } from "@/lib/auth";
import { ThemeStyles, ColorModeScript } from "@/components/render/ThemeStyles";
import { ColorModeToggle } from "@/components/render/ColorModeToggle";
import { HeaderBlock } from "@/components/render/blocks/HeaderBlock";
import { FooterBlock } from "@/components/render/blocks/FooterBlock";
import { ComingSoonPage } from "@/components/render/ComingSoonPage";
import { BlogListingPage } from "@/components/render/blog/BlogListingPage";
import { DEFAULT_THEME } from "@/lib/default-theme";
import { getBasePath } from "@/lib/url-utils";
import type { HeaderContent, FooterContent } from "@/lib/section-types";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 9;

interface PageProps {
  params: Promise<{ siteSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return { title: "Not Found" };
  }

  return {
    title: `Blog | ${site.meta_title || site.name}`,
    description: `Latest blog posts from ${site.name}`,
    openGraph: {
      title: `Blog | ${site.meta_title || site.name}`,
      description: `Latest blog posts from ${site.name}`,
      type: "website",
    },
  };
}

export default async function PublishedBlogPage({ params, searchParams }: PageProps) {
  const { siteSlug } = await params;
  const { preview } = await searchParams;

  // Detect custom domain via middleware header
  const headersList = await headers();
  const isCustomDomain = headersList.has("x-site-base-path");
  const basePath = getBasePath(siteSlug, isCustomDomain);

  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) {
    notFound();
  }

  // Show Coming Soon page when under construction
  // Force preview with ?preview=coming-soon, otherwise show to non-owners only
  if (site.under_construction) {
    if (preview === "coming-soon") {
      return <ComingSoonPage site={site} />;
    }
    const userId = await getCurrentUserId();
    if (userId !== site.user_id) {
      return <ComingSoonPage site={site} />;
    }
  }

  const [posts, totalCount, activeTheme] = await Promise.all([
    getPublishedPostsBySite(site.id, POSTS_PER_PAGE, 0),
    getPublishedPostCount(site.id),
    getActiveTheme(site.id),
  ]);

  const theme = activeTheme?.data ?? DEFAULT_THEME;
  const colorMode = site.color_mode;

  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;

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
        {siteHeader && <HeaderBlock content={siteHeader} theme={theme} basePath={basePath} />}
        <main className="flex-1">
          <BlogListingPage
            initialPosts={posts}
            basePath={basePath}
            siteId={site.id}
            siteName={site.name}
            showAuthor={site.show_blog_author}
            totalCount={totalCount}
            postsPerPage={POSTS_PER_PAGE}
          />
        </main>
        {siteFooter && <FooterBlock content={siteFooter} theme={theme} basePath={basePath} />}
      </div>
    </>
  );
}
