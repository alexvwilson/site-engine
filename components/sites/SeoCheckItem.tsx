"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeoCheckResult } from "@/lib/seo-checks";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SeoCheckItemProps {
  result: SeoCheckResult;
}

export function SeoCheckItem({ result }: SeoCheckItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig = {
    pass: {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      label: "Passed",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      label: "Needs attention",
    },
    fail: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      label: "Missing",
    },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div
          className={cn(
            "flex items-center justify-between gap-3 p-3 rounded-lg transition-colors",
            "hover:bg-muted/50",
            isOpen && config.bgColor
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Icon className={cn("h-5 w-5 shrink-0", config.color)} />
            <div className="text-left min-w-0">
              <p className="text-sm font-medium truncate">
                {result.check.name}
                {result.pageName && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    — {result.pageName}
                  </span>
                )}
              </p>
              {result.details && (
                <p className="text-xs text-muted-foreground truncate">
                  {result.details}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 pt-1 ml-8">
          <p className="text-sm text-muted-foreground mb-2">
            {result.check.description}
          </p>
          <div className="p-3 bg-muted/30 rounded-md">
            <p className="text-sm font-medium mb-1">How to fix:</p>
            <p className="text-sm text-muted-foreground">
              {result.check.guidance}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
