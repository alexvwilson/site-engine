import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";

export const PAGE_STATUSES = ["draft", "published"] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    status: text("status", { enum: PAGE_STATUSES }).notNull().default("draft"),
    is_home: boolean("is_home").notNull().default(false),
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    published_at: timestamp("published_at", { withTimezone: true }),
    display_order: integer("display_order").notNull().default(0),
  },
  (t) => [
    index("pages_site_id_idx").on(t.site_id),
    index("pages_user_id_idx").on(t.user_id),
    index("pages_status_idx").on(t.status),
    unique("pages_site_slug_unique").on(t.site_id, t.slug),
  ]
);

export type Page = InferSelectModel<typeof pages>;
export type NewPage = InferInsertModel<typeof pages>;
