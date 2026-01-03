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

export const imageAlbums = pgTable(
  "image_albums",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    display_order: integer("display_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("image_albums_site_id_idx").on(t.site_id),
    index("image_albums_display_order_idx").on(t.display_order),
    unique("image_albums_site_name_unique").on(t.site_id, t.name),
  ]
);

export type ImageAlbum = InferSelectModel<typeof imageAlbums>;
export type NewImageAlbum = InferInsertModel<typeof imageAlbums>;
