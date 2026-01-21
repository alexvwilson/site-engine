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
import { ImageUpload } from "@/components/editor/ImageUpload";
import { IconPicker } from "@/components/editor/IconPicker";
import {
  StylingControls,
  CardBackgroundPanel,
} from "@/components/editor/StylingControls";
import { cn } from "@/lib/utils";
import type {
  CardsContent,
  CardsTemplate,
  CardsColumns,
  CardsGap,
  CardItem,
  FeatureCardItem,
  TestimonialCardItem,
  ProductCardItem,
  ProductLink,
  ProductIconStyle,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";
import { PRODUCT_PLATFORMS } from "@/lib/section-types";
import {
  ProductIcon,
  PRODUCT_PLATFORM_LABELS,
  PRODUCT_URL_PLACEHOLDERS,
} from "@/lib/product-icons";

interface CardsEditorProps {
  content: CardsContent;
  onChange: (content: CardsContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

// Default items for each template
const DEFAULT_FEATURE_ITEM: FeatureCardItem = {
  id: "",
  icon: "star",
  title: "New Feature",
  description: "Describe this feature",
};

const DEFAULT_TESTIMONIAL_ITEM: TestimonialCardItem = {
  id: "",
  quote: "This is an amazing product!",
  author: "Customer Name",
  role: "Job Title, Company",
  avatar: "",
};

// Type guards
function isFeatureItem(item: CardItem): item is FeatureCardItem {
  return "icon" in item && "title" in item && "description" in item;
}

function isTestimonialItem(item: CardItem): item is TestimonialCardItem {
  return "quote" in item && "author" in item && "role" in item;
}

function isProductItem(item: CardItem): item is ProductCardItem {
  return "links" in item && Array.isArray((item as ProductCardItem).links);
}

// =============================================================================
// Sortable Feature Card
// =============================================================================
interface SortableFeatureCardProps {
  item: FeatureCardItem;
  index: number;
  onUpdate: (field: keyof FeatureCardItem, value: string | boolean | undefined) => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

function SortableFeatureCard({
  item,
  index,
  onUpdate,
  onRemove,
  disabled,
  canRemove,
}: SortableFeatureCardProps) {
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
        "border rounded-lg p-4 space-y-3",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
            disabled={disabled}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Feature {index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          disabled={disabled || !canRemove}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove feature</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Icon</Label>
          <IconPicker
            value={item.icon}
            onChange={(icon) => onUpdate("icon", icon)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`feature-${index}-title`}>Title</Label>
          <Input
            id={`feature-${index}-title`}
            value={item.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Feature title"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`feature-${index}-subtitle`}>Subtitle (optional)</Label>
        <Input
          id={`feature-${index}-subtitle`}
          value={item.subtitle || ""}
          onChange={(e) => onUpdate("subtitle", e.target.value)}
          placeholder="A short tagline"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`feature-${index}-description`}>Description</Label>
        <Textarea
          id={`feature-${index}-description`}
          value={item.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Describe this feature"
          rows={2}
          disabled={disabled}
        />
      </div>

      {/* Optional Button */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor={`feature-${index}-show-button`}>Show Button</Label>
          <Switch
            id={`feature-${index}-show-button`}
            checked={item.showButton ?? false}
            onCheckedChange={(checked) => onUpdate("showButton", checked)}
            disabled={disabled}
          />
        </div>

        {item.showButton && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`feature-${index}-button-text`}>Button Text</Label>
                <Input
                  id={`feature-${index}-button-text`}
                  value={item.buttonText || ""}
                  onChange={(e) => onUpdate("buttonText", e.target.value)}
                  placeholder="Learn More"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`feature-${index}-button-url`}>Button URL</Label>
                <Input
                  id={`feature-${index}-button-url`}
                  value={item.buttonUrl || ""}
                  onChange={(e) => onUpdate("buttonUrl", e.target.value)}
                  placeholder="/blog/my-post"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Sortable Testimonial Card
// =============================================================================
interface SortableTestimonialCardProps {
  item: TestimonialCardItem;
  index: number;
  onUpdate: (field: keyof TestimonialCardItem, value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
  siteId: string;
}

function SortableTestimonialCard({
  item,
  index,
  onUpdate,
  onRemove,
  disabled,
  canRemove,
  siteId,
}: SortableTestimonialCardProps) {
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
        "border rounded-lg p-4 space-y-3",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
            disabled={disabled}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Testimonial {index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          disabled={disabled || !canRemove}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove testimonial</span>
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`testimonial-${index}-quote`}>Quote</Label>
        <Textarea
          id={`testimonial-${index}-quote`}
          value={item.quote}
          onChange={(e) => onUpdate("quote", e.target.value)}
          placeholder="What they said about your product or service"
          rows={3}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`testimonial-${index}-author`}>Author Name</Label>
          <Input
            id={`testimonial-${index}-author`}
            value={item.author}
            onChange={(e) => onUpdate("author", e.target.value)}
            placeholder="Jane Smith"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`testimonial-${index}-role`}>Role/Title</Label>
          <Input
            id={`testimonial-${index}-role`}
            value={item.role}
            onChange={(e) => onUpdate("role", e.target.value)}
            placeholder="CEO, Example Corp"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Avatar (optional)</Label>
        <ImageUpload
          value={item.avatar ?? ""}
          onChange={(url) => onUpdate("avatar", url)}
          siteId={siteId}
          disabled={disabled}
          placeholder="Drag & drop an avatar"
        />
      </div>
    </div>
  );
}

// =============================================================================
// Sortable Product Card Row (for list view)
// =============================================================================
interface SortableProductRowProps {
  item: ProductCardItem;
  iconStyle: ProductIconStyle;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

function SortableProductRow({
  item,
  iconStyle,
  onEdit,
  onDelete,
  disabled,
}: SortableProductRowProps) {
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

// =============================================================================
// Sortable Link Row (for product editor dialog)
// =============================================================================
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

// =============================================================================
// Product Item Editor Dialog
// =============================================================================
interface ProductItemEditorDialogProps {
  item: ProductCardItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: ProductCardItem) => void;
  siteId: string;
}

function ProductItemEditorDialog({
  item,
  open,
  onOpenChange,
  onSave,
  siteId,
}: ProductItemEditorDialogProps) {
  const [editItem, setEditItem] = useState<ProductCardItem>({
    id: "",
    image: "",
    title: "",
    description: "",
    links: [],
  });

  const [linkIds, setLinkIds] = useState<string[]>([]);

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
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleLinkDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = linkIds.indexOf(active.id as string);
    const newIndex = linkIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

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
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUpload
              value={editItem.image ?? ""}
              onChange={(url) => setEditItem({ ...editItem, image: url })}
              siteId={siteId}
            />
          </div>

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

            {editItem.links.length > 0 && (
              <div className="space-y-2">
                <Label>Image Link</Label>
                <Select
                  value={editItem.featuredLinkIndex?.toString() ?? "none"}
                  onValueChange={(value) =>
                    setEditItem({
                      ...editItem,
                      featuredLinkIndex:
                        value === "none" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select link for image click" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      None (image not clickable)
                    </SelectItem>
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

// =============================================================================
// Main CardsEditor Component
// =============================================================================
export function CardsEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: CardsEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const template = content.template;
  const items = content.items;

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, movedItem);

    onChange({ ...content, items: newItems });
  };

  // Add item handlers
  const handleAddFeature = (): void => {
    const newItem: FeatureCardItem = {
      ...DEFAULT_FEATURE_ITEM,
      id: crypto.randomUUID(),
    };
    onChange({ ...content, items: [...items, newItem] });
  };

  const handleAddTestimonial = (): void => {
    const newItem: TestimonialCardItem = {
      ...DEFAULT_TESTIMONIAL_ITEM,
      id: crypto.randomUUID(),
    };
    onChange({ ...content, items: [...items, newItem] });
  };

  const handleAddProduct = (): void => {
    setEditingProductId(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (itemId: string): void => {
    setEditingProductId(itemId);
    setShowProductModal(true);
  };

  const handleSaveProduct = (item: ProductCardItem): void => {
    if (editingProductId) {
      const newItems = items.map((i) => (i.id === editingProductId ? item : i));
      onChange({ ...content, items: newItems });
    } else {
      onChange({ ...content, items: [...items, item] });
    }
  };

  // Update item handlers
  const handleUpdateFeature = (
    index: number,
    field: keyof FeatureCardItem,
    value: string | boolean | undefined
  ): void => {
    const newItems = [...items];
    const item = newItems[index] as FeatureCardItem;
    newItems[index] = { ...item, [field]: value };
    onChange({ ...content, items: newItems });
  };

  const handleUpdateTestimonial = (
    index: number,
    field: keyof TestimonialCardItem,
    value: string
  ): void => {
    const newItems = [...items];
    const item = newItems[index] as TestimonialCardItem;
    newItems[index] = { ...item, [field]: value };
    onChange({ ...content, items: newItems });
  };

  // Remove item handler
  const handleRemoveItem = (index: number): void => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...content, items: newItems });
  };

  // Template change handler
  const handleTemplateChange = (newTemplate: CardsTemplate): void => {
    // When switching templates, reset items to defaults for new template
    let newItems: CardItem[] = [];

    switch (newTemplate) {
      case "feature":
        newItems = [
          { ...DEFAULT_FEATURE_ITEM, id: crypto.randomUUID() },
          {
            ...DEFAULT_FEATURE_ITEM,
            id: crypto.randomUUID(),
            icon: "zap",
            title: "Feature Two",
          },
          {
            ...DEFAULT_FEATURE_ITEM,
            id: crypto.randomUUID(),
            icon: "shield",
            title: "Feature Three",
          },
        ];
        break;
      case "testimonial":
        newItems = [{ ...DEFAULT_TESTIMONIAL_ITEM, id: crypto.randomUUID() }];
        break;
      case "product":
        newItems = [];
        break;
    }

    onChange({ ...content, template: newTemplate, items: newItems });
  };

  const updateField = <K extends keyof CardsContent>(
    field: K,
    value: CardsContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  const editingProduct = editingProductId
    ? (items.find((i) => i.id === editingProductId) as ProductCardItem | undefined) ?? null
    : null;

  const templateLabel =
    template === "feature"
      ? "Features"
      : template === "testimonial"
        ? "Testimonials"
        : "Products";

  return (
    <div className="space-y-6">
      {/* Content Section */}
      {showContent && (
        <>
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={template}
              onValueChange={(v) => handleTemplateChange(v as CardsTemplate)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature Cards</SelectItem>
                <SelectItem value="testimonial">Testimonials</SelectItem>
                <SelectItem value="product">Product Grid</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changing template will reset the card items.
            </p>
          </div>

          {/* Section Header */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title (optional)</Label>
              <Input
                id="section-title"
                value={content.sectionTitle || ""}
                onChange={(e) => updateField("sectionTitle", e.target.value)}
                placeholder={`Our ${templateLabel}`}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-subtitle">Section Subtitle (optional)</Label>
              <Textarea
                id="section-subtitle"
                value={content.sectionSubtitle || ""}
                onChange={(e) => updateField("sectionSubtitle", e.target.value)}
                placeholder="A brief description"
                rows={2}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <Label>
              {templateLabel} ({items.length})
            </Label>

            {items.length === 0 ? (
              <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                <p className="text-sm">No items yet.</p>
                <p className="text-xs mt-1">Add items to display.</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      if (template === "feature" && isFeatureItem(item)) {
                        return (
                          <SortableFeatureCard
                            key={item.id}
                            item={item}
                            index={index}
                            onUpdate={(field, value) =>
                              handleUpdateFeature(index, field, value)
                            }
                            onRemove={() => handleRemoveItem(index)}
                            disabled={disabled}
                            canRemove={items.length > 1}
                          />
                        );
                      }

                      if (template === "testimonial" && isTestimonialItem(item)) {
                        return (
                          <SortableTestimonialCard
                            key={item.id}
                            item={item}
                            index={index}
                            onUpdate={(field, value) =>
                              handleUpdateTestimonial(index, field, value)
                            }
                            onRemove={() => handleRemoveItem(index)}
                            disabled={disabled}
                            canRemove={items.length > 1}
                            siteId={siteId}
                          />
                        );
                      }

                      if (template === "product" && isProductItem(item)) {
                        return (
                          <SortableProductRow
                            key={item.id}
                            item={item}
                            iconStyle={content.iconStyle ?? "brand"}
                            onEdit={() => handleEditProduct(item.id)}
                            onDelete={() => handleRemoveItem(index)}
                            disabled={disabled}
                          />
                        );
                      }

                      return null;
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Add button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={
                template === "feature"
                  ? handleAddFeature
                  : template === "testimonial"
                    ? handleAddTestimonial
                    : handleAddProduct
              }
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {template === "feature" ? "Feature" : template === "testimonial" ? "Testimonial" : "Item"}
            </Button>
          </div>
        </>
      )}

      {/* Layout Section */}
      {showLayout && (
        <>
          {/* Layout Settings */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium text-sm">Layout Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Columns</Label>
                <Select
                  value={String(content.columns ?? 3)}
                  onValueChange={(value) =>
                    updateField(
                      "columns",
                      value === "auto" ? "auto" : (parseInt(value) as CardsColumns)
                    )
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

              <div className="space-y-2">
                <Label>Spacing</Label>
                <Select
                  value={content.gap ?? "medium"}
                  onValueChange={(value: CardsGap) =>
                    updateField("gap", value)
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
            </div>

            {/* Product-specific: Icon Style */}
            {template === "product" && (
              <>
                <div className="space-y-2">
                  <Label>Icon Style</Label>
                  <Select
                    value={content.iconStyle ?? "brand"}
                    onValueChange={(value: ProductIconStyle) =>
                      updateField("iconStyle", value)
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

                <div className="pt-3 border-t space-y-3">
                  <h4 className="font-medium text-sm">Card Display</h4>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="show-titles"
                      checked={content.showItemTitles ?? true}
                      onCheckedChange={(checked) =>
                        updateField("showItemTitles", checked)
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
                        updateField("showItemDescriptions", checked)
                      }
                      disabled={disabled}
                    />
                    <Label htmlFor="show-descriptions" className="cursor-pointer">
                      Show descriptions
                    </Label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Styling Controls (Feature & Testimonial templates) */}
          {(template === "feature" || template === "testimonial") && (
            <StylingControls
              content={content}
              onChange={onChange}
              disabled={disabled}
              siteId={siteId}
              textSizeDescription={
                template === "feature"
                  ? "Scales feature titles and descriptions proportionally."
                  : "Scales quotes, author names, and roles proportionally."
              }
            >
              <CardBackgroundPanel
                title={template === "feature" ? "Feature Cards" : "Testimonial Cards"}
                showCardBackground={content.showCardBackground ?? true}
                cardBackgroundColor={content.cardBackgroundColor}
                onShowCardBackgroundChange={(checked) =>
                  updateField("showCardBackground", checked)
                }
                onCardBackgroundColorChange={(color) =>
                  updateField("cardBackgroundColor", color)
                }
                onCardBackgroundColorReset={() => updateField("cardBackgroundColor", "")}
                disabled={disabled}
                showDescription="Cards have solid backgrounds (text uses theme colors)"
                hideDescription="Cards are transparent (text adapts to section background)"
              />
            </StylingControls>
          )}
        </>
      )}

      {/* Product Item Editor Dialog */}
      {template === "product" && (
        <ProductItemEditorDialog
          item={editingProduct}
          open={showProductModal}
          onOpenChange={setShowProductModal}
          onSave={handleSaveProduct}
          siteId={siteId}
        />
      )}
    </div>
  );
}
