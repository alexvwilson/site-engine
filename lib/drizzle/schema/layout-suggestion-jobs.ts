/**
 * Layout Suggestion Jobs Schema
 *
 * Tracks AI-powered layout suggestion requests for pages.
 * Users describe their page purpose and receive section recommendations.
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { pages } from "./pages";
import type { BlockType } from "./sections";

// ============================================================================
// Enums
// ============================================================================

export const layoutJobStatusEnum = pgEnum("layout_job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

// ============================================================================
// Types
// ============================================================================

export interface LayoutSuggestion {
  blockType: BlockType;
  rationale: string;
  suggestedContent: Record<string, unknown>;
}

// ============================================================================
// Table Definition
// ============================================================================

export const layoutSuggestionJobs = pgTable(
  "layout_suggestion_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    page_id: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: layoutJobStatusEnum("status").notNull().default("pending"),
    progress_percentage: integer("progress_percentage").notNull().default(0),
    error_message: text("error_message"),
    trigger_run_id: text("trigger_run_id"),
    description: text("description").notNull(),
    suggestions: jsonb("suggestions").$type<LayoutSuggestion[]>(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_layout_jobs_page_id").on(table.page_id),
    index("idx_layout_jobs_user_id").on(table.user_id),
  ]
);

// ============================================================================
// Inferred Types
// ============================================================================

export type LayoutSuggestionJob = typeof layoutSuggestionJobs.$inferSelect;
export type NewLayoutSuggestionJob = typeof layoutSuggestionJobs.$inferInsert;
export type LayoutJobStatus = (typeof layoutJobStatusEnum.enumValues)[number];
