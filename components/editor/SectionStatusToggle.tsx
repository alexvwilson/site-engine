"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateSectionStatus } from "@/app/actions/sections";
import type { SectionStatus } from "@/lib/drizzle/schema/sections";

interface SectionStatusToggleProps {
  sectionId: string;
  status: SectionStatus;
}

export function SectionStatusToggle({
  sectionId,
  status,
}: SectionStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<SectionStatus>(status);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: SectionStatus =
      currentStatus === "published" ? "draft" : "published";
    setCurrentStatus(newStatus);

    startTransition(async () => {
      const result = await updateSectionStatus(sectionId, newStatus);
      if (!result.success) {
        setCurrentStatus(currentStatus);
      }
    });
  };

  const isPublished = currentStatus === "published";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className="h-7 gap-1.5 px-2"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isPublished ? (
              <Eye className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <Badge
              variant={isPublished ? "default" : "secondary"}
              className="h-5 text-[10px] px-1.5"
            >
              {isPublished ? "Published" : "Draft"}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>
            {isPublished
              ? "Click to hide from public view"
              : "Click to show on public site"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
