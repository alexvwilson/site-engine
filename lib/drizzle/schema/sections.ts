import {
  pgTable,
  uuid,
  integer,
  jsonb,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { pages } from "./pages";

export const BLOCK_TYPES = [
  "header",
  "heading",
  "hero",
  "richtext",
  "text",
  "markdown",
  "image",
  "gallery",
  "features",
  "cta",
  "testimonials",
  "contact",
  "footer",
  "blog_featured",
  "blog_grid",
  "embed",
  "social_links",
  "product_grid",
  "article",
  "cards",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const SECTION_STATUSES = ["draft", "published"] as const;
export type SectionStatus = (typeof SECTION_STATUSES)[number];

export const sections = pgTable(
  "sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    page_id: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    block_type: text("block_type", { enum: BLOCK_TYPES }).notNull(),
    content: jsonb("content").notNull().default({}),
    position: integer("position").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    status: text("status", { enum: SECTION_STATUSES })
      .notNull()
      .default("published"),
    anchor_id: text("anchor_id"),
  },
  (t) => [
    index("sections_page_id_idx").on(t.page_id),
    index("sections_user_id_idx").on(t.user_id),
    index("sections_page_position_idx").on(t.page_id, t.position),
    index("sections_status_idx").on(t.status),
    index("sections_page_anchor_idx").on(t.page_id, t.anchor_id),
  ]
);

export type Section = InferSelectModel<typeof sections>;
export type NewSection = InferInsertModel<typeof sections>;
