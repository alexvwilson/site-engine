"use client";

import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Page } from "@/lib/drizzle/schema/pages";

interface PreviewHeaderProps {
  page: Page;
  siteId: string;
  hasTheme: boolean;
}

export function PreviewHeader({
  page,
  siteId,
  hasTheme,
}: PreviewHeaderProps) {
  return (
    <div className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/app/sites/${siteId}/pages/${page.id}`}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold truncate">
              Preview: {page.title}
            </h1>
            <Badge
              variant={page.status === "published" ? "default" : "secondary"}
              className="flex-shrink-0"
            >
              {page.status === "published" ? "Published" : "Draft"}
            </Badge>
            {!hasTheme && (
              <Badge variant="outline" className="flex-shrink-0 text-amber-600 border-amber-300">
                No Theme
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/app/sites/${siteId}/pages/${page.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
