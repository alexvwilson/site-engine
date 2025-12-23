"use server";
import { logger } from "@/lib/logger";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth";

export async function updateUserFullName(fullName: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userId = await requireUserId();

    // Validate full name
    const trimmedName = fullName.trim();
    if (trimmedName.length > 100) {
      return { success: false, error: "Full name must be 100 characters or less" };
    }

    // Update user's full name
    await db
      .update(users)
      .set({
        full_name: trimmedName || null, // Set to null if empty string
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    logger.error("Error updating full name:", error);
    return { success: false, error: "Failed to update full name" };
  }
}
