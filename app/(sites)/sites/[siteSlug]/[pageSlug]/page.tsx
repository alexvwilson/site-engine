import { notFound } from "next/navigation";
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
  };
}

export default async function PublishedSitePage({ params }: PageProps) {
  const { siteSlug, pageSlug } = await params;

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

  // Use site-level header/footer if configured, otherwise fall back to page sections
  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;

  // Filter out page-level header/footer if site-level ones are configured
  const sections = allSections.filter((section) => {
    if (siteHeader && section.block_type === "header") return false;
    if (siteFooter && section.block_type === "footer") return false;
    return true;
  });

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
        {siteHeader && <HeaderBlock content={siteHeader} theme={theme} />}
        <PageRenderer
          sections={sections}
          theme={theme}
          siteId={site.id}
          siteSlug={siteSlug}
          showBlogAuthor={site.show_blog_author}
        />
        {siteFooter && <FooterBlock content={siteFooter} theme={theme} />}
      </div>
    </>
  );
}
