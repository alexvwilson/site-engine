"use client";

import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "saved" | "saving" | "error" | "idle";

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
  onRetry?: () => void;
}

export function SaveIndicator({ status, className, onRetry }: SaveIndicatorProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      {status === "saved" && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">Saved</span>
        </>
      )}
      {status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive">Save failed</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-destructive underline hover:no-underline ml-1"
            >
              Retry
            </button>
          )}
        </>
      )}
    </div>
  );
}
