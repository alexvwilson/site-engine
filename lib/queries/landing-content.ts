import { db } from "@/lib/drizzle/db";
import { landingFaqs, landingFeatures } from "@/lib/drizzle/schema";
import { eq, asc } from "drizzle-orm";

/**
 * Get active FAQs for public landing page (ordered by display_order).
 * Used by the FAQSection component.
 */
export async function getActiveFaqs() {
  return db
    .select()
    .from(landingFaqs)
    .where(eq(landingFaqs.is_active, true))
    .orderBy(asc(landingFaqs.display_order));
}

/**
 * Get all FAQs for admin management (including inactive).
 * Used by the FAQManager admin component.
 */
export async function getAllFaqs() {
  return db
    .select()
    .from(landingFaqs)
    .orderBy(asc(landingFaqs.display_order));
}

/**
 * Get active features for public landing page (ordered by display_order).
 * Used by the FeaturesSection component.
 */
export async function getActiveFeatures() {
  return db
    .select()
    .from(landingFeatures)
    .where(eq(landingFeatures.is_active, true))
    .orderBy(asc(landingFeatures.display_order));
}

/**
 * Get all features for admin management (including inactive).
 * Used by the FeatureManager admin component.
 */
export async function getAllFeatures() {
  return db
    .select()
    .from(landingFeatures)
    .orderBy(asc(landingFeatures.display_order));
}
