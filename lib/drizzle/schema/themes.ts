/**
 * Themes Schema
 *
 * Stores saved theme versions for sites.
 * Each site can have multiple saved themes, with one marked as active.
 * Active theme enforcement is handled at the application layer.
 */

import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";
import { themeGenerationJobs } from "./theme-generation-jobs";
import type { ThemeData } from "./theme-types";

// ============================================================================
// Table Definition
// ============================================================================

export const themes = pgTable(
  "themes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Ownership
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Optional reference to generation job (null for manually created themes)
    generation_job_id: uuid("generation_job_id").references(
      () => themeGenerationJobs.id,
      { onDelete: "set null" }
    ),

    // Theme metadata
    name: text("name").notNull(),
    is_active: boolean("is_active").notNull().default(false),

    // Theme data (complete theme configuration)
    data: jsonb("data").$type<ThemeData>().notNull(),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("themes_site_id_idx").on(t.site_id),
    index("themes_user_id_idx").on(t.user_id),
    index("themes_is_active_idx").on(t.is_active),
    index("themes_generation_job_id_idx").on(t.generation_job_id),
  ]
);

// ============================================================================
// Type Exports
// ============================================================================

export type Theme = InferSelectModel<typeof themes>;
export type NewTheme = InferInsertModel<typeof themes>;
