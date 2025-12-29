import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { blogPosts } from "@/lib/drizzle/schema/blog-posts";
import { blogCategories } from "@/lib/drizzle/schema/blog-categories";
import { users } from "@/lib/drizzle/schema/users";
import { eq, and, desc, lte, type SQL } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "9", 10);
  const categorySlug = searchParams.get("category");

  // Build where conditions
  const conditions: SQL[] = [
    eq(blogPosts.site_id, siteId),
    eq(blogPosts.status, "published"),
    lte(blogPosts.published_at, new Date()),
  ];

  // Add category filter if specified
  if (categorySlug) {
    conditions.push(eq(blogCategories.slug, categorySlug));
  }

  const posts = await db
    .select({
      post: blogPosts,
      authorName: users.full_name,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .where(and(...conditions))
    .orderBy(desc(blogPosts.published_at))
    .limit(limit)
    .offset(offset);

  const result = posts.map((row) => ({
    ...row.post,
    authorName: row.authorName,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
  }));

  return NextResponse.json(result);
}
