import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getSiteById } from "@/lib/queries/sites";
import { getPageById } from "@/lib/queries/pages";
import { getSectionsByPage } from "@/lib/queries/sections";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { SectionsList } from "@/components/editor/SectionsList";
import { BlockPicker } from "@/components/editor/BlockPicker";
import { LayoutSuggestionModal } from "@/components/editor/LayoutSuggestionModal";

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

  if (!site || !page) {
    notFound();
  }

  // Verify page belongs to site
  if (page.site_id !== siteId) {
    notFound();
  }

  const sections = await getSectionsByPage(pageId, userId);

  const breadcrumbs = [
    { label: "Dashboard", href: "/app" },
    { label: site.name, href: `/app/sites/${siteId}` },
    { label: page.title, href: `/app/sites/${siteId}/pages/${pageId}` },
  ];

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs items={breadcrumbs} />
      <EditorHeader page={page} siteId={siteId} />
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <SectionsList sections={sections} pageId={pageId} siteId={siteId} />
          <div className="mt-6 flex justify-center gap-3">
            <LayoutSuggestionModal pageId={pageId} siteId={siteId} />
            <BlockPicker pageId={pageId} siteId={siteId} />
          </div>
        </div>
      </div>
    </div>
  );
}
