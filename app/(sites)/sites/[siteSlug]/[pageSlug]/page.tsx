import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublishedPageBySlug } from "@/lib/queries/pages";
import { getPublishedSectionsByPage } from "@/lib/queries/sections";
import { getActiveTheme } from "@/lib/queries/themes";
import { getCurrentUserId } from "@/lib/auth";
import { PageRenderer } from "@/components/render";
import { ThemeStyles, ColorModeScript } from "@/components/render/ThemeStyles";
import { ColorModeToggle } from "@/components/render/ColorModeToggle";
import { HeaderBlock } from "@/components/render/blocks/HeaderBlock";
import { FooterBlock } from "@/components/render/blocks/FooterBlock";
import { ComingSoonPage } from "@/components/render/ComingSoonPage";
import { DEFAULT_THEME } from "@/lib/default-theme";
import { mergeHeaderContent, mergeFooterContent } from "@/lib/header-footer-utils";
import { getBasePath } from "@/lib/url-utils";
import type { HeaderContent, FooterContent } from "@/lib/section-types";

// Ensure fresh data on every request for published sites
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteSlug: string; pageSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug, pageSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return { title: "Not Found" };
  }

  const page = await getPublishedPageBySlug(site.id, pageSlug);
  if (!page) {
    return { title: "Not Found" };
  }

  const title = page.meta_title || page.title;
  const description =
    page.meta_description || site.meta_description || site.description || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    ...(site.favicon_url && {
      icons: {
        icon: site.favicon_url,
        apple: site.favicon_url,
      },
    }),
  };
}

export default async function PublishedSitePage({ params }: PageProps) {
  const { siteSlug, pageSlug } = await params;

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

  const page = await getPublishedPageBySlug(site.id, pageSlug);
  if (!page) {
    notFound();
  }

  const allSections = await getPublishedSectionsByPage(page.id);
  const activeTheme = await getActiveTheme(site.id);
  const theme = activeTheme?.data ?? DEFAULT_THEME;
  const colorMode = site.color_mode;

  // Get site-level header/footer
  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;

  // Find page-level header/footer sections for potential overrides
  const pageHeaderSection = allSections.find((s) => s.block_type === "header");
  const pageFooterSection = allSections.find((s) => s.block_type === "footer");
  const pageHeader = pageHeaderSection?.content as HeaderContent | null;
  const pageFooter = pageFooterSection?.content as FooterContent | null;

  // Merge site-level with page-level overrides
  const finalHeader = siteHeader
    ? mergeHeaderContent(siteHeader, pageHeader)
    : pageHeader;
  const finalFooter = siteFooter
    ? mergeFooterContent(siteFooter, pageFooter)
    : pageFooter;

  // Filter out header/footer from regular sections (they're rendered separately)
  const sections = allSections.filter(
    (section) =>
      section.block_type !== "header" && section.block_type !== "footer"
  );

  return (
    <>
      <ColorModeScript colorMode={colorMode} />
      <ThemeStyles theme={theme} colorMode={colorMode} />
      <div className="relative">
        {colorMode === "user_choice" && (
          <div className="fixed top-4 right-4 z-[60]">
            <ColorModeToggle />
          </div>
        )}
        {finalHeader && <HeaderBlock content={finalHeader} theme={theme} basePath={basePath} />}
        <PageRenderer
          sections={sections}
          theme={theme}
          siteId={site.id}
          basePath={basePath}
          showBlogAuthor={site.show_blog_author}
          pageId={page.id}
        />
        {finalFooter && <FooterBlock content={finalFooter} theme={theme} basePath={basePath} />}
      </div>
    </>
  );
}
