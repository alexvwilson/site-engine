import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

import { transcripts } from "./transcripts";
import { users } from "./users";

// Enum for summary types (classification-based)
export const summaryTypeEnum = pgEnum("summary_type", [
  "meeting_notes",
  "youtube_video",
  "general",
]);

// AI summaries table - stores AI-generated markdown summaries for Pro users
export const aiSummaries = pgTable(
  "ai_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transcript_id: uuid("transcript_id")
      .notNull()
      .references(() => transcripts.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Summary classification and content
    summary_type: summaryTypeEnum("summary_type").notNull(),
    summary_content: text("summary_content").notNull(),

    // Timestamp
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Unique constraint: one summary per transcript
    unique("ai_summaries_transcript_id_unique").on(table.transcript_id),
    index("ai_summaries_user_id_idx").on(table.user_id),
    index("ai_summaries_type_idx").on(table.summary_type),
  ],
);

// TypeScript types
export type AiSummary = InferSelectModel<typeof aiSummaries>;
export type NewAiSummary = typeof aiSummaries.$inferInsert;
