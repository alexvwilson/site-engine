import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, Clock } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { SiteStatusBadge } from "./SiteStatusBadge";
import type { Site } from "@/lib/drizzle/schema/sites";

interface SiteCardProps {
  site: Site;
  pageCount: number;
}

export function SiteCard({ site, pageCount }: SiteCardProps) {
  return (
    <Link href={`/app/sites/${site.id}`}>
      <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1">{site.name}</h3>
            <SiteStatusBadge status={site.status} />
          </div>
          {site.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {site.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{pageCount} {pageCount === 1 ? "page" : "pages"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(site.updated_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
