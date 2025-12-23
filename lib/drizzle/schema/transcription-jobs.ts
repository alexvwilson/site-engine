import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
  bigint,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

import { users } from "./users";

// Enums for transcription jobs
export const fileTypeEnum = pgEnum("file_type", ["audio", "video"]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const timestampGranularityEnum = pgEnum("timestamp_granularity", [
  "segment",
  "word",
]);

// Transcription jobs table - tracks file uploads and processing status
export const transcriptionJobs = pgTable(
  "transcription_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // File information
    file_name: text("file_name").notNull(),
    original_file_url: text("original_file_url").notNull(), // Supabase Storage path
    file_size_bytes: bigint("file_size_bytes", { mode: "number" }).notNull(),
    file_type: fileTypeEnum("file_type").notNull(), // audio or video
    file_extension: text("file_extension").notNull(), // mp3, mp4, wav, mov, m4a

    // Job status and progress
    status: jobStatusEnum("status").notNull().default("pending"),
    progress_percentage: integer("progress_percentage").notNull().default(0), // 0-100
    error_message: text("error_message"), // Nullable - only set if status is failed

    // Audio/transcription metadata
    duration_seconds: integer("duration_seconds"), // Nullable until processing starts
    language: text("language"), // User-selected language or 'auto'
    detected_language: text("detected_language"), // Whisper's detected language
    timestamp_granularity: timestampGranularityEnum(
      "timestamp_granularity",
    ).notNull(),

    // Background job reference
    trigger_job_id: text("trigger_job_id"), // Reference to Trigger.dev job

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completed_at: timestamp("completed_at", { withTimezone: true }), // Nullable until completed
  },
  (table) => [
    index("transcription_jobs_user_id_idx").on(table.user_id),
    index("transcription_jobs_status_idx").on(table.status),
    index("transcription_jobs_created_at_idx").on(table.created_at),
  ],
);

// TypeScript types
export type TranscriptionJob = InferSelectModel<typeof transcriptionJobs>;
export type NewTranscriptionJob = typeof transcriptionJobs.$inferInsert;
