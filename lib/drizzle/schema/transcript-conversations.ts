import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";
import { transcripts } from "./transcripts";

export const transcriptConversations = pgTable(
  "transcript_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transcript_id: uuid("transcript_id")
      .notNull()
      .references(() => transcripts.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("transcript_conversations_transcript_id_idx").on(table.transcript_id),
    index("transcript_conversations_user_id_idx").on(table.user_id),
  ],
);

export const insertTranscriptConversationSchema = createInsertSchema(
  transcriptConversations,
);
export const selectTranscriptConversationSchema = createSelectSchema(
  transcriptConversations,
);

export type TranscriptConversation =
  typeof transcriptConversations.$inferSelect;
export type NewTranscriptConversation =
  typeof transcriptConversations.$inferInsert;
