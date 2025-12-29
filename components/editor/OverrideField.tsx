"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OverrideFieldProps {
  /** Unique ID for the override toggle */
  id: string;
  /** Label for the override toggle */
  label: string;
  /** Description of what this override controls */
  description?: string;
  /** Whether override is enabled */
  enabled: boolean;
  /** Called when override toggle changes */
  onEnabledChange: (enabled: boolean) => void;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Children to render when override is enabled */
  children: React.ReactNode;
}

/**
 * OverrideField wraps a form field with an override toggle.
 * When override is enabled, the children (form field) are shown.
 * When disabled, the site-level default is used.
 */
export function OverrideField({
  id,
  label,
  description,
  enabled,
  onEnabledChange,
  disabled,
  children,
}: OverrideFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={id} className="text-sm font-medium">
            Override: {label}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Switch
          id={id}
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={disabled}
        />
      </div>
      <div
        className={cn(
          "transition-opacity",
          enabled ? "opacity-100" : "opacity-40 pointer-events-none"
        )}
      >
        {children}
      </div>
    </div>
  );
}
