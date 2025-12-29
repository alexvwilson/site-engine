import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  unique,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { sites } from "./sites";

export const blogCategories = pgTable(
  "blog_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("blog_categories_site_id_idx").on(t.site_id),
    unique("blog_categories_site_slug_unique").on(t.site_id, t.slug),
  ]
);

export type BlogCategory = InferSelectModel<typeof blogCategories>;
export type NewBlogCategory = InferInsertModel<typeof blogCategories>;
