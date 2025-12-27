import { Badge } from "@/components/ui/badge";
import type { SiteStatus } from "@/lib/drizzle/schema/sites";

interface SiteStatusBadgeProps {
  status: SiteStatus;
}

export function SiteStatusBadge({ status }: SiteStatusBadgeProps) {
  if (status === "published") {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        Published
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      Draft
    </Badge>
  );
}
