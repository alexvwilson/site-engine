"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Palette,
  Settings,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SiteContextSidebarProps {
  siteId: string;
  siteName: string;
}

export function SiteContextSidebar({ siteId, siteName }: SiteContextSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { open, isMobile, toggleSidebar } = useSidebar();

  const renderContentAsOpen = open || isMobile;
  const currentTab = searchParams.get("tab") || "pages";

  const navItems = [
    { href: `/app/sites/${siteId}`, label: "Pages", icon: FileText, tab: "pages" },
    { href: `/app/sites/${siteId}?tab=theme`, label: "Theme", icon: Palette, tab: "theme" },
    { href: `/app/sites/${siteId}?tab=settings`, label: "Settings", icon: Settings, tab: "settings" },
  ];

  const handleNavClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const getLinkClasses = (tab: string) => {
    // Check if we're on the site detail page and the tab matches
    const isOnSiteDetail = pathname === `/app/sites/${siteId}` || pathname.startsWith(`/app/sites/${siteId}/pages`);
    const isActive = isOnSiteDetail && currentTab === tab;

    return cn(
      "flex items-center w-full rounded-md text-base font-medium transition-colors",
      isActive
        ? "bg-primary/15 dark:bg-primary/25 text-primary"
        : "text-muted-foreground hover:bg-muted",
      renderContentAsOpen ? "px-3 py-2" : "h-9 w-9 justify-center p-0"
    );
  };

  return (
    <>
      {/* Back to dashboard */}
      <SidebarGroup>
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem
            className={cn("flex justify-center", renderContentAsOpen && "px-2")}
          >
            <Link
              href="/app"
              className={cn(
                "flex items-center w-full rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
                renderContentAsOpen ? "px-3 py-2" : "h-9 w-9 justify-center p-0"
              )}
              onClick={handleNavClick}
            >
              <ArrowLeft
                className={cn(renderContentAsOpen ? "h-4 w-4 mr-2" : "h-5 w-5")}
              />
              {renderContentAsOpen && <span>Back to Sites</span>}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Site name */}
      {renderContentAsOpen && (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Current Site
          </p>
          <p className="font-semibold truncate">{siteName}</p>
        </div>
      )}

      {/* Divider */}
      {renderContentAsOpen && (
        <div className="px-4 py-2">
          <div className="border-t dark:border-muted" />
        </div>
      )}

      {/* Site navigation */}
      <SidebarGroup>
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => (
            <SidebarMenuItem
              key={item.href}
              className={cn(
                "flex justify-center",
                renderContentAsOpen && "px-2"
              )}
            >
              <Link
                href={item.href}
                className={getLinkClasses(item.tab)}
                onClick={handleNavClick}
              >
                <item.icon
                  className={cn(
                    renderContentAsOpen ? "h-6 w-6 mr-3" : "h-5 w-5"
                  )}
                />
                {renderContentAsOpen && <span>{item.label}</span>}
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
