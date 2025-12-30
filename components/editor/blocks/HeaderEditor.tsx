"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OverrideField } from "@/components/editor/OverrideField";
import { cn } from "@/lib/utils";
import type { HeaderContent, HeaderLayout, NavLink } from "@/lib/section-types";

interface HeaderEditorProps {
  content: HeaderContent;
  onChange: (content: HeaderContent) => void;
  disabled?: boolean;
  siteId: string;
  /** Mode determines which controls are shown:
   * - "site": Full editing (for SettingsTab)
   * - "page": Override-only controls (for page sections)
   */
  mode?: "site" | "page";
}

const DEFAULT_LINK: NavLink = {
  label: "New Link",
  url: "#",
};

// ============================================================================
// SortableLinkItem Component
// ============================================================================

interface SortableLinkItemProps {
  id: string;
  link: NavLink;
  index: number;
  onLinkChange: (index: number, field: keyof NavLink, value: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

function SortableLinkItem({
  id,
  link,
  index,
  onLinkChange,
  onRemove,
  disabled,
}: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-end gap-3", isDragging && "opacity-50 z-50")}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors mb-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Label Input */}
      <div className="flex-1 space-y-2">
        <Label
          htmlFor={`nav-${index}-label`}
          className="text-xs text-muted-foreground"
        >
          Label
        </Label>
        <Input
          id={`nav-${index}-label`}
          value={link.label}
          onChange={(e) => onLinkChange(index, "label", e.target.value)}
          placeholder="Link text"
          disabled={disabled}
        />
      </div>

      {/* URL Input */}
      <div className="flex-1 space-y-2">
        <Label
          htmlFor={`nav-${index}-url`}
          className="text-xs text-muted-foreground"
        >
          URL
        </Label>
        <Input
          id={`nav-${index}-url`}
          value={link.url}
          onChange={(e) => onLinkChange(index, "url", e.target.value)}
          placeholder="/about"
          disabled={disabled}
        />
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-muted-foreground hover:text-destructive flex-shrink-0"
        onClick={() => onRemove(index)}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove link</span>
      </Button>
    </div>
  );
}

// ============================================================================
// HeaderEditor Component
// ============================================================================

export function HeaderEditor({
  content,
  onChange,
  disabled,
  siteId,
  mode = "site",
}: HeaderEditorProps) {
  const handleFieldChange = (field: keyof HeaderContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  const handleBooleanChange = (field: keyof HeaderContent, value: boolean): void => {
    onChange({ ...content, [field]: value });
  };

  const handleLinkChange = (
    index: number,
    field: keyof NavLink,
    value: string
  ): void => {
    const newLinks = [...content.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange({ ...content, links: newLinks });
  };

  const handleAddLink = (): void => {
    onChange({
      ...content,
      links: [...content.links, { ...DEFAULT_LINK }],
    });
  };

  const handleRemoveLink = (index: number): void => {
    const newLinks = content.links.filter((_, i) => i !== index);
    onChange({ ...content, links: newLinks });
  };

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle drag end - reorder links array
  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = content.links.findIndex((_, i) => `link-${i}` === active.id);
    const newIndex = content.links.findIndex((_, i) => `link-${i}` === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newLinks = [...content.links];
    const [movedLink] = newLinks.splice(oldIndex, 1);
    newLinks.splice(newIndex, 0, movedLink);

    onChange({ ...content, links: newLinks });
  };

  // Page mode: Show override controls only
  if (mode === "page") {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Header content (logo, name, links) is managed in Site Settings.
          Enable overrides below to customize styling for this page only.
        </p>

        {/* Override: Layout */}
        <OverrideField
          id="override-layout"
          label="Layout"
          description="Use a different header layout on this page"
          enabled={content.overrideLayout ?? false}
          onEnabledChange={(enabled) =>
            onChange({ ...content, overrideLayout: enabled })
          }
          disabled={disabled}
        >
          <Select
            value={content.layout ?? "left"}
            onValueChange={(value) =>
              onChange({ ...content, layout: value as HeaderLayout })
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left - Logo on the left</SelectItem>
              <SelectItem value="right">Right - Logo on the right</SelectItem>
              <SelectItem value="center">Center - Logo centered, nav below</SelectItem>
            </SelectContent>
          </Select>
        </OverrideField>

        {/* Override: Sticky */}
        <OverrideField
          id="override-sticky"
          label="Sticky Behavior"
          description="Change sticky header behavior on this page"
          enabled={content.overrideSticky ?? false}
          onEnabledChange={(enabled) =>
            onChange({ ...content, overrideSticky: enabled })
          }
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="page-header-sticky"
              checked={content.sticky ?? true}
              onCheckedChange={(checked) =>
                handleBooleanChange("sticky", checked)
              }
              disabled={disabled}
            />
            <Label htmlFor="page-header-sticky" className="text-sm">
              {content.sticky ? "Sticky" : "Not sticky"}
            </Label>
          </div>
        </OverrideField>

        {/* Override: Show Logo Text */}
        <OverrideField
          id="override-showLogoText"
          label="Site Name Visibility"
          description="Change site name display on this page"
          enabled={content.overrideShowLogoText ?? false}
          onEnabledChange={(enabled) =>
            onChange({ ...content, overrideShowLogoText: enabled })
          }
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Switch
              id="page-header-showLogoText"
              checked={content.showLogoText ?? true}
              onCheckedChange={(checked) =>
                handleBooleanChange("showLogoText", checked)
              }
              disabled={disabled}
            />
            <Label htmlFor="page-header-showLogoText" className="text-sm">
              {content.showLogoText ? "Show site name" : "Hide site name"}
            </Label>
          </div>
        </OverrideField>

        {/* Override: CTA */}
        <OverrideField
          id="override-cta"
          label="CTA Button"
          description="Use different CTA settings on this page"
          enabled={content.overrideCta ?? false}
          onEnabledChange={(enabled) =>
            onChange({ ...content, overrideCta: enabled })
          }
          disabled={disabled}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="page-header-showCta"
                checked={content.showCta ?? true}
                onCheckedChange={(checked) =>
                  handleBooleanChange("showCta", checked)
                }
                disabled={disabled}
              />
              <Label htmlFor="page-header-showCta" className="text-sm">
                {content.showCta ? "Show CTA" : "Hide CTA"}
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page-ctaText" className="text-xs">
                  Button Text
                </Label>
                <Input
                  id="page-ctaText"
                  value={content.ctaText || ""}
                  onChange={(e) => handleFieldChange("ctaText", e.target.value)}
                  placeholder="Get Started"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-ctaUrl" className="text-xs">
                  Button URL
                </Label>
                <Input
                  id="page-ctaUrl"
                  value={content.ctaUrl || ""}
                  onChange={(e) => handleFieldChange("ctaUrl", e.target.value)}
                  placeholder="/signup"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </OverrideField>
      </div>
    );
  }

  // Site mode: Full editing interface
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="header-siteName">Site Name</Label>
        <Input
          id="header-siteName"
          value={content.siteName}
          onChange={(e) => handleFieldChange("siteName", e.target.value)}
          placeholder="Your Site Name"
          disabled={disabled}
        />
      </div>

      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Logo is configured in the <strong>Logo & Branding</strong> section above.
        </p>
      </div>

      <div className="space-y-4">
        <Label>Navigation Links</Label>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={content.links.map((_, i) => `link-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {content.links.map((link, index) => (
                <SortableLinkItem
                  key={`link-${index}`}
                  id={`link-${index}`}
                  link={link}
                  index={index}
                  onLinkChange={handleLinkChange}
                  onRemove={handleRemoveLink}
                  disabled={disabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddLink}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Navigation Link
        </Button>
      </div>

      {/* CTA Button Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="header-showCta">Show CTA Button</Label>
            <p className="text-xs text-muted-foreground">
              Display a call-to-action button in the header
            </p>
          </div>
          <Switch
            id="header-showCta"
            checked={content.showCta ?? true}
            onCheckedChange={(checked) => handleBooleanChange("showCta", checked)}
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="header-ctaText">CTA Button Text</Label>
            <Input
              id="header-ctaText"
              value={content.ctaText || ""}
              onChange={(e) => handleFieldChange("ctaText", e.target.value)}
              placeholder="Get Started"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="header-ctaUrl">CTA Button URL</Label>
            <Input
              id="header-ctaUrl"
              value={content.ctaUrl || ""}
              onChange={(e) => handleFieldChange("ctaUrl", e.target.value)}
              placeholder="/signup"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Header Styling Options */}
      <div className="space-y-4 pt-4 border-t">
        <Label className="text-sm font-medium">Header Style</Label>

        <div className="space-y-2">
          <Label htmlFor="header-layout">Layout</Label>
          <Select
            value={content.layout ?? "left"}
            onValueChange={(value) => onChange({ ...content, layout: value as HeaderLayout })}
            disabled={disabled}
          >
            <SelectTrigger id="header-layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left - Logo on the left</SelectItem>
              <SelectItem value="right">Right - Logo on the right</SelectItem>
              <SelectItem value="center">Center - Logo centered, nav below</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="header-sticky">Sticky Header</Label>
            <p className="text-xs text-muted-foreground">
              Header stays visible when scrolling
            </p>
          </div>
          <Switch
            id="header-sticky"
            checked={content.sticky ?? true}
            onCheckedChange={(checked) => handleBooleanChange("sticky", checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="header-showLogoText">Show Site Name</Label>
            <p className="text-xs text-muted-foreground">
              Display site name text next to logo
            </p>
          </div>
          <Switch
            id="header-showLogoText"
            checked={content.showLogoText ?? true}
            onCheckedChange={(checked) => handleBooleanChange("showLogoText", checked)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
