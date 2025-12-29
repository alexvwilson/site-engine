import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getSiteById } from "@/lib/queries/sites";
import { getPageById } from "@/lib/queries/pages";
import { getSectionsByPage } from "@/lib/queries/sections";
import { getActiveTheme } from "@/lib/queries/themes";
import { PreviewHeader } from "@/components/preview/PreviewHeader";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { mergeHeaderContent, mergeFooterContent } from "@/lib/header-footer-utils";
import type { HeaderContent, FooterContent } from "@/lib/section-types";

interface PagePreviewProps {
  params: Promise<{ siteId: string; pageId: string }>;
}

export default async function PagePreviewPage({
  params,
}: PagePreviewProps) {
  const userId = await requireUserId();
  const { siteId, pageId } = await params;

  const [site, page] = await Promise.all([
    getSiteById(siteId, userId),
    getPageById(pageId, userId),
  ]);

  if (!site || !page || page.site_id !== siteId) {
    notFound();
  }

  const [allSections, activeTheme] = await Promise.all([
    getSectionsByPage(pageId, userId),
    getActiveTheme(siteId),
  ]);

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
    <div className="flex flex-col h-full">
      <PreviewHeader
        page={page}
        siteId={siteId}
        hasTheme={!!activeTheme}
      />
      <div className="flex-1 overflow-hidden">
        <PreviewFrame
          sections={sections}
          theme={activeTheme?.data ?? null}
          siteHeader={finalHeader}
          siteFooter={finalFooter}
        />
      </div>
    </div>
  );
}
