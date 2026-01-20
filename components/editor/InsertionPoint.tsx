"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { BlockPicker } from "./BlockPicker";
import { cn } from "@/lib/utils";

interface InsertionPointProps {
  pageId: string;
  siteId: string;
  position: number;
}

export function InsertionPoint({
  pageId,
  siteId,
  position,
}: InsertionPointProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative py-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Horizontal line */}
      <div
        className={cn(
          "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px transition-colors duration-200",
          isHovered ? "bg-primary/50" : "bg-transparent"
        )}
      />

      {/* Centered plus button */}
      <div className="flex justify-center">
        <BlockPicker
          pageId={pageId}
          siteId={siteId}
          position={position}
          trigger={
            <button
              type="button"
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full",
                "bg-primary text-primary-foreground shadow-sm",
                "transition-all duration-200",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
              )}
              aria-label={`Insert section at position ${position}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          }
        />
      </div>
    </div>
  );
}
