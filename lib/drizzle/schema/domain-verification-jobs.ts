/**
 * Domain Verification Jobs Schema
 *
 * Tracks background domain verification polling for custom domains.
 * Each job polls Vercel API to check DNS verification status.
 */

import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  integer,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";

// ============================================================================
// Enums
// ============================================================================

/**
 * Domain verification job statuses.
 * - pending: Job created, not yet started
 * - verifying: Actively polling Vercel API
 * - completed: Domain verified successfully
 * - failed: Verification timed out or error occurred
 */
export const DOMAIN_JOB_STATUSES = [
  "pending",
  "verifying",
  "completed",
  "failed",
] as const;
export type DomainJobStatus = (typeof DOMAIN_JOB_STATUSES)[number];

// ============================================================================
// Table Definition
// ============================================================================

export const domainVerificationJobs = pgTable(
  "domain_verification_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Ownership
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Domain being verified
    domain: text("domain").notNull(),

    // Job status
    status: text("status", { enum: DOMAIN_JOB_STATUSES })
      .notNull()
      .default("pending"),

    // Polling configuration
    verification_attempts: integer("verification_attempts").notNull().default(0),
    max_attempts: integer("max_attempts").notNull().default(20),

    // Tracking
    last_check_at: timestamp("last_check_at", { withTimezone: true }),
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
    index("domain_verification_jobs_site_id_idx").on(t.site_id),
    index("domain_verification_jobs_user_id_idx").on(t.user_id),
    index("domain_verification_jobs_status_idx").on(t.status),
  ]
);

// ============================================================================
// Type Exports
// ============================================================================

export type DomainVerificationJob = InferSelectModel<
  typeof domainVerificationJobs
>;
export type NewDomainVerificationJob = InferInsertModel<
  typeof domainVerificationJobs
>;
