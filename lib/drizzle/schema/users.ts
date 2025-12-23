import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

// Role constants - single source of truth
export const USER_ROLES = ["member", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Users table - for application user data (references auth.users.id)
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(), // References auth.users.id from Supabase
    email: text("email").notNull().unique(), // Synced from auth.users
    full_name: text("full_name"),

    // Metadata
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Role-based access control
    role: text("role", {
      enum: USER_ROLES,
    })
      .default("member")
      .notNull(),
  },
  (t) => [
    // Add index for role-based queries
    index("role_idx").on(t.role),
    // Add index for time-based queries (needed for admin dashboard)
    index("created_at_idx").on(t.created_at),
  ]
);

// TypeScript types
export type User = InferSelectModel<typeof users>;
export type UpdateUser = Partial<User>;

// Role-related types
export type AdminUser = User & { role: "admin" };
