import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import {
  getCategoryBySlug,
  getPublishedPostsByCategory,
  getPublishedPostCountByCategory,
} from "@/lib/queries/blog";
import { getActiveTheme } from "@/lib/queries/themes";
import { getCurrentUserId } from "@/lib/auth";
import { ThemeStyles, ColorModeScript } from "@/components/render/ThemeStyles";
import { ColorModeToggle } from "@/components/render/ColorModeToggle";
import { HeaderBlock } from "@/components/render/blocks/HeaderBlock";
import { FooterBlock } from "@/components/render/blocks/FooterBlock";
import { ComingSoonPage } from "@/components/render/ComingSoonPage";
import { CategoryListingPage } from "@/components/render/blog/CategoryListingPage";
import { DEFAULT_THEME } from "@/lib/default-theme";
import { getBasePath } from "@/lib/url-utils";
import type { HeaderContent, FooterContent, SocialLink, SocialIconStyle, ImageFit } from "@/lib/section-types";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 9;

interface PageProps {
  params: Promise<{ siteSlug: string; categorySlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug, categorySlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return { title: "Not Found" };
  }

  const category = await getCategoryBySlug(site.id, categorySlug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  const title = `${category.name} | Blog | ${site.meta_title || site.name}`;
  const description = category.description || `Posts in ${category.name} from ${site.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: site.name,
      ...(site.og_image_url && { images: [site.og_image_url] }),
    },
    twitter: {
      card: site.og_image_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(site.og_image_url && { images: [site.og_image_url] }),
    },
    ...(site.favicon_url && {
      icons: {
        icon: site.favicon_url,
        apple: site.favicon_url,
      },
    }),
  };
}

export default async function CategoryArchivePage({ params }: PageProps) {
  const { siteSlug, categorySlug } = await params;

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

  const category = await getCategoryBySlug(site.id, categorySlug);
  if (!category) {
    notFound();
  }

  const [posts, totalCount, activeTheme] = await Promise.all([
    getPublishedPostsByCategory(site.id, categorySlug, POSTS_PER_PAGE, 0),
    getPublishedPostCountByCategory(site.id, categorySlug),
    getActiveTheme(site.id),
  ]);

  const theme = activeTheme?.data ?? DEFAULT_THEME;
  const colorMode = site.color_mode;

  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;
  const socialLinks = (site.social_links as SocialLink[]) ?? [];
  const socialIconStyle = (site.social_icon_style as SocialIconStyle) ?? "brand";
  const blogImageFit = (site.blog_image_fit as ImageFit) ?? "cover";

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
        {siteHeader && <HeaderBlock content={siteHeader} theme={theme} basePath={basePath} socialLinks={socialLinks} socialIconStyle={socialIconStyle} />}
        <main className="flex-1">
          <CategoryListingPage
            initialPosts={posts}
            basePath={basePath}
            siteId={site.id}
            category={category}
            showAuthor={site.show_blog_author}
            totalCount={totalCount}
            postsPerPage={POSTS_PER_PAGE}
            imageFit={blogImageFit}
            blogTitle={site.blog_title}
          />
        </main>
        {siteFooter && <FooterBlock content={siteFooter} theme={theme} basePath={basePath} socialLinks={socialLinks} socialIconStyle={socialIconStyle} />}
      </div>
    </>
  );
}
