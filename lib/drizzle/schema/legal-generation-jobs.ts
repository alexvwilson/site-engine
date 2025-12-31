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

export const LEGAL_JOB_STATUSES = [
  "pending",
  "generating",
  "completed",
  "failed",
] as const;
export type LegalJobStatus = (typeof LEGAL_JOB_STATUSES)[number];

export const BUSINESS_TYPES = [
  "ecommerce",
  "blog",
  "saas",
  "portfolio",
  "service",
  "other",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const DATA_COLLECTION_TYPES = [
  "contact_forms",
  "analytics",
  "cookies",
  "user_accounts",
  "payments",
] as const;
export type DataCollectionType = (typeof DATA_COLLECTION_TYPES)[number];

export const JURISDICTIONS = [
  "us",
  "eu_gdpr",
  "uk",
  "canada",
  "australia",
  "other",
] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];

export const LEGAL_PAGE_TYPES = ["privacy", "terms", "cookies"] as const;
export type LegalPageType = (typeof LEGAL_PAGE_TYPES)[number];

export interface LegalGeneratedContent {
  privacy?: string;
  terms?: string;
  cookies?: string;
}

export interface LegalCreatedPageIds {
  privacy?: string;
  terms?: string;
  cookies?: string;
}

export const legalGenerationJobs = pgTable(
  "legal_generation_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: LEGAL_JOB_STATUSES })
      .notNull()
      .default("pending"),
    progress_percentage: integer("progress_percentage").notNull().default(0),

    // Input configuration
    business_type: text("business_type", { enum: BUSINESS_TYPES }).notNull(),
    data_collection: jsonb("data_collection")
      .$type<DataCollectionType[]>()
      .notNull(),
    jurisdiction: text("jurisdiction", { enum: JURISDICTIONS }).notNull(),
    pages_to_generate: jsonb("pages_to_generate")
      .$type<LegalPageType[]>()
      .notNull(),

    // Output
    generated_content: jsonb("generated_content").$type<LegalGeneratedContent>(),
    created_page_ids: jsonb("created_page_ids").$type<LegalCreatedPageIds>(),

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
    index("legal_generation_jobs_site_id_idx").on(t.site_id),
    index("legal_generation_jobs_user_id_idx").on(t.user_id),
    index("legal_generation_jobs_status_idx").on(t.status),
  ]
);

export type LegalGenerationJob = InferSelectModel<typeof legalGenerationJobs>;
export type NewLegalGenerationJob = InferInsertModel<typeof legalGenerationJobs>;
