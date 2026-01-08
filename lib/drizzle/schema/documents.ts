import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { sites } from "./sites";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    storage_path: text("storage_path").notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    // URL-friendly slug for public access (e.g., "my-resume" for /docs/my-resume)
    slug: text("slug").notNull(),
    file_size: integer("file_size"),
    mime_type: text("mime_type"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("documents_site_id_idx").on(t.site_id),
    index("documents_created_at_idx").on(t.created_at),
    unique("documents_storage_path_unique").on(t.site_id, t.storage_path),
    unique("documents_slug_unique").on(t.site_id, t.slug),
  ]
);

export type DocumentRecord = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;
