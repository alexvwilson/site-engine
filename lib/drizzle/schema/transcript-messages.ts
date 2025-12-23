import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { InferSelectModel } from "drizzle-orm";
import { transcriptConversations } from "./transcript-conversations";

export const transcriptMessageSenderEnum = pgEnum("transcript_message_sender", [
  "user",
  "assistant",
]);

export const transcriptMessageStatusEnum = pgEnum("transcript_message_status", [
  "success",
  "error",
]);

export const transcriptMessages = pgTable(
  "transcript_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transcript_conversation_id: uuid("transcript_conversation_id")
      .notNull()
      .references(() => transcriptConversations.id, { onDelete: "cascade" }),
    sender: transcriptMessageSenderEnum("sender").notNull(),
    content: text("content").notNull(),
    status: transcriptMessageStatusEnum("status").notNull().default("success"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("transcript_messages_conversation_id_idx").on(
      table.transcript_conversation_id,
    ),
    index("transcript_messages_status_idx").on(table.status),
  ],
);

export const insertTranscriptMessageSchema =
  createInsertSchema(transcriptMessages);
export const selectTranscriptMessageSchema =
  createSelectSchema(transcriptMessages);

export type TranscriptMessage = InferSelectModel<typeof transcriptMessages>;
export type NewTranscriptMessage = typeof transcriptMessages.$inferInsert;
