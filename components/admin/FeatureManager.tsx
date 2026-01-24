"use client";

import { useState, useTransition } from "react";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";
import {
  createFeature,
  updateFeature,
  deleteFeature,
  reorderFeatures,
  toggleFeatureActive,
} from "@/app/actions/landing-content";
import {
  ALLOWED_FEATURE_ICONS,
  getFeatureIcon,
  type FeatureIconName,
} from "@/lib/feature-icons";
import type { LandingFeature } from "@/lib/drizzle/schema/landing-content";

interface FeatureManagerProps {
  initialFeatures: LandingFeature[];
}

export function FeatureManager({ initialFeatures }: FeatureManagerProps) {
  const [features, setFeatures] = useState(initialFeatures);
  const [editingFeature, setEditingFeature] = useState<LandingFeature | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = features.findIndex((f) => f.id === active.id);
    const newIndex = features.findIndex((f) => f.id === over.id);
    const newOrder = arrayMove(features, oldIndex, newIndex);

    setFeatures(newOrder);
    startTransition(async () => {
      await reorderFeatures(newOrder.map((f) => f.id));
    });
  }

  function handleOpenAdd() {
    setEditingFeature(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(feature: LandingFeature) {
    setEditingFeature(feature);
    setIsDialogOpen(true);
  }

  async function handleSave(data: {
    title: string;
    description: string;
    icon_name: string;
  }) {
    if (editingFeature) {
      await updateFeature(editingFeature.id, data);
      setFeatures((prev) =>
        prev.map((f) => (f.id === editingFeature.id ? { ...f, ...data } : f))
      );
    } else {
      await createFeature(data);
    }
    setIsDialogOpen(false);
  }

  async function handleToggle(id: string, isActive: boolean) {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_active: isActive } : f))
    );
    startTransition(async () => {
      await toggleFeatureActive(id, isActive);
    });
  }

  async function handleDelete() {
    if (!deleteId) return;
    setFeatures((prev) => prev.filter((f) => f.id !== deleteId));
    await deleteFeature(deleteId);
    setDeleteId(null);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Feature Items</CardTitle>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add Feature
          </Button>
        </CardHeader>
        <CardContent>
          {features.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No features yet. Add your first feature above.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={features.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {features.map((feature) => (
                    <SortableFeatureItem
                      key={feature.id}
                      feature={feature}
                      onEdit={() => handleOpenEdit(feature)}
                      onToggle={(active) => handleToggle(feature.id, active)}
                      onDelete={() => setDeleteId(feature.id)}
                      disabled={isPending}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <FeatureDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        feature={editingFeature}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this feature item. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================================
// Sortable Feature Item
// ============================================================================

function SortableFeatureItem({
  feature,
  onEdit,
  onToggle,
  onDelete,
  disabled,
}: {
  feature: LandingFeature;
  onEdit: () => void;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getFeatureIcon(feature.icon_name);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
        disabled={disabled}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{feature.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {feature.description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={feature.is_active}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          disabled={disabled}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Feature Dialog (Add/Edit)
// ============================================================================

function FeatureDialog({
  open,
  onOpenChange,
  feature,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: LandingFeature | null;
  onSave: (data: {
    title: string;
    description: string;
    icon_name: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState<FeatureIconName>("sparkles");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTitle(feature?.title ?? "");
      setDescription(feature?.description ?? "");
      setIconName((feature?.icon_name as FeatureIconName) ?? "sparkles");
    }
    onOpenChange(open);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSaving(true);
    await onSave({
      title: title.trim(),
      description: description.trim(),
      icon_name: iconName,
    });
    setIsSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{feature ? "Edit Feature" : "Add Feature"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AI Theme Generation"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this feature does..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={iconName}
                onValueChange={(v) => setIconName(v as FeatureIconName)}
              >
                <SelectTrigger id="icon">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_FEATURE_ICONS.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <SelectItem key={item.name} value={item.name}>
                        <div className="flex items-center gap-2">
                          <ItemIcon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {feature ? "Save Changes" : "Add Feature"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
