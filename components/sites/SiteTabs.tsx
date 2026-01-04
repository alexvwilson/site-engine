"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagesList } from "@/components/pages/PagesList";
import { BlogTab } from "@/components/blog";
import { ThemeTab } from "@/components/theme";
import { SettingsTab } from "./SettingsTab";
import type { Site } from "@/lib/drizzle/schema/sites";
import type { Page } from "@/lib/drizzle/schema/pages";
import type { BlogPost } from "@/lib/drizzle/schema/blog-posts";
import type { BlogCategory } from "@/lib/drizzle/schema/blog-categories";
import type { Theme } from "@/lib/drizzle/schema/themes";

interface SiteTabsProps {
  site: Site;
  pages: Page[];
  posts: (BlogPost & { categoryName: string | null; pageName: string | null })[];
  categories: BlogCategory[];
  themes: Theme[];
  activeTheme: Theme | null;
}

export function SiteTabs({ site, pages, posts, categories, themes, activeTheme }: SiteTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = searchParams.get("tab") || "pages";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "pages") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="blog">Blog</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="pages">
        <PagesList pages={pages} siteId={site.id} />
      </TabsContent>
      <TabsContent value="blog">
        <BlogTab siteId={site.id} posts={posts} pages={pages} />
      </TabsContent>
      <TabsContent value="theme">
        <ThemeTab site={site} themes={themes} activeTheme={activeTheme} />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsTab site={site} categories={categories} activeTheme={activeTheme} />
      </TabsContent>
    </Tabs>
  );
}
