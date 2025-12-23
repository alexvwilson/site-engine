import { requireAdminAccess } from "@/lib/auth";
import {
  getSystemMetrics,
  getJobStatistics,
  getUsageTrends,
  getSystemHealth,
} from "@/lib/admin";
import { SystemMetricsCards } from "@/components/admin/SystemMetricsCards";
import { JobStatisticsChart } from "@/components/admin/JobStatisticsChart";
import { UsageTrendsChart } from "@/components/admin/UsageTrendsChart";
import { TodaysActivityCard } from "@/components/admin/TodaysActivityCard";
import { UserSearchList } from "@/components/admin/UserSearchList";

export default async function AdminDashboard() {
  // Enforce admin access (redirects non-admin to /unauthorized)
  await requireAdminAccess();

  // Fetch all metrics in parallel for fast page load
  const [systemMetrics, jobStats, usageTrends, systemHealth] =
    await Promise.all([
      getSystemMetrics(),
      getJobStatistics(30),
      getUsageTrends(30),
      getSystemHealth(),
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
      </div>
    </div>
  );
}
