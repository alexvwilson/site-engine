import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { db } from "@/lib/drizzle/db";
import { User, users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user and their role
 * @returns Promise<{user: User, isAdmin: boolean} | null>
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    // Get user data with role from our database
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (userData.length === 0) {
      return null;
    }

    const user = userData[0];
    return user;
  } catch (error) {
    logger.error("Error getting current user with role:", error);
    return null;
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

/**
 * Get current user ID - optimized for performance
 * Use when you only need user identification
 * @returns Promise<string | null> - Returns the user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    logger.error("Error in getCurrentUserId:", error);
    return null;
  }
}

/**
 * Require user ID - optimized for most common use case
 * Use this for most common authentication use case - getting the user ID
 * @returns Promise<string> - Returns the user ID
 */
export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/auth/login");
  }

  return userId;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === "admin";
}

/**
 * Require admin access - optimized version of requireAdmin
 * Checks admin status efficiently without redundant database calls
 * @returns Promise<void> - Throws or redirects if not authorized
 */
export async function requireAdminAccess(): Promise<void> {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    logger.warn(`Non-admin user attempted admin access`);
    redirect("/unauthorized");
  }
}
