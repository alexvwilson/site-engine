/**
 * Domain Verification Task
 *
 * Polls Vercel API to check domain verification status.
 * Uses 30-second intervals with max attempts to avoid infinite polling.
 */

import { schemaTask, logger, metadata, wait } from "@trigger.dev/sdk";
import { z } from "zod";
import { db } from "@/lib/drizzle/db";
import { sites, domainVerificationJobs } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import {
  verifyDomain,
  getDomainConfig,
  isVercelError,
} from "@/lib/vercel";

// ============================================================================
// Task Definition
// ============================================================================

export const verifyDomainTask = schemaTask({
  id: "verify-domain",
  schema: z.object({
    jobId: z.string().uuid(),
  }),
  run: async ({ jobId }) => {
    logger.info("Starting domain verification", { jobId });

    // ========================================================================
    // Step 1: Fetch job and validate (0%)
    // ========================================================================
    metadata.set("progress", 0);
    metadata.set("status", "pending");
    metadata.set("step", "Initializing verification...");

    const [job] = await db
      .select()
      .from(domainVerificationJobs)
      .where(eq(domainVerificationJobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new Error(`Verification job not found: ${jobId}`);
    }

    // Fetch site to verify it still exists
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, job.site_id))
      .limit(1);

    if (!site) {
      throw new Error(`Site not found: ${job.site_id}`);
    }

    // Update job to verifying status
    await db
      .update(domainVerificationJobs)
      .set({
        status: "verifying",
        updated_at: new Date(),
      })
      .where(eq(domainVerificationJobs.id, jobId));

    metadata.set("progress", 5);
    metadata.set("status", "verifying");
    metadata.set("step", "Checking DNS configuration...");

    // ========================================================================
    // Step 2: Polling loop (5% -> 95%)
    // ========================================================================
    let attempts = 0;
    const maxAttempts = job.max_attempts;
    let verified = false;

    while (attempts < maxAttempts && !verified) {
      attempts++;
      const progress = Math.min(5 + Math.round((attempts / maxAttempts) * 90), 95);
      metadata.set("progress", progress);
      metadata.set("step", `Verification attempt ${attempts}/${maxAttempts}`);

      logger.info("Checking domain verification", {
        domain: job.domain,
        attempt: attempts,
        maxAttempts,
      });

      // Call Vercel verify endpoint
      const verifyResponse = await verifyDomain(job.domain);

      if (isVercelError(verifyResponse)) {
        logger.warn("Verification check returned error", {
          error: verifyResponse.error,
          attempt: attempts,
        });

        // Update attempt count
        await db
          .update(domainVerificationJobs)
          .set({
            verification_attempts: attempts,
            last_check_at: new Date(),
            error_message: verifyResponse.error.message,
            updated_at: new Date(),
          })
          .where(eq(domainVerificationJobs.id, jobId));
      } else if (verifyResponse.verified) {
        verified = true;
        logger.info("Domain verified!", { domain: job.domain, attempts });

        // Check SSL/config status
        let sslStatus: "pending" | "issued" | "failed" = "pending";
        try {
          const configResponse = await getDomainConfig(job.domain);
          if (!isVercelError(configResponse)) {
            sslStatus = configResponse.misconfigured ? "failed" : "issued";
          }
        } catch (error) {
          logger.warn("Failed to get domain config", { error });
        }

        // Update site
        await db
          .update(sites)
          .set({
            domain_verification_status: "verified",
            domain_verified_at: new Date(),
            domain_ssl_status: sslStatus,
            domain_error_message: null,
            updated_at: new Date(),
          })
          .where(eq(sites.id, job.site_id));

        // Update job
        await db
          .update(domainVerificationJobs)
          .set({
            status: "completed",
            verification_attempts: attempts,
            last_check_at: new Date(),
            error_message: null,
            updated_at: new Date(),
          })
          .where(eq(domainVerificationJobs.id, jobId));

        metadata.set("progress", 100);
        metadata.set("status", "completed");
        metadata.set("step", "Domain verified!");

        return {
          success: true,
          verified: true,
          attempts,
          sslStatus,
        };
      } else {
        // Not verified yet - update attempts and wait
        await db
          .update(domainVerificationJobs)
          .set({
            verification_attempts: attempts,
            last_check_at: new Date(),
            updated_at: new Date(),
          })
          .where(eq(domainVerificationJobs.id, jobId));
      }

      // Wait before next attempt (30 seconds)
      if (attempts < maxAttempts && !verified) {
        logger.info("Waiting before next verification attempt", {
          waitSeconds: 30,
          nextAttempt: attempts + 1,
        });
        await wait.for({ seconds: 30 });
      }
    }

    // ========================================================================
    // Step 3: Handle timeout (if not verified)
    // ========================================================================
    if (!verified) {
      logger.info("Verification timed out", {
        domain: job.domain,
        attempts,
        maxAttempts,
      });

      const timeoutMessage = `DNS verification timed out after ${attempts} attempts. Please ensure your DNS records are configured correctly and try again.`;

      await db
        .update(domainVerificationJobs)
        .set({
          status: "failed",
          error_message: timeoutMessage,
          updated_at: new Date(),
        })
        .where(eq(domainVerificationJobs.id, jobId));

      await db
        .update(sites)
        .set({
          domain_error_message: timeoutMessage,
          updated_at: new Date(),
        })
        .where(eq(sites.id, job.site_id));

      metadata.set("progress", 100);
      metadata.set("status", "failed");
      metadata.set("step", "Verification timed out");

      return {
        success: false,
        verified: false,
        attempts,
        error: timeoutMessage,
      };
    }

    // This shouldn't be reached, but TypeScript needs a return
    return {
      success: verified,
      verified,
      attempts,
    };
  },
});
