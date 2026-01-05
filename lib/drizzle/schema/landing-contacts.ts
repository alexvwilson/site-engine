import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Landing page contacts - stores interested users who submit the landing page contact form.
 * Only stores name, email, company (NOT messages) for contact list purposes.
 * Email is unique - subsequent submissions update existing contact.
 */
export const landingContacts = pgTable(
  "landing_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    company: varchar("company", { length: 255 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_landing_contacts_email").on(table.email)]
);

export type LandingContact = typeof landingContacts.$inferSelect;
export type NewLandingContact = typeof landingContacts.$inferInsert;
