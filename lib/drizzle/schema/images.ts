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
import { imageAlbums } from "./image-albums";

export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    album_id: uuid("album_id").references(() => imageAlbums.id, {
      onDelete: "set null",
    }),
    storage_path: text("storage_path").notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    file_size: integer("file_size"),
    mime_type: text("mime_type"),
    alt_text: text("alt_text"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("images_site_id_idx").on(t.site_id),
    index("images_album_id_idx").on(t.album_id),
    index("images_created_at_idx").on(t.created_at),
    unique("images_storage_path_unique").on(t.site_id, t.storage_path),
  ]
);

export type ImageRecord = InferSelectModel<typeof images>;
export type NewImage = InferInsertModel<typeof images>;
