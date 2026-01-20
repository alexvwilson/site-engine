"use client";

import { Palette, Info } from "lucide-react";
import type { SectionContent } from "@/lib/section-types";

interface DesignTabProps {
  content: SectionContent;
  onChange: (content: SectionContent) => void;
  siteId: string;
  disabled?: boolean;
}

export function DesignTab({
  content: _content,
  onChange: _onChange,
  siteId: _siteId,
  disabled: _disabled,
}: DesignTabProps): React.ReactElement {
  // Phase 4: Extract shared design controls from block editors
  // For now, design controls remain in the Content tab with each block editor

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Palette className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-sm mb-2">Design Controls</h3>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          Styling options are currently available in the Content tab for each block type.
        </p>
      </div>

      <div className="rounded-lg border border-dashed p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Coming Soon</p>
            <p>
              In a future update, design controls (borders, backgrounds, typography)
              will be consolidated here for easier access across all block types.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
