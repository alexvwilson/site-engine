import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";

export const SEO_JOB_STATUSES = [
  "pending",
  "analyzing",
  "completed",
  "failed",
] as const;
export type SeoJobStatus = (typeof SEO_JOB_STATUSES)[number];

export type SeoPriority = "high" | "medium" | "low";

export interface SeoRecommendation {
  id: string;
  category: "content" | "technical" | "keywords" | "meta";
  priority: SeoPriority;
  title: string;
  description: string;
  currentState?: string;
  suggestedFix: string;
  pageSlug?: string; // For page-specific recommendations
}

export interface SeoAnalysisResult {
  overallScore: number; // 0-100
  recommendations: SeoRecommendation[];
  summary: string;
  strengths: string[];
  analyzedAt: string;
}

export const seoAnalysisJobs = pgTable(
  "seo_analysis_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: SEO_JOB_STATUSES })
      .notNull()
      .default("pending"),
    progress_percentage: integer("progress_percentage").notNull().default(0),

    // Analysis result
    result: jsonb("result").$type<SeoAnalysisResult>(),

    // Error handling
    error_message: text("error_message"),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("seo_analysis_jobs_site_id_idx").on(t.site_id),
    index("seo_analysis_jobs_user_id_idx").on(t.user_id),
    index("seo_analysis_jobs_status_idx").on(t.status),
  ]
);

export type SeoAnalysisJob = InferSelectModel<typeof seoAnalysisJobs>;
export type NewSeoAnalysisJob = InferInsertModel<typeof seoAnalysisJobs>;
