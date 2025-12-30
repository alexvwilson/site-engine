"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { sites } from "@/lib/drizzle/schema/sites";
import { domainVerificationJobs } from "@/lib/drizzle/schema/domain-verification-jobs";
import { requireUserId } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk";
import {
  addDomainToProject,
  verifyDomain,
  removeDomainFromProject,
  isVercelError,
  isVercelConfigured,
} from "@/lib/vercel";
import {
  isValidDomain,
  normalizeDomain,
  formatDnsInstructions,
  type DnsInstruction,
} from "@/lib/domain-utils";
import type { verifyDomainTask } from "@/trigger/tasks/verify-domain";

// ============================================================================
// Types
// ============================================================================

export interface DomainActionResult {
  success: boolean;
  error?: string;
  verified?: boolean;
  dnsInstructions?: DnsInstruction[];
}

export interface DomainStatusResult {
  success: boolean;
  error?: string;
  domain?: string | null;
  verificationStatus?: string | null;
  sslStatus?: string | null;
  verifiedAt?: Date | null;
  challenges?: Array<{ type: string; domain: string; value: string }>;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Check if custom domain features are available
 */
export async function checkDomainFeatureAvailable(): Promise<boolean> {
  return isVercelConfigured();
}

/**
 * Add a custom domain to a site
 */
export async function addCustomDomain(
  siteId: string,
  domain: string
): Promise<DomainActionResult> {
  const userId = await requireUserId();

  // Check if Vercel is configured
  if (!isVercelConfigured()) {
    return {
      success: false,
      error: "Custom domain features are not configured. Please add VERCEL_API_TOKEN and VERCEL_PROJECT_ID.",
    };
  }

  // Validate ownership
  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  if (!site) {
    return { success: false, error: "Site not found" };
  }

  // Normalize and validate domain
  const normalizedDomain = normalizeDomain(domain);
  if (!isValidDomain(normalizedDomain)) {
    return { success: false, error: "Invalid domain format. Please enter a valid domain like example.com or www.example.com" };
  }

  // Check if domain is already used by another site
  const [existingWithDomain] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.custom_domain, normalizedDomain))
    .limit(1);

  if (existingWithDomain && existingWithDomain.id !== siteId) {
    return { success: false, error: "This domain is already in use by another site" };
  }

  // Add domain to Vercel
  const vercelResponse = await addDomainToProject(normalizedDomain);

  if (isVercelError(vercelResponse)) {
    // Handle specific Vercel errors
    if (vercelResponse.error.code === "domain_already_in_use") {
      return { success: false, error: "This domain is already in use on another Vercel project" };
    }
    if (vercelResponse.error.code === "forbidden") {
      return { success: false, error: "Unable to add domain. Check your Vercel API permissions." };
    }
    return { success: false, error: vercelResponse.error.message };
  }

  // Update site with domain info
  await db
    .update(sites)
    .set({
      custom_domain: normalizedDomain,
      domain_verification_status: vercelResponse.verified ? "verified" : "pending",
      domain_verification_challenges: vercelResponse.verification || null,
      domain_verified_at: vercelResponse.verified ? new Date() : null,
      domain_ssl_status: vercelResponse.verified ? "pending" : null,
      domain_error_message: null,
      updated_at: new Date(),
    })
    .where(eq(sites.id, siteId));

  // If not verified, start background verification polling
  if (!vercelResponse.verified) {
    const [job] = await db
      .insert(domainVerificationJobs)
      .values({
        site_id: siteId,
        user_id: userId,
        domain: normalizedDomain,
        status: "pending",
      })
      .returning();

    // Trigger background verification task
    try {
      const handle = await tasks.trigger<typeof verifyDomainTask>("verify-domain", {
        jobId: job.id,
      });

      await db
        .update(domainVerificationJobs)
        .set({ trigger_run_id: handle.id })
        .where(eq(domainVerificationJobs.id, job.id));
    } catch (error) {
      console.error("Failed to trigger verification task:", error);
      // Continue anyway - user can manually retry
    }
  }

  revalidatePath(`/app/sites/${siteId}`, "page");

  // Format DNS instructions for unverified domains
  const dnsInstructions = vercelResponse.verified
    ? undefined
    : formatDnsInstructions(
        normalizedDomain,
        (vercelResponse.verification || []).map((v) => ({
          type: v.type,
          domain: v.domain,
          value: v.value,
        }))
      );

  return {
    success: true,
    verified: vercelResponse.verified,
    dnsInstructions,
  };
}

