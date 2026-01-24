"use server";

import { db } from "@/lib/drizzle/db";
import { landingFaqs, landingFeatures } from "@/lib/drizzle/schema";
import { requireAdminAccess } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ============================================================================
// FAQ Actions
// ============================================================================

export async function createFaq(data: {
  question: string;
  answer: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  const existing = await db.select().from(landingFaqs);
  const maxOrder = existing.reduce(
    (max, f) => Math.max(max, f.display_order),
    -1
  );

  await db.insert(landingFaqs).values({
    question: data.question,
    answer: data.answer,
    display_order: maxOrder + 1,
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function updateFaq(
  id: string,
  data: { question: string; answer: string }
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  await db
    .update(landingFaqs)
    .set({
      question: data.question,
      answer: data.answer,
      updated_at: new Date(),
    })
    .where(eq(landingFaqs.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function deleteFaq(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  await db.delete(landingFaqs).where(eq(landingFaqs.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function reorderFaqs(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(landingFaqs)
        .set({ display_order: index })
        .where(eq(landingFaqs.id, id))
    )
  );

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function toggleFaqActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  await db
    .update(landingFaqs)
    .set({ is_active: isActive, updated_at: new Date() })
    .where(eq(landingFaqs.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

// ============================================================================
// Feature Actions
// ============================================================================

export async function createFeature(data: {
  title: string;
  description: string;
  icon_name: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  const existing = await db.select().from(landingFeatures);
  const maxOrder = existing.reduce(
    (max, f) => Math.max(max, f.display_order),
    -1
  );

  await db.insert(landingFeatures).values({
    title: data.title,
    description: data.description,
    icon_name: data.icon_name,
    display_order: maxOrder + 1,
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function updateFeature(
  id: string,
  data: { title: string; description: string; icon_name: string }
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  await db
    .update(landingFeatures)
    .set({
      title: data.title,
      description: data.description,
      icon_name: data.icon_name,
      updated_at: new Date(),
    })
    .where(eq(landingFeatures.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function deleteFeature(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  await db.delete(landingFeatures).where(eq(landingFeatures.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function reorderFeatures(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(landingFeatures)
        .set({ display_order: index })
        .where(eq(landingFeatures.id, id))
    )
  );

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function toggleFeatureActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdminAccess();

  await db
    .update(landingFeatures)
    .set({ is_active: isActive, updated_at: new Date() })
    .where(eq(landingFeatures.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { success: true };
}
