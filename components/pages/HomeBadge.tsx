import { Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HomeBadge() {
  return (
    <Badge variant="outline" className="gap-1">
      <Home className="h-3 w-3" />
      Home
    </Badge>
  );
}
