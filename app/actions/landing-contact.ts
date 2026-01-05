"use server";

import { db } from "@/lib/drizzle/db";
import { landingContacts } from "@/lib/drizzle/schema/landing-contacts";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendLandingContactNotification } from "@/lib/email";

interface LandingContactData {
  name: string;
  email: string;
  company?: string;
  message: string;
  website?: string; // Honeypot field - should always be empty
}

interface SubmitResult {
  success: boolean;
  error?: string;
}

/**
 * Submit a contact form from the landing page.
 * Stores contact info in database (not message) and sends email notification.
 * Includes honeypot and rate limiting spam protection.
 */
export async function submitLandingContact(
  data: LandingContactData
): Promise<SubmitResult> {
  // Honeypot check - if the hidden field is filled, a bot is submitting
  // Return success to not tip off the bot that we detected it
  if (data.website) {
    return { success: true };
  }

  // Get client IP for rate limiting
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  // Rate limit check
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return {
      success: false,
      error: "Too many submissions. Please try again later.",
    };
  }

  // Validate name
  if (!data.name?.trim()) {
    return { success: false, error: "Please provide your name." };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    return { success: false, error: "Please provide a valid email address." };
  }

  // Validate message
  if (!data.message?.trim()) {
    return { success: false, error: "Please provide a message." };
  }

  const normalizedEmail = data.email.toLowerCase().trim();

  // Upsert contact (unique by email)
  await db
    .insert(landingContacts)
    .values({
      email: normalizedEmail,
      name: data.name.trim(),
      company: data.company?.trim() || null,
    })
    .onConflictDoUpdate({
      target: [landingContacts.email],
      set: {
        name: data.name.trim(),
        company: data.company?.trim() || null,
        updated_at: new Date(),
      },
    });

  // Send email notification (don't block on failure)
  sendLandingContactNotification({
    contact: {
      name: data.name.trim(),
      email: normalizedEmail,
      company: data.company?.trim(),
      message: data.message.trim(),
    },
  }).catch((error) => {
    // Log but don't fail the submission if email fails
    console.error("Landing contact email notification failed:", error);
  });

  return { success: true };
}