/**
 * Manually trigger domain verification retry
 */
export async function retryDomainVerification(
  siteId: string
): Promise<DomainActionResult> {
  const userId = await requireUserId();

  // Check if Vercel is configured
  if (!isVercelConfigured()) {
    return { success: false, error: "Custom domain features are not configured" };
  }

  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  if (!site || !site.custom_domain) {
    return { success: false, error: "Site or domain not found" };
  }

  if (site.domain_verification_status === "verified") {
    return { success: true, verified: true };
  }

  // Call Vercel verify endpoint
  const vercelResponse = await verifyDomain(site.custom_domain);

  if (isVercelError(vercelResponse)) {
    return { success: false, error: vercelResponse.error.message };
  }

  if (vercelResponse.verified) {
    await db
      .update(sites)
      .set({
        domain_verification_status: "verified",
        domain_verified_at: new Date(),
        domain_ssl_status: "pending",
        domain_error_message: null,
        updated_at: new Date(),
      })
      .where(eq(sites.id, siteId));

    revalidatePath(`/app/sites/${siteId}`, "page");
    return { success: true, verified: true };
  }

  // Still not verified - update challenges and return instructions
  await db
    .update(sites)
    .set({
      domain_verification_challenges: vercelResponse.verification || null,
      updated_at: new Date(),
    })
    .where(eq(sites.id, siteId));

  revalidatePath(`/app/sites/${siteId}`, "page");

  const dnsInstructions = formatDnsInstructions(
    site.custom_domain,
    (vercelResponse.verification || []).map((v) => ({
      type: v.type,
      domain: v.domain,
      value: v.value,
    }))
  );

  return {
    success: true,
    verified: false,
    dnsInstructions,
  };
}

/**
 * Remove custom domain from a site
 */
export async function removeCustomDomain(
  siteId: string
): Promise<DomainActionResult> {
  const userId = await requireUserId();

  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  if (!site || !site.custom_domain) {
    return { success: false, error: "Site or domain not found" };
  }

  // Remove from Vercel (if configured)
  if (isVercelConfigured()) {
    try {
      const vercelResponse = await removeDomainFromProject(site.custom_domain);

      if (isVercelError(vercelResponse)) {
        // Log but continue - domain may not exist on Vercel
        console.warn("Failed to remove domain from Vercel:", vercelResponse.error);
      }
    } catch (error) {
      console.warn("Error removing domain from Vercel:", error);
    }
  }

  // Clear domain from site
  await db
    .update(sites)
    .set({
      custom_domain: null,
      domain_verification_status: null,
      domain_verification_challenges: null,
      domain_verified_at: null,
      domain_ssl_status: null,
      domain_error_message: null,
      updated_at: new Date(),
    })
    .where(eq(sites.id, siteId));

  // Cancel any pending verification jobs
  await db
    .update(domainVerificationJobs)
    .set({
      status: "failed",
      error_message: "Domain removed",
      updated_at: new Date(),
    })
    .where(
      and(
        eq(domainVerificationJobs.site_id, siteId),
        eq(domainVerificationJobs.status, "pending")
      )
    );

  revalidatePath(`/app/sites/${siteId}`, "page");
  return { success: true };
}

/**
 * Get domain status for a site
 */
export async function getDomainStatus(
  siteId: string
): Promise<DomainStatusResult> {
  const userId = await requireUserId();

  const [site] = await db
    .select({
      custom_domain: sites.custom_domain,
      domain_verification_status: sites.domain_verification_status,
      domain_ssl_status: sites.domain_ssl_status,
      domain_verified_at: sites.domain_verified_at,
      domain_verification_challenges: sites.domain_verification_challenges,
    })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  if (!site) {
    return { success: false, error: "Site not found" };
  }

  return {
    success: true,
    domain: site.custom_domain,
    verificationStatus: site.domain_verification_status,
    sslStatus: site.domain_ssl_status,
    verifiedAt: site.domain_verified_at,
    challenges: site.domain_verification_challenges as Array<{
      type: string;
      domain: string;
      value: string;
    }> | undefined,
  };
}
