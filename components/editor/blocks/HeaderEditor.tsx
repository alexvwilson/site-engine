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
import { ImageUpload } from "@/components/editor/ImageUpload";
import { cn } from "@/lib/utils";
import type { HeaderContent, NavLink } from "@/lib/section-types";

interface HeaderEditorProps {
  content: HeaderContent;
  onChange: (content: HeaderContent) => void;
  disabled?: boolean;
  siteId: string;
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
}: HeaderEditorProps) {
  const handleFieldChange = (field: keyof HeaderContent, value: string): void => {
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

      <div className="space-y-2">
        <Label>Logo (optional)</Label>
        <ImageUpload
          value={content.logoUrl || ""}
          onChange={(url) => handleFieldChange("logoUrl", url)}
          siteId={siteId}
          disabled={disabled}
          placeholder="Drag & drop your logo"
        />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="header-ctaText">CTA Button Text (optional)</Label>
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
  );
}
