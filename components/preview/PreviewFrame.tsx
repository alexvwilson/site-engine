"use client";

import { useState } from "react";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { PageRenderer } from "@/components/render/PageRenderer";
import { DeviceToggle, type DeviceType } from "./DeviceToggle";
import { cn } from "@/lib/utils";

const DEVICE_WIDTHS: Record<DeviceType, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

interface PreviewFrameProps {
  sections: Section[];
  theme: ThemeData | null;
}

export function PreviewFrame({
  sections,
  theme,
}: PreviewFrameProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");

  if (!theme) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">No Active Theme</h3>
          <p className="text-muted-foreground mt-1">
            Generate a theme first to preview your page with styling applied.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center py-4 border-b bg-background">
        <DeviceToggle device={device} onChange={setDevice} />
      </div>

      <div className="flex-1 flex justify-center overflow-auto p-4 bg-muted/30">
        <div
          className={cn(
            "bg-white shadow-lg transition-all duration-300 overflow-auto",
            device !== "desktop" && "border rounded-lg"
          )}
          style={{
            width: DEVICE_WIDTHS[device],
            maxWidth: "100%",
            minHeight: device === "desktop" ? "100%" : "auto",
          }}
        >
          <PageRenderer sections={sections} theme={theme} />
        </div>
      </div>
    </div>
  );
}
