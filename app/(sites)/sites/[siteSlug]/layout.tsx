import { Metadata } from "next";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import type { HeadScript } from "@/lib/drizzle/schema/sites";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Layout for published sites.
 * Does NOT include the app's navbar/footer - sites render their own content.
 */
export default async function PublishedSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);
  const headScripts = (site?.head_scripts as HeadScript[]) ?? [];

  return (
    <>
      {/* Smooth scroll for anchor links */}
      <style>{`html { scroll-behavior: smooth; }`}</style>
      {/* Google Fonts - Inter as default, sites can override with their theme fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* Custom head scripts (analytics, verification tags, etc.) */}
      {headScripts.map((script, index) => (
        <div
          key={index}
          dangerouslySetInnerHTML={{ __html: script.content }}
        />
      ))}
      {children}
    </>
  );
}
