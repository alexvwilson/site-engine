"use client";

import { useState, useTransition } from "react";
import { Hash, Check, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getAnchorIdError } from "@/lib/anchor-utils";
import { updateSectionAnchorId, updateSectionStatus } from "@/app/actions/sections";
import type { Section, SectionStatus } from "@/lib/drizzle/schema/sections";
import { cn } from "@/lib/utils";

interface AdvancedTabProps {
  section: Section;
  disabled?: boolean;
}

export function AdvancedTab({
  section,
  disabled,
}: AdvancedTabProps): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Section Visibility */}
      <VisibilityControl section={section} disabled={disabled} />

      {/* Anchor ID */}
      <AnchorIdControl section={section} disabled={disabled} />

      {/* Section Info */}
      <div className="space-y-4 rounded-lg border p-4">
        <Label className="text-xs uppercase text-muted-foreground tracking-wide">
          Section Info
        </Label>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID</span>
            <span className="font-mono text-xs">{section.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span>{section.block_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position</span>
            <span>{section.position}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisibilityControl({
  section,
  disabled,
}: {
  section: Section;
  disabled?: boolean;
}): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState<SectionStatus>(section.status);

  const handleToggle = (checked: boolean): void => {
    const newStatus: SectionStatus = checked ? "published" : "draft";
    setCurrentStatus(newStatus);

    startTransition(async () => {
      const result = await updateSectionStatus(section.id, newStatus);
      if (!result.success) {
        setCurrentStatus(section.status);
      }
    });
  };

  const isPublished = currentStatus === "published";

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Label className="text-xs uppercase text-muted-foreground tracking-wide">
        Visibility
      </Label>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isPublished ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <Label htmlFor="visibility-toggle" className="font-medium">
              {isPublished ? "Published" : "Hidden"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isPublished
                ? "Visible on the public site"
                : "Hidden from public view"}
            </p>
          </div>
        </div>
        <Switch
          id="visibility-toggle"
          checked={isPublished}
          onCheckedChange={handleToggle}
          disabled={disabled || isPending}
        />
      </div>
    </div>
  );
}

function AnchorIdControl({
  section,
  disabled,
}: {
  section: Section;
  disabled?: boolean;
}): React.ReactElement {
  const [value, setValue] = useState(section.anchor_id || "");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);

  const validationError = getAnchorIdError(value);
  const error = validationError || serverError;
  const hasChanges = value !== (section.anchor_id || "");

  const handleSave = (): void => {
    if (validationError) return;

    setServerError(null);
    startTransition(async () => {
      const result = await updateSectionAnchorId(
        section.id,
        value.trim() || null
      );
      if (result.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        setServerError(result.error || "Failed to save");
      }
    });
  };

  const handleReset = (): void => {
    setValue(section.anchor_id || "");
    setServerError(null);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Label className="text-xs uppercase text-muted-foreground tracking-wide">
        Anchor ID
      </Label>
      <div className="space-y-2">
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toLowerCase().replace(/\s/g, "-"));
              setServerError(null);
              setIsSaved(false);
            }}
            placeholder="section-id"
            className={cn(
              "pl-9",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={disabled || isPending}
          />
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Use for in-page navigation links (e.g., #about)
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={disabled || isPending || !!validationError || !hasChanges}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : isSaved ? (
            <Check className="h-4 w-4 mr-1" />
          ) : null}
          {isSaved ? "Saved" : "Save"}
        </Button>
        {hasChanges && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={disabled || isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
