"use server";
import { logger } from "@/lib/logger";

import { requireAdminAccess } from "@/lib/auth";
import { getUserList } from "@/lib/admin";

/**
 * Search users with optional email filter
 * Admin-only server action
 */
export async function searchUsers(
  searchEmail?: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{
  success: boolean;
  users?: Awaited<ReturnType<typeof getUserList>>;
  error?: string;
}> {
  try {
    await requireAdminAccess();
    const users = await getUserList(searchEmail, limit, offset);
    return { success: true, users };
  } catch (error) {
    logger.error("Error searching users:", error);
    return { success: false, error: "Failed to search users" };
  }
}
