/**
 * User Role Utilities
 *
 * Centralized utilities for user role checking and permissions.
 */

import type { UserRole } from "@/lib/drizzle/schema/users";

/**
 * Check if a user role is admin
 *
 * @param role - The user role to check
 * @returns true if the role is admin, false otherwise
 */
export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}
