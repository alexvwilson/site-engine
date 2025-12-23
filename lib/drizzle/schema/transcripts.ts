import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

import { transcriptionJobs } from "./transcription-jobs";
import { users } from "./users";

// Transcripts table - stores completed transcription results in multiple formats
export const transcripts = pgTable(
  "transcripts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    job_id: uuid("job_id")
      .notNull()
      .references(() => transcriptionJobs.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Transcript content in various formats
    transcript_text_plain: text("transcript_text_plain").notNull(), // Plain text format
    transcript_srt: text("transcript_srt").notNull(), // SRT subtitle format
    transcript_vtt: text("transcript_vtt").notNull(), // WebVTT format
    transcript_json: jsonb("transcript_json").notNull(), // JSON format with segments
    transcript_verbose_json: jsonb("transcript_verbose_json"), // Verbose JSON (Pro tier only)
    word_timestamps: jsonb("word_timestamps"), // Word-level timestamps (Creator/Pro)

    // Metadata
    detected_language: text("detected_language").notNull(),
    duration_seconds: integer("duration_seconds").notNull(),

    // Timestamp
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Unique constraint: one transcript per job
    unique("transcripts_job_id_unique").on(table.job_id),
    index("transcripts_user_id_idx").on(table.user_id),
    index("transcripts_created_at_idx").on(table.created_at),
  ],
);

// TypeScript types
export type Transcript = InferSelectModel<typeof transcripts>;
export type NewTranscript = typeof transcripts.$inferInsert;
