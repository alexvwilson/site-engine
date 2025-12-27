import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublishedHomePage } from "@/lib/queries/pages";
import { getPublishedSectionsByPage } from "@/lib/queries/sections";
import { getActiveTheme } from "@/lib/queries/themes";
import { PageRenderer } from "@/components/render";
import { ThemeStyles, ColorModeScript } from "@/components/render/ThemeStyles";
import { ColorModeToggle } from "@/components/render/ColorModeToggle";
import { DEFAULT_THEME } from "@/lib/default-theme";

// Ensure fresh data on every request for published sites
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return { title: "Not Found" };
  }

  const page = await getPublishedHomePage(site.id);
  const title = page?.meta_title || site.meta_title || site.name;
  const description =
    page?.meta_description || site.meta_description || site.description || "";

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

export default async function PublishedSiteHomePage({ params }: PageProps) {
  const { siteSlug } = await params;

  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) {
    notFound();
  }

  const page = await getPublishedHomePage(site.id);
  if (!page) {
    notFound();
  }

  const sections = await getPublishedSectionsByPage(page.id);
  const activeTheme = await getActiveTheme(site.id);
  const theme = activeTheme?.data ?? DEFAULT_THEME;
  const colorMode = site.color_mode;

  return (
    <>
      <ColorModeScript colorMode={colorMode} />
      <ThemeStyles theme={theme} colorMode={colorMode} />
      <div className="relative">
        {colorMode === "user_choice" && (
          <div className="fixed top-4 right-4 z-[60]">
            <ColorModeToggle />
          </div>
        )}
        <PageRenderer sections={sections} theme={theme} />
      </div>
    </>
  );
}
