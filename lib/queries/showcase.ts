import { db } from "@/lib/drizzle/db";
import { sites } from "@/lib/drizzle/schema/sites";
import { eq, desc } from "drizzle-orm";

export interface ShowcaseSite {
  domain: string;
}

/**
 * Get sites with verified custom domains for the showcase section.
 * Returns domains that visitors can actually visit.
 */
export async function getShowcaseSites(): Promise<ShowcaseSite[]> {
  const results = await db
    .select({ domain: sites.custom_domain })
    .from(sites)
    .where(eq(sites.domain_verification_status, "verified"))
    .orderBy(desc(sites.created_at));

  // Filter out any null domains (shouldn't happen but be safe)
  return results.filter(
    (site): site is ShowcaseSite => site.domain !== null
  );
}
