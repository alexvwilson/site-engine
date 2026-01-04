"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, Pencil } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SocialLink, SocialPlatform, SocialIconStyle } from "@/lib/section-types";
import {
  SocialIcon,
  SOCIAL_PLATFORMS,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_URL_PLACEHOLDERS,
} from "@/lib/social-icons";

interface SocialLinksManagerProps {
  links: SocialLink[];
  iconStyle: SocialIconStyle;
  onLinksChange: (links: SocialLink[]) => void;
  onIconStyleChange: (style: SocialIconStyle) => void;
  disabled?: boolean;
  primaryColor?: string;
}

interface SortableLinkRowProps {
  link: SocialLink;
  iconStyle: SocialIconStyle;
  primaryColor: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

function SortableLinkRow({
  link,
  iconStyle,
  primaryColor,
  onEdit,
  onDelete,
  disabled,
}: SortableLinkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${link.platform}-${link.url}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-background border rounded-lg",
        isDragging && "opacity-50 shadow-lg",
        disabled && "opacity-60"
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        disabled={disabled}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <SocialIcon
        platform={link.platform}
        style={iconStyle}
        size="medium"
        primaryColor={primaryColor}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">
          {SOCIAL_PLATFORM_LABELS[link.platform]}
        </p>
        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          disabled={disabled}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={disabled}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SocialLinksManager({
  links,
  iconStyle,
  onLinksChange,
  onIconStyleChange,
  disabled = false,
  primaryColor = "#3B82F6",
}: SocialLinksManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPlatform, setEditPlatform] = useState<SocialPlatform>("facebook");
  const [editUrl, setEditUrl] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = links.findIndex(
      (l) => `${l.platform}-${l.url}` === active.id
    );
    const newIndex = links.findIndex(
      (l) => `${l.platform}-${l.url}` === over.id
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newLinks = [...links];
    const [movedLink] = newLinks.splice(oldIndex, 1);
    newLinks.splice(newIndex, 0, movedLink);

    onLinksChange(newLinks);
  };

  const handleAddClick = (): void => {
    // Find a platform that isn't already added
    const usedPlatforms = new Set(links.map((l) => l.platform));
    const availablePlatform = SOCIAL_PLATFORMS.find(
      (p) => !usedPlatforms.has(p)
    );
    setEditPlatform(availablePlatform || "facebook");
    setEditUrl("");
    setEditingIndex(null);
    setShowAddModal(true);
  };

  const handleEditClick = (index: number): void => {
    const link = links[index];
    setEditPlatform(link.platform);
    setEditUrl(link.url);
    setEditingIndex(index);
    setShowAddModal(true);
  };

  const handleSaveLink = (): void => {
    if (!editUrl.trim()) return;

    const newLink: SocialLink = {
      platform: editPlatform,
      url: editUrl.trim(),
    };

    if (editingIndex !== null) {
      // Update existing
      const newLinks = [...links];
      newLinks[editingIndex] = newLink;
      onLinksChange(newLinks);
    } else {
      // Add new
      onLinksChange([...links, newLink]);
    }

    setShowAddModal(false);
  };

  const handleDeleteLink = (index: number): void => {
    const newLinks = links.filter((_, i) => i !== index);
    onLinksChange(newLinks);
  };

  // Get platforms that aren't already added (for add mode)
  const usedPlatforms = new Set(links.map((l) => l.platform));
  const availablePlatforms =
    editingIndex !== null
      ? SOCIAL_PLATFORMS // When editing, show all platforms
      : SOCIAL_PLATFORMS.filter((p) => !usedPlatforms.has(p));

  return (
    <div className="space-y-4">
      {/* Icon Style Selector */}
      <div className="space-y-2">
        <Label>Icon Style</Label>
        <Select
          value={iconStyle}
          onValueChange={(value) => onIconStyleChange(value as SocialIconStyle)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brand">Brand Colors (Default)</SelectItem>
            <SelectItem value="monochrome">Monochrome</SelectItem>
            <SelectItem value="primary">Theme Primary</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {iconStyle === "brand" &&
            "Icons display in their official brand colors."}
          {iconStyle === "monochrome" &&
            "Icons display in a single neutral color."}
          {iconStyle === "primary" &&
            "Icons display in your site's primary theme color."}
        </p>
      </div>

      {/* Links List with Drag and Drop */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Social Links</Label>
          {availablePlatforms.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddClick}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          )}
        </div>

        {links.length === 0 ? (
          <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
            <p className="text-sm">No social links added yet.</p>
            <p className="text-xs mt-1">
              Add links to display them in your header, footer, or as a block.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={links.map((l) => `${l.platform}-${l.url}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {links.map((link, index) => (
                  <SortableLinkRow
                    key={`${link.platform}-${link.url}`}
                    link={link}
                    iconStyle={iconStyle}
                    primaryColor={primaryColor}
                    onEdit={() => handleEditClick(index)}
                    onDelete={() => handleDeleteLink(index)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Preview */}
      {links.length > 0 && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {links.map((link) => (
              <a
                key={`${link.platform}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <SocialIcon
                  platform={link.platform}
                  style={iconStyle}
                  size="medium"
                  primaryColor={primaryColor}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Social Link" : "Add Social Link"}
            </DialogTitle>
            <DialogDescription>
              Add a link to your social media profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={editPlatform}
                onValueChange={(value) => {
                  setEditPlatform(value as SocialPlatform);
                  // Update placeholder URL when platform changes
                  if (!editUrl || editUrl === SOCIAL_URL_PLACEHOLDERS[editPlatform]) {
                    setEditUrl("");
                  }
                }}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(editingIndex !== null ? SOCIAL_PLATFORMS : availablePlatforms).map(
                    (platform) => (
                      <SelectItem key={platform} value={platform}>
                        <div className="flex items-center gap-2">
                          <SocialIcon
                            platform={platform}
                            style="brand"
                            size="small"
                          />
                          {SOCIAL_PLATFORM_LABELS[platform]}
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder={SOCIAL_URL_PLACEHOLDERS[editPlatform]}
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the full URL to your {SOCIAL_PLATFORM_LABELS[editPlatform]}{" "}
                profile or page.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveLink}
              disabled={!editUrl.trim()}
            >
              {editingIndex !== null ? "Save Changes" : "Add Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
