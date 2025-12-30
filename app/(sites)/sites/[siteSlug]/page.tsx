import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Metadata } from "next";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublishedHomePage } from "@/lib/queries/pages";
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
  params: Promise<{ siteSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return { title: "Not Found" };
  }

  const page = await getPublishedHomePage(site.id);
  const title = page?.meta_title || site.meta_title || site.name;
  const description =
    page?.meta_description || site.meta_description || site.description || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function PublishedSiteHomePage({ params, searchParams }: PageProps) {
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
  // Owner can bypass with ?preview=site to see full site
  // Owner can test Coming Soon page with ?preview=coming-soon
  if (site.under_construction) {
    const userId = await getCurrentUserId();
    const isOwner = userId === site.user_id;

    if (preview === "coming-soon" && isOwner) {
      // Owner wants to preview the Coming Soon page
      return <ComingSoonPage site={site} />;
    }

    if (preview === "site" && isOwner) {
      // Owner wants to preview the full site - continue rendering
    } else if (!isOwner) {
      // Non-owners always see Coming Soon
      return <ComingSoonPage site={site} />;
    } else {
      // Owner without preview param sees Coming Soon by default
      return <ComingSoonPage site={site} />;
    }
  }

  const page = await getPublishedHomePage(site.id);
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
        />
        {finalFooter && <FooterBlock content={finalFooter} theme={theme} basePath={basePath} />}
      </div>
    </>
  );
}
