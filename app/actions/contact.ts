"use server";

import { db } from "@/lib/drizzle/db";
import { contactSubmissions } from "@/lib/drizzle/schema/contact-submissions";
import { sites } from "@/lib/drizzle/schema/sites";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendContactNotification } from "@/lib/email";

interface ContactFormData {
  name?: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  website?: string; // Honeypot field - should always be empty
}

interface SubmitResult {
  success: boolean;
  error?: string;
}

/**
 * Submit a contact form from a published site.
 * Includes honeypot and rate limiting spam protection.
 */
export async function submitContactForm(
  siteId: string,
  data: ContactFormData
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

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    return { success: false, error: "Please provide a valid email address." };
  }

  // Validate message
  if (!data.message?.trim()) {
    return { success: false, error: "Please provide a message." };
  }

  // Get site info for email notification
  const site = await db
    .select({
      name: sites.name,
      notificationEmail: sites.contact_notification_email,
    })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (!site.length) {
    return { success: false, error: "Site not found." };
  }

  // Upsert contact submission (unique by site_id + email)
  const normalizedEmail = data.email.toLowerCase().trim();

  await db
    .insert(contactSubmissions)
    .values({
      site_id: siteId,
      email: normalizedEmail,
      name: data.name?.trim() || null,
      company: data.company?.trim() || null,
      phone: data.phone?.trim() || null,
    })
    .onConflictDoUpdate({
      target: [contactSubmissions.site_id, contactSubmissions.email],
      set: {
        name: data.name?.trim() || null,
        company: data.company?.trim() || null,
        phone: data.phone?.trim() || null,
        updated_at: new Date(),
      },
    });

  // Send email notification if configured (don't block on failure)
  if (site[0].notificationEmail) {
    sendContactNotification({
      to: site[0].notificationEmail,
      siteName: site[0].name,
      contact: {
        name: data.name,
        email: normalizedEmail,
        company: data.company,
        phone: data.phone,
        message: data.message.trim(),
      },
    }).catch((error) => {
      // Log but don't fail the submission if email fails
      console.error("Email notification failed:", error);
    });
  }

  return { success: true };
}
