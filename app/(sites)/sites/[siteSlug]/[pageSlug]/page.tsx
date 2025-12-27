import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublishedPageBySlug } from "@/lib/queries/pages";
import { getPublishedSectionsByPage } from "@/lib/queries/sections";
import { getActiveTheme } from "@/lib/queries/themes";
import { PageRenderer } from "@/components/render";
import { DEFAULT_THEME } from "@/lib/default-theme";

interface PageProps {
  params: Promise<{ siteSlug: string; pageSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug, pageSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return { title: "Not Found" };
  }

  const page = await getPublishedPageBySlug(site.id, pageSlug);
  if (!page) {
    return { title: "Not Found" };
  }

  const title = page.meta_title || page.title;
  const description =
    page.meta_description || site.meta_description || site.description || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function PublishedSitePage({ params }: PageProps) {
  const { siteSlug, pageSlug } = await params;

  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) {
    notFound();
  }

  const page = await getPublishedPageBySlug(site.id, pageSlug);
  if (!page) {
    notFound();
  }

  const sections = await getPublishedSectionsByPage(page.id);
  const activeTheme = await getActiveTheme(site.id);
  const theme = activeTheme?.data ?? DEFAULT_THEME;

  return <PageRenderer sections={sections} theme={theme} />;
}
