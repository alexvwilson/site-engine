import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getSiteById } from "@/lib/queries/sites";
import { getPageById } from "@/lib/queries/pages";
import { getSectionsByPage } from "@/lib/queries/sections";
import { getActiveTheme } from "@/lib/queries/themes";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { EditorLayout } from "@/components/editor/EditorLayout";
import {
  mergeHeaderContent,
  mergeFooterContent,
} from "@/lib/header-footer-utils";
import type { HeaderContent, FooterContent } from "@/lib/section-types";

interface PageEditorProps {
  params: Promise<{ siteId: string; pageId: string }>;
}

export default async function PageEditorPage({ params }: PageEditorProps) {
  const userId = await requireUserId();
  const { siteId, pageId } = await params;

  const [site, page] = await Promise.all([
    getSiteById(siteId, userId),
    getPageById(pageId, userId),
  ]);

  if (!site || !page || page.site_id !== siteId) {
    notFound();
  }

  // Fetch sections and theme in parallel
  const [allSections, activeTheme] = await Promise.all([
    getSectionsByPage(pageId, userId),
    getActiveTheme(siteId),
  ]);

  // Header/footer merging for preview (same logic as preview page)
  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;
  const pageHeaderSection = allSections.find((s) => s.block_type === "header");
  const pageFooterSection = allSections.find((s) => s.block_type === "footer");
  const pageHeader = pageHeaderSection?.content as HeaderContent | null;
  const pageFooter = pageFooterSection?.content as FooterContent | null;

  const finalHeader = siteHeader
    ? mergeHeaderContent(siteHeader, pageHeader)
    : pageHeader;
  const finalFooter = siteFooter
    ? mergeFooterContent(siteFooter, pageFooter)
    : pageFooter;

  // Sections for preview (without header/footer - they're rendered separately)
  const previewSections = allSections.filter(
    (s) => s.block_type !== "header" && s.block_type !== "footer"
  );

  const breadcrumbs = [
    { label: "Dashboard", href: "/app" },
    { label: site.name, href: `/app/sites/${siteId}` },
    { label: page.title, href: `/app/sites/${siteId}/pages/${pageId}` },
  ];

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs items={breadcrumbs} />
      <EditorLayout
        page={page}
        siteId={siteId}
        sections={allSections}
        previewSections={previewSections}
        theme={activeTheme?.data ?? null}
        siteHeader={finalHeader ?? null}
        siteFooter={finalFooter ?? null}
      />
    </div>
  );
}
