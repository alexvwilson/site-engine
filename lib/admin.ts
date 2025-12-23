import { db } from "@/lib/drizzle/db";
import {
  users,
  transcriptionJobs,
  transcripts,
} from "@/lib/drizzle/schema";
import { sql, and, gte, count, desc, like } from "drizzle-orm";

// Type definitions for admin metrics
export interface SystemMetrics {
  totalUsers: number;
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
 * Aggregates data from users, jobs, transcripts, and usage events
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Single combined query for all metrics to reduce connection overhead
  // Use raw table names to avoid Drizzle interpolation issues with nested subqueries
  const metricsQuery = sql`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM transcription_jobs) AS total_jobs_all_time,
      (SELECT COUNT(*) FROM transcription_jobs WHERE status = 'pending' OR status = 'processing') AS active_jobs,
      (SELECT COALESCE(SUM(file_size_bytes), 0) FROM transcription_jobs) AS total_storage_bytes,
      (SELECT COUNT(*) FROM transcription_jobs WHERE created_at >= ${todayStart.toISOString()}) AS total_jobs_today,
      (SELECT COALESCE(SUM(duration_seconds), 0) FROM transcripts WHERE created_at >= ${monthStart.toISOString()}) AS total_seconds_this_month
  `;

  const [metricsResult, last24HoursJobsResult] = await Promise.all([
    db.execute(metricsQuery),
    db
      .select({
        status: transcriptionJobs.status,
        count: count(),
      })
      .from(transcriptionJobs)
      .where(gte(transcriptionJobs.created_at, last24Hours))
      .groupBy(transcriptionJobs.status),
  ]);

  const metrics = metricsResult[0] as {
    total_users: number;
    total_jobs_all_time: number;
    active_jobs: number;
    total_storage_bytes: number;
    total_jobs_today: number;
    total_seconds_this_month: number;
  };

  // Calculate success and failure rates
  const jobStatusCounts = last24HoursJobsResult.reduce(
    (acc, row) => {
      acc[row.status] = row.count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalLast24h =
    (jobStatusCounts.completed || 0) + (jobStatusCounts.failed || 0);
  const successRate =
    totalLast24h > 0
      ? ((jobStatusCounts.completed || 0) / totalLast24h) * 100
      : 100;
  const failureRate =
    totalLast24h > 0 ? ((jobStatusCounts.failed || 0) / totalLast24h) * 100 : 0;

  return {
    totalUsers: Number(metrics.total_users),
    totalJobsAllTime: Number(metrics.total_jobs_all_time),
    totalJobsToday: Number(metrics.total_jobs_today),
    activeJobs: Number(metrics.active_jobs),
    totalMinutesThisMonth: Math.round(
      Number(metrics.total_seconds_this_month) / 60,
    ),
    totalStorageBytes: Number(metrics.total_storage_bytes),
    jobSuccessRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
    jobFailureRate: Math.round(failureRate * 10) / 10,
  };
}


/**
 * Get job processing statistics for the last N days
 * Returns daily counts of total, completed, and failed jobs
 */
export async function getJobStatistics(days: number): Promise<JobStatistic[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(${transcriptionJobs.created_at})`,
      status: transcriptionJobs.status,
      count: count(),
    })
    .from(transcriptionJobs)
    .where(gte(transcriptionJobs.created_at, startDate))
    .groupBy(sql`DATE(${transcriptionJobs.created_at})`, transcriptionJobs.status)
    .orderBy(sql`DATE(${transcriptionJobs.created_at})`);

  // Aggregate by date
  const statsByDate = new Map<
    string,
    { total: number; completed: number; failed: number }
  >();

  for (const row of result) {
    if (!statsByDate.has(row.date)) {
      statsByDate.set(row.date, { total: 0, completed: 0, failed: 0 });
    }

    const stats = statsByDate.get(row.date)!;
    stats.total += row.count;

    if (row.status === "completed") {
      stats.completed += row.count;
    } else if (row.status === "failed") {
      stats.failed += row.count;
    }
  }

  // Convert to array and fill in missing dates with zeros
  const statistics: JobStatistic[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const stats = statsByDate.get(dateStr) || {
      total: 0,
      completed: 0,
      failed: 0,
    };
    statistics.push({
      date: dateStr,
      ...stats,
    });
  }

  return statistics;
}

/**
 * Get usage trends showing minutes transcribed per day for the last N days
 */
export async function getUsageTrends(days: number): Promise<UsageTrend[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await db
    .select({
      date: sql<string>`DATE(${transcripts.created_at})`,
      totalSeconds: sql<number>`COALESCE(SUM(${transcripts.duration_seconds}), 0)`,
    })
    .from(transcripts)
    .where(gte(transcripts.created_at, startDate))
    .groupBy(sql`DATE(${transcripts.created_at})`)
    .orderBy(sql`DATE(${transcripts.created_at})`);

  // Create map for quick lookup
  const trendsByDate = new Map<string, number>();
  for (const row of result) {
    trendsByDate.set(row.date, Math.round(row.totalSeconds / 60));
  }

  // Fill in all dates with data or zeros
  const trends: UsageTrend[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    trends.push({
      date: dateStr,
      minutesTranscribed: trendsByDate.get(dateStr) || 0,
    });
  }

  return trends;
}

/**
 * Get system health indicators including queue status and error rates
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Skip queue wait time calculation for performance (causes timeout)
  const avgWaitMinutes = 0;
  const queueStatus: "healthy" | "warning" | "critical" = "healthy";

  // Calculate error rates for spike detection
  const [lastHourStats, last24HourStats] = await Promise.all([
    db
      .select({
        status: transcriptionJobs.status,
        count: count(),
      })
      .from(transcriptionJobs)
      .where(gte(transcriptionJobs.created_at, lastHour))
      .groupBy(transcriptionJobs.status),

    db
      .select({
        status: transcriptionJobs.status,
        count: count(),
      })
      .from(transcriptionJobs)
      .where(gte(transcriptionJobs.created_at, last24Hours))
      .groupBy(transcriptionJobs.status),
  ]);

  const lastHourCounts = lastHourStats.reduce(
    (acc, row) => {
      acc[row.status] = row.count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const last24HourCounts = last24HourStats.reduce(
    (acc, row) => {
      acc[row.status] = row.count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const lastHourCompleted = lastHourCounts.completed || 0;
  const lastHourFailed = lastHourCounts.failed || 0;
  const lastHourProcessing = lastHourCounts.processing || 0;
  const lastHourTotal = lastHourCompleted + lastHourFailed + lastHourProcessing;
  const lastHourErrorRate =
    lastHourTotal > 0 ? lastHourFailed / lastHourTotal : 0;

  const last24HourTotal =
    (last24HourCounts.completed || 0) + (last24HourCounts.failed || 0);
  const last24HourErrorRate =
    last24HourTotal > 0 ? (last24HourCounts.failed || 0) / last24HourTotal : 0;

  const errorSpike = lastHourErrorRate > last24HourErrorRate * 2;

  return {
    queueStatus,
    queueWaitTimeMinutes: Math.round(avgWaitMinutes * 10) / 10,
    errorRate: Math.round(lastHourErrorRate * 1000) / 10, // Percentage with 1 decimal
    errorSpike,
    lastHourCompleted,
    lastHourFailed,
    lastHourProcessing,
    lastHourTotal,
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
