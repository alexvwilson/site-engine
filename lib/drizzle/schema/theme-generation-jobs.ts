/**
 * Theme Generation Jobs Schema
 *
 * Tracks AI theme generation jobs with multi-stage progress.
 * Supports both Quick Generate (single AI call) and Guided Generate (multi-stage with human checkpoints).
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
import type {
  ThemeRequirements,
  ColorPalette,
  TypographySettings,
  ComponentStyles,
  ThemeData,
} from "./theme-types";

// ============================================================================
// Enums
// ============================================================================

/**
 * Theme generation modes.
 * - quick: Single AI call generates complete theme
 * - guided: Multi-stage with human approval at each step
 */
export const THEME_JOB_MODES = ["quick", "guided"] as const;
export type ThemeJobMode = (typeof THEME_JOB_MODES)[number];

/**
 * Theme generation job statuses.
 * Tracks progress through the generation pipeline.
 */
export const THEME_JOB_STATUSES = [
  "pending",
  "generating_colors",
  "awaiting_color_approval",
  "generating_typography",
  "awaiting_typography_approval",
  "generating_components",
  "awaiting_styles_approval",
  "finalizing",
  "completed",
  "failed",
] as const;
export type ThemeJobStatus = (typeof THEME_JOB_STATUSES)[number];

/**
 * Theme generation stages (for guided mode).
 * Each stage produces intermediate results that can be reviewed.
 */
export const THEME_STAGES = [
  "colors",
  "typography",
  "components",
  "finalizing",
] as const;
export type ThemeStage = (typeof THEME_STAGES)[number];

// ============================================================================
// Table Definition
// ============================================================================

export const themeGenerationJobs = pgTable(
  "theme_generation_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Ownership
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Job configuration
    mode: text("mode", { enum: THEME_JOB_MODES }).notNull(),
    status: text("status", { enum: THEME_JOB_STATUSES })
      .notNull()
      .default("pending"),
    stage: text("stage", { enum: THEME_STAGES }),

    // User input
    requirements: jsonb("requirements").$type<ThemeRequirements>().notNull(),

    // Stage outputs (populated as generation progresses)
    color_data: jsonb("color_data").$type<ColorPalette>(),
    typography_data: jsonb("typography_data").$type<TypographySettings>(),
    component_data: jsonb("component_data").$type<ComponentStyles>(),
    final_theme_data: jsonb("final_theme_data").$type<ThemeData>(),

    // AI provider info
    ai_provider: text("ai_provider").notNull(),
    ai_model: text("ai_model").notNull(),

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
    index("theme_generation_jobs_site_id_idx").on(t.site_id),
    index("theme_generation_jobs_user_id_idx").on(t.user_id),
    index("theme_generation_jobs_status_idx").on(t.status),
    index("theme_generation_jobs_created_at_idx").on(t.created_at),
  ]
);

// ============================================================================
// Type Exports
// ============================================================================

export type ThemeGenerationJob = InferSelectModel<typeof themeGenerationJobs>;
export type NewThemeGenerationJob = InferInsertModel<typeof themeGenerationJobs>;
