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

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name"),
    company: text("company"),
    phone: text("phone"),
    submitted_at: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("contact_submissions_site_id_idx").on(t.site_id),
    index("contact_submissions_email_idx").on(t.email),
    unique("contact_submissions_site_email_unique").on(t.site_id, t.email),
  ]
);

export type ContactSubmission = InferSelectModel<typeof contactSubmissions>;
export type NewContactSubmission = InferInsertModel<typeof contactSubmissions>;
