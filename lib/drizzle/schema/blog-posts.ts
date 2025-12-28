import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    author_id: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    content: jsonb("content").$type<{ html: string }>(),
    featured_image: text("featured_image"),
    status: text("status", { enum: POST_STATUSES }).notNull().default("draft"),
    published_at: timestamp("published_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("blog_posts_site_id_idx").on(t.site_id),
    index("blog_posts_author_id_idx").on(t.author_id),
    index("blog_posts_status_idx").on(t.status),
    index("blog_posts_published_at_idx").on(t.published_at),
    unique("blog_posts_site_slug_unique").on(t.site_id, t.slug),
  ]
);

export type BlogPost = InferSelectModel<typeof blogPosts>;
export type NewBlogPost = InferInsertModel<typeof blogPosts>;
