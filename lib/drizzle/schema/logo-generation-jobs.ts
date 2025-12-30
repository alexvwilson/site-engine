/**
 * Logo Generation Jobs Schema
 *
 * Tracks AI logo prompt generation jobs with progress tracking.
 * Generates ChatGPT-ready prompts based on site context and brand personality.
 */

import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";

// ============================================================================
// Enums
// ============================================================================

export const LOGO_JOB_STATUSES = ["pending", "generating", "completed", "failed"] as const;
export type LogoJobStatus = (typeof LOGO_JOB_STATUSES)[number];

// ============================================================================
// Output Types
// ============================================================================

/**
 * A single logo concept with prompt and metadata.
 */
export interface LogoConcept {
  id: number;
  category: "decomposed" | "monogram" | "snapai";
  prompt: string;
  description: string;
  recommendation?: "top" | "alternative" | "safe";
}

/**
 * Complete output from logo generation including all concepts.
 */
export interface LogoGenerationOutput {
  concepts: LogoConcept[];
  appContext: string;
}

// ============================================================================
// Table Definition
// ============================================================================

export const logoGenerationJobs = pgTable(
  "logo_generation_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Ownership
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Job status
    status: text("status", { enum: LOGO_JOB_STATUSES })
      .notNull()
      .default("pending"),

    // Input context (captured at generation time)
    site_name: text("site_name").notNull(),
    site_description: text("site_description"),
    brand_personality: text("brand_personality"),
    primary_color: text("primary_color"),

    // Output - array of 10 concepts with recommendations
    generated_concepts: jsonb("generated_concepts").$type<LogoGenerationOutput>(),

    // Progress tracking
    progress_percentage: integer("progress_percentage").notNull().default(0),
    error_message: text("error_message"),

    // Trigger.dev integration
    trigger_run_id: text("trigger_run_id"),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("logo_generation_jobs_site_id_idx").on(t.site_id),
    index("logo_generation_jobs_user_id_idx").on(t.user_id),
    index("logo_generation_jobs_status_idx").on(t.status),
  ]
);

// ============================================================================
// Type Exports
// ============================================================================

export type LogoGenerationJob = InferSelectModel<typeof logoGenerationJobs>;
export type NewLogoGenerationJob = InferInsertModel<typeof logoGenerationJobs>;
