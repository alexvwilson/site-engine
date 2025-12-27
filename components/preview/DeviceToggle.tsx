"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DeviceType = "desktop" | "tablet" | "mobile";

interface DeviceToggleProps {
  device: DeviceType;
  onChange: (device: DeviceType) => void;
}

const DEVICE_OPTIONS = [
  { type: "desktop" as const, icon: Monitor, label: "Desktop" },
  { type: "tablet" as const, icon: Tablet, label: "Tablet (768px)" },
  { type: "mobile" as const, icon: Smartphone, label: "Mobile (375px)" },
];

export function DeviceToggle({
  device,
  onChange,
}: DeviceToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      {DEVICE_OPTIONS.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          onClick={() => onChange(type)}
          className={cn(
            "h-8 px-3 gap-2",
            device === type && "bg-background shadow-sm"
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{label}</span>
        </Button>
      ))}
    </div>
  );
}
