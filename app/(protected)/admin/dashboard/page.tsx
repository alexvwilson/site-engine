import { requireAdminAccess } from "@/lib/auth";
import {
  getSystemMetrics,
  getJobStatistics,
  getUsageTrends,
  getSystemHealth,
} from "@/lib/admin";
import { getAllFaqs, getAllFeatures } from "@/lib/queries/landing-content";
import { SystemMetricsCards } from "@/components/admin/SystemMetricsCards";
import { JobStatisticsChart } from "@/components/admin/JobStatisticsChart";
import { UsageTrendsChart } from "@/components/admin/UsageTrendsChart";
import { TodaysActivityCard } from "@/components/admin/TodaysActivityCard";
import { UserSearchList } from "@/components/admin/UserSearchList";
import { FAQManager } from "@/components/admin/FAQManager";
import { FeatureManager } from "@/components/admin/FeatureManager";

export default async function AdminDashboard() {
  // Enforce admin access (redirects non-admin to /unauthorized)
  await requireAdminAccess();

  // Fetch all data in parallel for fast page load
  const [systemMetrics, jobStats, usageTrends, systemHealth, allFaqs, allFeatures] =
    await Promise.all([
      getSystemMetrics(),
      getJobStatistics(30),
      getUsageTrends(30),
      getSystemHealth(),
      getAllFaqs(),
      getAllFeatures(),
    ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor system health, user analytics, and job processing metrics
        </p>
      </div>

      <div className="space-y-8">
        {/* System Metrics Grid - 4 metric cards */}
        <SystemMetricsCards metrics={systemMetrics} />

        {/* Today's Activity */}
        <TodaysActivityCard metrics={systemMetrics} health={systemHealth} />

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <JobStatisticsChart data={jobStats} />
          <UsageTrendsChart data={usageTrends} />
        </div>

        {/* User Search and List */}
        <UserSearchList />

        {/* Landing Page Content Management */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Landing Page Content</h2>
          <p className="text-muted-foreground mb-6">
            Manage FAQ questions and feature highlights displayed on the public
            landing page.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <FAQManager initialFaqs={allFaqs} />
            <FeatureManager initialFeatures={allFeatures} />
          </div>
        </div>
      </div>
    </div>
  );
}
