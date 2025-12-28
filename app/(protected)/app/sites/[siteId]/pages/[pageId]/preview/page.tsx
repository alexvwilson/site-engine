import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getSiteById } from "@/lib/queries/sites";
import { getPageById } from "@/lib/queries/pages";
import { getSectionsByPage } from "@/lib/queries/sections";
import { getActiveTheme } from "@/lib/queries/themes";
import { PreviewHeader } from "@/components/preview/PreviewHeader";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
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

  // Use site-level header/footer if configured
  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;

  // Filter out page-level header/footer if site-level ones are configured
  const sections = allSections.filter((section) => {
    if (siteHeader && section.block_type === "header") return false;
    if (siteFooter && section.block_type === "footer") return false;
    return true;
  });

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
          siteHeader={siteHeader}
          siteFooter={siteFooter}
        />
      </div>
    </div>
  );
}
