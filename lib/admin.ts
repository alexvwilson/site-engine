import { db } from "@/lib/drizzle/db";
import { users } from "@/lib/drizzle/schema";
import { sql, and, count, desc, like } from "drizzle-orm";

// Type definitions for admin metrics
export interface SystemMetrics {
  totalUsers: number;
  totalSites: number;
  publishedSites: number;
  draftSites: number;
  // Legacy fields kept for component compatibility (will be updated in future phases)
  totalJobsAllTime: number;
  totalJobsToday: number;
  activeJobs: number;
  totalMinutesThisMonth: number;
  totalStorageBytes: number;
  jobSuccessRate: number;
  jobFailureRate: number;
}

export interface JobStatistic {
  date: string;
  total: number;
  completed: number;
  failed: number;
}

export interface UsageTrend {
  date: string;
  minutesTranscribed: number;
}

export interface SystemHealth {
  queueStatus: "healthy" | "warning" | "critical";
  queueWaitTimeMinutes: number;
  errorRate: number;
  errorSpike: boolean;
  lastHourCompleted: number;
  lastHourFailed: number;
  lastHourProcessing: number;
  lastHourTotal: number;
}

export interface UserListItem {
  id: string;
  email: string;
  fullName: string | null;
  joinedAt: Date;
}

/**
 * Get comprehensive system metrics for admin dashboard
 * Updated for Site Engine - now tracks sites instead of transcription jobs
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  // Query site and user counts
  const metricsQuery = sql`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM sites) AS total_sites,
      (SELECT COUNT(*) FROM sites WHERE status = 'published') AS published_sites,
      (SELECT COUNT(*) FROM sites WHERE status = 'draft') AS draft_sites
  `;

  const metricsResult = await db.execute(metricsQuery);

  const metrics = metricsResult[0] as {
    total_users: number;
    total_sites: number;
    published_sites: number;
    draft_sites: number;
  };

  return {
    totalUsers: Number(metrics.total_users),
    totalSites: Number(metrics.total_sites),
    publishedSites: Number(metrics.published_sites),
    draftSites: Number(metrics.draft_sites),
    // Legacy fields - return zeros for now (components will be updated in future phases)
    totalJobsAllTime: 0,
    totalJobsToday: 0,
    activeJobs: 0,
    totalMinutesThisMonth: 0,
    totalStorageBytes: 0,
    jobSuccessRate: 100,
    jobFailureRate: 0,
  };
}

/**
 * Get job processing statistics for the last N days
 * Returns placeholder data - will be updated for site analytics in future phases
 */
export async function getJobStatistics(days: number): Promise<JobStatistic[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Return placeholder data for compatibility
  const statistics: JobStatistic[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    statistics.push({
      date: dateStr,
      total: 0,
      completed: 0,
      failed: 0,
    });
  }

  return statistics;
}

/**
 * Get usage trends for the last N days
 * Returns placeholder data - will be updated for site analytics in future phases
 */
export async function getUsageTrends(days: number): Promise<UsageTrend[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Return placeholder data for compatibility
  const trends: UsageTrend[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    trends.push({
      date: dateStr,
      minutesTranscribed: 0,
    });
  }

  return trends;
}

/**
 * Get system health indicators
 * Returns healthy status - will be updated for site-related health checks in future phases
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  return {
    queueStatus: "healthy",
    queueWaitTimeMinutes: 0,
    errorRate: 0,
    errorSpike: false,
    lastHourCompleted: 0,
    lastHourFailed: 0,
    lastHourProcessing: 0,
    lastHourTotal: 0,
  };
}

/**
 * Get paginated user list with optional email search
 * Returns basic user information only
 */
export async function getUserList(
  searchEmail?: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ users: UserListItem[]; total: number }> {
  // Build where conditions
  const conditions = [];
  if (searchEmail) {
    conditions.push(like(users.email, `%${searchEmail}%`));
  }

  // Query users with email filter
  const userQuery = db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.full_name,
      createdAt: users.created_at,
    })
    .from(users);

  if (conditions.length > 0) {
    userQuery.where(and(...conditions));
  }

  const [allMatchingUsers, totalCountResult] = await Promise.all([
    userQuery.orderBy(desc(users.created_at)).limit(limit).offset(offset),
    db
      .select({ count: count() })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  const total = totalCountResult[0].count;

  const userListItems: UserListItem[] = allMatchingUsers.map((user) => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    joinedAt: user.createdAt,
  }));

  return {
    users: userListItems,
    total,
  };
}
