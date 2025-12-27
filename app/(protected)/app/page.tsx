import { Suspense } from "react";
import { Plus } from "lucide-react";
import { requireUserId } from "@/lib/auth";
import { getSitesWithPageCounts, type SiteSortField } from "@/lib/queries/sites";
import { SiteCard } from "@/components/sites/SiteCard";
import { EmptyState } from "@/components/sites/EmptyState";
import { CreateSiteModal } from "@/components/sites/CreateSiteModal";
import { SiteSortDropdown } from "@/components/sites/SiteSortDropdown";
import { Button } from "@/components/ui/button";

interface DashboardPageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const userId = await requireUserId();
  const params = await searchParams;

  const sortBy = (params.sort as SiteSortField) || "updated_at";
  const sites = await getSitesWithPageCounts(userId, { sortBy, sortOrder: "desc" });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Sites</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your websites
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <SiteSortDropdown currentSort={sortBy} />
          </Suspense>
          <CreateSiteModal>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Site
            </Button>
          </CreateSiteModal>
        </div>
      </div>

      {/* Sites Grid or Empty State */}
      {sites.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} pageCount={site.pageCount} />
          ))}
        </div>
      )}
    </div>
  );
}
