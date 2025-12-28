import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { blogPosts } from "@/lib/drizzle/schema/blog-posts";
import { users } from "@/lib/drizzle/schema/users";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "9", 10);

  const posts = await db
    .select({
      post: blogPosts,
      authorName: users.full_name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .where(and(eq(blogPosts.site_id, siteId), eq(blogPosts.status, "published")))
    .orderBy(desc(blogPosts.published_at))
    .limit(limit)
    .offset(offset);

  const result = posts.map((row) => ({
    ...row.post,
    authorName: row.authorName,
  }));

  return NextResponse.json(result);
}
