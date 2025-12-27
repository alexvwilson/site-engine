import { Badge } from "@/components/ui/badge";
import type { PageStatus } from "@/lib/drizzle/schema/pages";

interface PageStatusBadgeProps {
  status: PageStatus;
}

export function PageStatusBadge({ status }: PageStatusBadgeProps) {
  if (status === "published") {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        Published
      </Badge>
    );
  }

  return <Badge variant="secondary">Draft</Badge>;
}
