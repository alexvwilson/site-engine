import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getSiteById } from "@/lib/queries/sites";
import { getPagesBySite } from "@/lib/queries/pages";
import { getThemesBySite, getActiveTheme } from "@/lib/queries/themes";
import { SiteHeader } from "@/components/sites/SiteHeader";
import { SiteTabs } from "@/components/sites/SiteTabs";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

interface SiteDetailPageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const userId = await requireUserId();
  const { siteId } = await params;

  const site = await getSiteById(siteId, userId);
  if (!site) {
    notFound();
  }

  // Fetch pages and themes in parallel
  const [pages, themes, activeTheme] = await Promise.all([
    getPagesBySite(siteId, userId),
    getThemesBySite(siteId),
    getActiveTheme(siteId),
  ]);

  const breadcrumbs = [
    { label: "Dashboard", href: "/app" },
    { label: site.name, href: `/app/sites/${siteId}` },
  ];

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs items={breadcrumbs} />
      <div className="container mx-auto px-4 py-8">
        <SiteHeader site={site} />
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <SiteTabs site={site} pages={pages} themes={themes} activeTheme={activeTheme} />
        </Suspense>
      </div>
    </div>
  );
}
