import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { getSiteById } from "@/lib/queries/sites";
import { getPostById, getCategoriesBySite } from "@/lib/queries/blog";
import { getPagesBySite } from "@/lib/queries/pages";
import { PostEditor } from "@/components/blog";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

interface PostEditorPageProps {
  params: Promise<{ siteId: string; postId: string }>;
}

export default async function PostEditorPage({ params }: PostEditorPageProps) {
  const userId = await requireUserId();
  const { siteId, postId } = await params;

  // Verify site ownership
  const site = await getSiteById(siteId, userId);
  if (!site) {
    notFound();
  }

  // Get the post, categories, and pages
  const [post, categories, pages] = await Promise.all([
    getPostById(postId),
    getCategoriesBySite(siteId),
    getPagesBySite(siteId, userId),
  ]);

  if (!post || post.site_id !== siteId) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/app" },
    { label: site.name, href: `/app/sites/${siteId}` },
    { label: "Blog", href: `/app/sites/${siteId}?tab=blog` },
    { label: post.title, href: `/app/sites/${siteId}/blog/${postId}` },
  ];

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs items={breadcrumbs} />
      <div className="container mx-auto px-4 py-8">
        <PostEditor post={post} siteId={siteId} categories={categories} pages={pages} />
      </div>
    </div>
  );
}
