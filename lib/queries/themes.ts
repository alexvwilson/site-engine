/**
 * Theme Queries
 *
 * Database query functions for saved themes.
 */

import { db } from "@/lib/drizzle/db";
import { themes, type Theme } from "@/lib/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// ============================================================================
// Theme Queries
// ============================================================================

/**
 * Get all themes for a site, ordered by creation date (newest first).
 */
export async function getThemesBySite(siteId: string): Promise<Theme[]> {
  return db
    .select()
    .from(themes)
    .where(eq(themes.site_id, siteId))
    .orderBy(desc(themes.created_at));
}

/**
 * Get the active theme for a site.
 */
export async function getActiveTheme(siteId: string): Promise<Theme | null> {
  const [theme] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.site_id, siteId), eq(themes.is_active, true)))
    .limit(1);

  return theme ?? null;
}

/**
 * Get a theme by ID.
 */
export async function getThemeById(themeId: string): Promise<Theme | null> {
  const [theme] = await db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .limit(1);

  return theme ?? null;
}

/**
 * Get a theme by ID with user ownership verification.
 */
export async function getThemeByIdWithAuth(
  themeId: string,
  userId: string
): Promise<Theme | null> {
  const [theme] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.user_id, userId)))
    .limit(1);

  return theme ?? null;
}

/**
 * Get theme count for a site.
 */
export async function getThemeCount(siteId: string): Promise<number> {
  const result = await db
    .select()
    .from(themes)
    .where(eq(themes.site_id, siteId));

  return result.length;
}

// ============================================================================
// Theme with Job Info
// ============================================================================

export interface ThemeWithStatus extends Theme {
  generationStatus?: "completed" | "failed" | null;
}

/**
 * Get all themes for a site with generation job status.
 * Useful for showing which themes were AI-generated vs manual.
 */
export async function getThemesWithStatus(
  siteId: string
): Promise<ThemeWithStatus[]> {
  // For now, just return themes without joining.
  // The generation_job_id indicates if AI-generated.
  const siteThemes = await getThemesBySite(siteId);

  return siteThemes.map((theme) => ({
    ...theme,
    generationStatus: theme.generation_job_id ? "completed" : null,
  }));
}
