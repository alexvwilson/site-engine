"use server";

import { db } from "@/lib/drizzle/db";
import {
  imageAlbums,
  type ImageAlbum,
} from "@/lib/drizzle/schema/image-albums";
import { images } from "@/lib/drizzle/schema/images";
import { sites } from "@/lib/drizzle/schema/sites";
import { requireUserId } from "@/lib/auth";
import { eq, and, asc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

interface AlbumResult {
  success: boolean;
  album?: ImageAlbum;
  error?: string;
}

interface AlbumsListResult {
  success: boolean;
  albums?: (ImageAlbum & { imageCount: number })[];
  error?: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function verifySiteOwnership(
  siteId: string,
  userId: string
): Promise<boolean> {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)));
  return !!site;
}

async function verifyAlbumOwnership(
  albumId: string,
  userId: string
): Promise<{ album: ImageAlbum; siteId: string } | null> {
  const [result] = await db
    .select({
      album: imageAlbums,
      siteUserId: sites.user_id,
    })
    .from(imageAlbums)
    .innerJoin(sites, eq(imageAlbums.site_id, sites.id))
    .where(eq(imageAlbums.id, albumId));

  if (!result || result.siteUserId !== userId) {
    return null;
  }

  return { album: result.album, siteId: result.album.site_id };
}

// ============================================================================
// Album CRUD Operations
// ============================================================================

export async function createAlbum(
  siteId: string,
  name: string,
  description?: string
): Promise<AlbumResult> {
  const userId = await requireUserId();

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "Album name is required" };
  }

  if (trimmedName.length > 100) {
    return { success: false, error: "Album name must be 100 characters or less" };
  }

  const isOwner = await verifySiteOwnership(siteId, userId);
  if (!isOwner) {
    return { success: false, error: "Unauthorized" };
  }

  // Get max display_order for this site
  const existing = await db
    .select({ display_order: imageAlbums.display_order })
    .from(imageAlbums)
    .where(eq(imageAlbums.site_id, siteId))
    .orderBy(asc(imageAlbums.display_order));

  const maxOrder =
    existing.length > 0
      ? Math.max(...existing.map((a) => a.display_order))
      : -1;

  try {
    const [album] = await db
      .insert(imageAlbums)
      .values({
        site_id: siteId,
        name: trimmedName,
        description: description?.trim() || null,
        display_order: maxOrder + 1,
      })
      .returning();

    revalidatePath(`/app/sites/${siteId}`, "page");
    return { success: true, album };
  } catch (error) {
    // Handle unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("image_albums_site_name_unique")
    ) {
      return { success: false, error: "An album with this name already exists" };
    }
    console.error("Failed to create album:", error);
    return { success: false, error: "Failed to create album" };
  }
}

export async function updateAlbum(
  albumId: string,
  data: { name?: string; description?: string }
): Promise<ActionResult> {
  const userId = await requireUserId();

  const ownership = await verifyAlbumOwnership(albumId, userId);
  if (!ownership) {
    return { success: false, error: "Unauthorized" };
  }

  const updates: Partial<{ name: string; description: string | null; updated_at: Date }> = {
    updated_at: new Date(),
  };

  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { success: false, error: "Album name is required" };
    }
    if (trimmedName.length > 100) {
      return { success: false, error: "Album name must be 100 characters or less" };
    }
    updates.name = trimmedName;
  }

  if (data.description !== undefined) {
    updates.description = data.description?.trim() || null;
  }

  try {
    await db
      .update(imageAlbums)
      .set(updates)
      .where(eq(imageAlbums.id, albumId));

    revalidatePath(`/app/sites/${ownership.siteId}`, "page");
    return { success: true };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("image_albums_site_name_unique")
    ) {
      return { success: false, error: "An album with this name already exists" };
    }
    console.error("Failed to update album:", error);
    return { success: false, error: "Failed to update album" };
  }
}

export async function deleteAlbum(albumId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const ownership = await verifyAlbumOwnership(albumId, userId);
  if (!ownership) {
    return { success: false, error: "Unauthorized" };
  }

  // Images with this album_id will have album_id set to null (ON DELETE SET NULL)
  await db.delete(imageAlbums).where(eq(imageAlbums.id, albumId));

  revalidatePath(`/app/sites/${ownership.siteId}`, "page");
  return { success: true };
}

export async function getAlbumsForSite(siteId: string): Promise<AlbumsListResult> {
  const userId = await requireUserId();

  const isOwner = await verifySiteOwnership(siteId, userId);
  if (!isOwner) {
    return { success: false, error: "Unauthorized" };
  }

  // Get albums with image count
  const albumsWithCounts = await db
    .select({
      album: imageAlbums,
      imageCount: count(images.id),
    })
    .from(imageAlbums)
    .leftJoin(images, eq(images.album_id, imageAlbums.id))
    .where(eq(imageAlbums.site_id, siteId))
    .groupBy(imageAlbums.id)
    .orderBy(asc(imageAlbums.display_order));

  const albums = albumsWithCounts.map((row) => ({
    ...row.album,
    imageCount: Number(row.imageCount),
  }));

  return { success: true, albums };
}

export async function reorderAlbums(
  siteId: string,
  albumIds: string[]
): Promise<ActionResult> {
  const userId = await requireUserId();

  const isOwner = await verifySiteOwnership(siteId, userId);
  if (!isOwner) {
    return { success: false, error: "Unauthorized" };
  }

  // Update display_order for each album
  await Promise.all(
    albumIds.map((id, index) =>
      db
        .update(imageAlbums)
        .set({ display_order: index, updated_at: new Date() })
        .where(and(eq(imageAlbums.id, id), eq(imageAlbums.site_id, siteId)))
    )
  );

  revalidatePath(`/app/sites/${siteId}`, "page");
  return { success: true };
}
