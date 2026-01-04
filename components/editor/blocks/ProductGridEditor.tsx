"use client";

import { useState, useEffect } from "react";
import { GripVertical, Plus, Trash2, Pencil, Link2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { cn } from "@/lib/utils";
import type {
  ProductGridContent,
  ProductItem,
  ProductLink,
  ProductIconStyle,
  ProductGridColumns,
  ProductGridGap,
} from "@/lib/section-types";
import { PRODUCT_PLATFORMS } from "@/lib/section-types";
import {
  ProductIcon,
  PRODUCT_PLATFORM_LABELS,
  PRODUCT_URL_PLACEHOLDERS,
} from "@/lib/product-icons";

interface ProductGridEditorProps {
  content: ProductGridContent;
  onChange: (content: ProductGridContent) => void;
  disabled?: boolean;
  siteId: string;
}

interface SortableItemRowProps {
  item: ProductItem;
  iconStyle: ProductIconStyle;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

function SortableItemRow({
  item,
  iconStyle,
  onEdit,
  onDelete,
  disabled,
}: SortableItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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

      {/* Thumbnail */}
      {item.image ? (
        <div className="h-12 w-12 relative rounded overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title || "Item"}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground">
          <Link2 className="h-5 w-5" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {item.title || "Untitled Item"}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {item.links.slice(0, 4).map((link, i) => (
            <ProductIcon
              key={i}
              platform={link.platform}
              style={iconStyle}
              size="small"
            />
          ))}
          {item.links.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{item.links.length - 4}
            </span>
          )}
          {item.links.length === 0 && (
            <span className="text-xs text-muted-foreground">No links</span>
          )}
        </div>
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

interface SortableLinkRowProps {
  link: ProductLink;
  linkId: string;
  onUpdate: (field: keyof ProductLink, value: string) => void;
  onRemove: () => void;
}

function SortableLinkRow({
  link,
  linkId,
  onUpdate,
  onRemove,
}: SortableLinkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: linkId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 p-3 border rounded-lg bg-muted/30",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none mt-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Select
            value={link.platform}
            onValueChange={(value) => onUpdate("platform", value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_PLATFORMS.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  <div className="flex items-center gap-2">
                    <ProductIcon
                      platform={platform}
                      style="brand"
                      size="small"
                    />
                    {PRODUCT_PLATFORM_LABELS[platform]}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 shrink-0"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <Input
          value={link.url}
          onChange={(e) => onUpdate("url", e.target.value)}
          placeholder={PRODUCT_URL_PLACEHOLDERS[link.platform]}
        />
        {link.platform === "custom" && (
          <Input
            value={link.label ?? ""}
            onChange={(e) => onUpdate("label", e.target.value)}
            placeholder="Custom label (optional)"
          />
        )}
      </div>
    </div>
  );
}

interface ItemEditorDialogProps {
  item: ProductItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: ProductItem) => void;
  siteId: string;
}

function ItemEditorDialog({
  item,
  open,
  onOpenChange,
  onSave,
  siteId,
}: ItemEditorDialogProps) {
  const [editItem, setEditItem] = useState<ProductItem>({
    id: "",
    image: "",
    title: "",
    description: "",
    links: [],
  });

  // Generate stable IDs for links (for drag-drop)
  const [linkIds, setLinkIds] = useState<string[]>([]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      if (item) {
        setEditItem(item);
        setLinkIds(item.links.map(() => crypto.randomUUID()));
      } else {
        setEditItem({
          id: crypto.randomUUID(),
          image: "",
          title: "",
          description: "",
          links: [],
        });
        setLinkIds([]);
      }
    }
  }, [open, item]);

  const linkSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleLinkDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = linkIds.indexOf(active.id as string);
    const newIndex = linkIds.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newLinks = [...editItem.links];
    const [movedLink] = newLinks.splice(oldIndex, 1);
    newLinks.splice(newIndex, 0, movedLink);

    const newLinkIds = [...linkIds];
    const [movedId] = newLinkIds.splice(oldIndex, 1);
    newLinkIds.splice(newIndex, 0, movedId);

    setEditItem({ ...editItem, links: newLinks });
    setLinkIds(newLinkIds);
  };

  const handleAddLink = (): void => {
    if (editItem.links.length >= 5) return;

    // Find a platform not already used
    const usedPlatforms = new Set(editItem.links.map((l) => l.platform));
    const availablePlatform = PRODUCT_PLATFORMS.find(
      (p) => !usedPlatforms.has(p)
    );

    setEditItem({
      ...editItem,
      links: [
        ...editItem.links,
        { platform: availablePlatform ?? "custom", url: "" },
      ],
    });
    setLinkIds([...linkIds, crypto.randomUUID()]);
  };

  const handleUpdateLink = (
    index: number,
    field: keyof ProductLink,
    value: string
  ): void => {
    const newLinks = [...editItem.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditItem({ ...editItem, links: newLinks });
  };

  const handleRemoveLink = (index: number): void => {
    setEditItem({
      ...editItem,
      links: editItem.links.filter((_, i) => i !== index),
    });
    setLinkIds(linkIds.filter((_, i) => i !== index));
  };

  const handleSave = (): void => {
    // Filter out links with empty URLs
    const cleanedItem = {
      ...editItem,
      links: editItem.links.filter((l) => l.url.trim() !== ""),
    };
    onSave(cleanedItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add Item"}</DialogTitle>
          <DialogDescription>
            Add an image, title, description, and action links for this item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image */}
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUpload
              value={editItem.image ?? ""}
              onChange={(url) => setEditItem({ ...editItem, image: url })}
              siteId={siteId}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="item-title">Title</Label>
            <Input
              id="item-title"
              value={editItem.title ?? ""}
              onChange={(e) =>
                setEditItem({ ...editItem, title: e.target.value })
              }
              placeholder="Item title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="item-description">Description (optional)</Label>
            <Textarea
              id="item-description"
              value={editItem.description ?? ""}
              onChange={(e) =>
                setEditItem({ ...editItem, description: e.target.value })
              }
              placeholder="Brief description"
              rows={2}
            />
          </div>

          {/* Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Action Links ({editItem.links.length}/5)</Label>
              {editItem.links.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLink}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Link
                </Button>
              )}
            </div>

            {/* Featured Link Selector */}
            {editItem.links.length > 0 && (
              <div className="space-y-2">
                <Label>Image Link</Label>
                <Select
                  value={editItem.featuredLinkIndex?.toString() ?? "none"}
                  onValueChange={(value) =>
                    setEditItem({
                      ...editItem,
                      featuredLinkIndex: value === "none" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select link for image click" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (image not clickable)</SelectItem>
                    {editItem.links.map((link, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        <div className="flex items-center gap-2">
                          <ProductIcon
                            platform={link.platform}
                            style="brand"
                            size="small"
                          />
                          {link.platform === "custom" && link.label
                            ? link.label
                            : PRODUCT_PLATFORM_LABELS[link.platform]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Clicking the image will open this link
                </p>
              </div>
            )}

            {editItem.links.length === 0 ? (
              <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                No links added. Add links to streaming services, stores, etc.
              </div>
            ) : (
              <DndContext
                sensors={linkSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLinkDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={linkIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {editItem.links.map((link, index) => (
                      <SortableLinkRow
                        key={linkIds[index]}
                        link={link}
                        linkId={linkIds[index]}
                        onUpdate={(field, value) =>
                          handleUpdateLink(index, field, value)
                        }
                        onRemove={() => handleRemoveLink(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {item ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProductGridEditor({
  content,
  onChange,
  disabled,
  siteId,
}: ProductGridEditorProps) {
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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

    const oldIndex = content.items.findIndex((item) => item.id === active.id);
    const newIndex = content.items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newItems = [...content.items];
    const [movedItem] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, movedItem);

    onChange({ ...content, items: newItems });
  };

  const handleAddItem = (): void => {
    setEditingItemId(null);
    setShowItemModal(true);
  };

  const handleEditItem = (itemId: string): void => {
    setEditingItemId(itemId);
    setShowItemModal(true);
  };

  const handleSaveItem = (item: ProductItem): void => {
    if (editingItemId) {
      // Update existing item
      const newItems = content.items.map((i) => (i.id === editingItemId ? item : i));
      onChange({ ...content, items: newItems });
    } else {
      // Add new item
      onChange({ ...content, items: [...content.items, item] });
    }
  };

  const handleDeleteItem = (itemId: string): void => {
    const newItems = content.items.filter((i) => i.id !== itemId);
    onChange({ ...content, items: newItems });
  };

  const editingItem = editingItemId
    ? content.items.find((i) => i.id === editingItemId) ?? null
    : null;

  const columns = content.columns ?? 3;
  const gap = content.gap ?? "medium";
  const iconStyle = content.iconStyle ?? "brand";

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <h4 className="font-medium text-sm">Section Header (optional)</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              value={content.sectionTitle ?? ""}
              onChange={(e) =>
                onChange({ ...content, sectionTitle: e.target.value })
              }
              placeholder="e.g., Our Albums, Products, Portfolio"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-subtitle">Subtitle</Label>
            <Input
              id="section-subtitle"
              value={content.sectionSubtitle ?? ""}
              onChange={(e) =>
                onChange({ ...content, sectionSubtitle: e.target.value })
              }
              placeholder="e.g., Stream on your favorite platform"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <h4 className="font-medium text-sm">Layout Settings</h4>
        <div className="grid grid-cols-3 gap-4">
          {/* Columns */}
          <div className="space-y-2">
            <Label>Columns</Label>
            <Select
              value={String(columns)}
              onValueChange={(value) =>
                onChange({
                  ...content,
                  columns:
                    value === "auto"
                      ? "auto"
                      : (parseInt(value) as ProductGridColumns),
                })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gap */}
          <div className="space-y-2">
            <Label>Spacing</Label>
            <Select
              value={gap}
              onValueChange={(value: ProductGridGap) =>
                onChange({ ...content, gap: value })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Icon Style */}
          <div className="space-y-2">
            <Label>Icon Style</Label>
            <Select
              value={iconStyle}
              onValueChange={(value: ProductIconStyle) =>
                onChange({ ...content, iconStyle: value })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brand">Brand Colors</SelectItem>
                <SelectItem value="monochrome">Monochrome</SelectItem>
                <SelectItem value="primary">Theme Primary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Card Display Options */}
        <div className="pt-3 border-t space-y-3">
          <h4 className="font-medium text-sm">Card Display</h4>
          <div className="flex items-center gap-3">
            <Switch
              id="show-titles"
              checked={content.showItemTitles ?? true}
              onCheckedChange={(checked) =>
                onChange({ ...content, showItemTitles: checked })
              }
              disabled={disabled}
            />
            <Label htmlFor="show-titles" className="cursor-pointer">
              Show titles
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="show-descriptions"
              checked={content.showItemDescriptions ?? true}
              onCheckedChange={(checked) =>
                onChange({ ...content, showItemDescriptions: checked })
              }
              disabled={disabled}
            />
            <Label htmlFor="show-descriptions" className="cursor-pointer">
              Show descriptions
            </Label>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Items ({content.items.length})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {content.items.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            <p className="text-sm">No items yet.</p>
            <p className="text-xs mt-1">
              Add items to display in your product grid.
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
              items={content.items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {content.items.map((item) => (
                  <SortableItemRow
                    key={item.id}
                    item={item}
                    iconStyle={iconStyle}
                    onEdit={() => handleEditItem(item.id)}
                    onDelete={() => handleDeleteItem(item.id)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Styling Options (Collapsible) */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            Advanced Styling Options
            <span className="text-xs text-muted-foreground">
              {content.enableStyling ? "Enabled" : "Disabled"}
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="space-y-4 p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Advanced styling options coming soon. Enable custom backgrounds,
              borders, and card styling.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Item Editor Dialog */}
      <ItemEditorDialog
        item={editingItem}
        open={showItemModal}
        onOpenChange={setShowItemModal}
        onSave={handleSaveItem}
        siteId={siteId}
      />
    </div>
  );
}
