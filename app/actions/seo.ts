"use server";

import { requireUserId } from "@/lib/auth";
import { getSeoAuditData } from "@/lib/queries/seo";
import { runSeoAudit, type SeoAuditSummary } from "@/lib/seo-checks";

/**
 * Fetch and run SEO audit for a site
 */
export async function runSeoAuditAction(
  siteId: string
): Promise<{ success: true; data: SeoAuditSummary } | { success: false; error: string }> {
  const userId = await requireUserId();

  const auditData = await getSeoAuditData(siteId, userId);

  if (!auditData) {
    return { success: false, error: "Site not found or access denied" };
  }

  const summary = runSeoAudit(auditData);

  return { success: true, data: summary };
}
