import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Landing page FAQ items - managed by admins via dashboard.
 * Displayed on the public landing page in the FAQ section.
 */
export const landingFaqs = pgTable(
  "landing_faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: varchar("question", { length: 500 }).notNull(),
    answer: text("answer").notNull(),
    display_order: integer("display_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_landing_faqs_order").on(table.display_order),
    index("idx_landing_faqs_active").on(table.is_active),
  ]
);

/**
 * Landing page feature items - managed by admins via dashboard.
 * Displayed on the public landing page in the Features section.
 */
export const landingFeatures = pgTable(
  "landing_features",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    icon_name: varchar("icon_name", { length: 50 }).notNull().default("sparkles"),
    display_order: integer("display_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_landing_features_order").on(table.display_order),
    index("idx_landing_features_active").on(table.is_active),
  ]
);

export type LandingFaq = typeof landingFaqs.$inferSelect;
export type NewLandingFaq = typeof landingFaqs.$inferInsert;
export type LandingFeature = typeof landingFeatures.$inferSelect;
export type NewLandingFeature = typeof landingFeatures.$inferInsert;
