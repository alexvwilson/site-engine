import { pgTable, text, timestamp, uuid, index, jsonb, boolean } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import type { HeaderContent, FooterContent } from "@/lib/section-types";

export const SITE_STATUSES = ["draft", "published"] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

export const COLOR_MODES = ["light", "dark", "system", "user_choice"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    status: text("status", { enum: SITE_STATUSES }).notNull().default("draft"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    published_at: timestamp("published_at", { withTimezone: true }),
    custom_domain: text("custom_domain").unique(),
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    color_mode: text("color_mode", { enum: COLOR_MODES }).notNull().default("light"),
    // Site-level header configuration (shared across all pages)
    header_content: jsonb("header_content").$type<HeaderContent>(),
    // Site-level footer configuration (shared across all pages)
    footer_content: jsonb("footer_content").$type<FooterContent>(),
    // Under construction mode - show Coming Soon page to public visitors
    under_construction: boolean("under_construction").notNull().default(false),
    construction_title: text("construction_title"),
    construction_description: text("construction_description"),
    // Blog settings
    show_blog_author: boolean("show_blog_author").notNull().default(true),
  },
  (t) => [
    index("sites_user_id_idx").on(t.user_id),
    index("sites_slug_idx").on(t.slug),
    index("sites_status_idx").on(t.status),
    index("sites_updated_at_idx").on(t.updated_at),
    index("sites_custom_domain_idx").on(t.custom_domain),
  ]
);

export type Site = InferSelectModel<typeof sites>;
export type NewSite = InferInsertModel<typeof sites>;
