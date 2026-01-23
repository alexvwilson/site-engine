"use client";

import { useState, useEffect } from "react";
import { GripVertical, Plus, Trash2, Pencil, Check, X, Minus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StylingControls } from "@/components/editor/StylingControls";
import { cn } from "@/lib/utils";
import type {
  PricingContent,
  PricingMode,
  PricingTier,
  PricingFeature,
  PricingFeatureStatus,
  PricingCurrency,
  PricingPeriod,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";

interface PricingEditorProps {
  content: PricingContent;
  onChange: (content: PricingContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

const MODE_LABELS: Record<PricingMode, string> = {
  simple: "Simple",
  toggle: "Toggle",
  comparison: "Comparison",
};

const MODE_DESCRIPTIONS: Record<PricingMode, string> = {
  simple: "Basic pricing cards in a grid",
  toggle: "Monthly/annual toggle with price switching",
  comparison: "Feature comparison table",
};

const CURRENCY_OPTIONS: { value: PricingCurrency; label: string }[] = [
  { value: "$", label: "$ (USD)" },
  { value: "€", label: "€ (EUR)" },
  { value: "£", label: "£ (GBP)" },
  { value: "¥", label: "¥ (JPY/CNY)" },
  { value: "custom", label: "Custom" },
];

const PERIOD_OPTIONS: { value: PricingPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly (/mo)" },
  { value: "annual", label: "Annual (/year)" },
  { value: "one-time", label: "One-time" },
  { value: "custom", label: "Custom" },
];

const COLUMN_OPTIONS = [
  { value: "2", label: "2 Columns" },
  { value: "3", label: "3 Columns" },
  { value: "4", label: "4 Columns" },
  { value: "auto", label: "Auto" },
];

const GAP_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const RADIUS_OPTIONS = [
  { value: "none", label: "None" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const DEFAULT_TIER: PricingTier = {
  id: "",
  name: "New Plan",
  description: "Plan description",
  price: "0",
  priceMonthly: "0",
  priceAnnual: "0",
  features: [
    { id: "f1", text: "Feature 1", status: "included" },
    { id: "f2", text: "Feature 2", status: "included" },
    { id: "f3", text: "Feature 3", status: "excluded" },
  ],
  buttonText: "Get Started",
  buttonUrl: "#",
  buttonVariant: "primary",
};

const DEFAULT_FEATURE: PricingFeature = {
  id: "",
  text: "New feature",
  status: "included",
};

// =============================================================================
// Sortable Tier Card (for tier list)
// =============================================================================
interface SortableTierCardProps {
  tier: PricingTier;
  onEdit: () => void;
  onRemove: () => void;
  onTogglePopular: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

function SortableTierCard({
  tier,
  onEdit,
  onRemove,
  onTogglePopular,
  disabled,
  canRemove,
}: SortableTierCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tier.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg p-3 bg-card",
        isDragging && "opacity-50 shadow-lg",
        tier.isPopular && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{tier.name}</span>
            {tier.isPopular && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {tier.popularLabel || "Popular"}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {tier.price === "0" ? "Free" : `${tier.price}`} · {tier.features.length} features
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onTogglePopular}
            disabled={disabled}
            title={tier.isPopular ? "Remove popular badge" : "Mark as popular"}
          >
            {tier.isPopular ? "★" : "☆"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={disabled}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled || !canRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Sortable Feature Row (for feature list in tier dialog)
// =============================================================================
interface SortableFeatureRowProps {
  feature: PricingFeature;
  onUpdate: (updates: Partial<PricingFeature>) => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

function SortableFeatureRow({
  feature,
  onUpdate,
  onRemove,
  disabled,
  canRemove,
}: SortableFeatureRowProps) {
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
  };

  const statusIcon = {
    included: <Check className="h-4 w-4 text-green-500" />,
    excluded: <X className="h-4 w-4 text-red-500" />,
    limited: <Minus className="h-4 w-4 text-yellow-500" />,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-2 px-2 border rounded",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Select
        value={feature.status}
        onValueChange={(value: PricingFeatureStatus) =>
          onUpdate({ status: value })
        }
        disabled={disabled}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue>
            <span className="flex items-center gap-1">
              {statusIcon[feature.status]}
              <span className="text-xs">{feature.status}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="included">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" /> Included
            </span>
          </SelectItem>
          <SelectItem value="excluded">
            <span className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" /> Excluded
            </span>
          </SelectItem>
          <SelectItem value="limited">
            <span className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-yellow-500" /> Limited
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={feature.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Feature text"
        className="flex-1"
        disabled={disabled}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={disabled || !canRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// =============================================================================
// Tier Edit Dialog
// =============================================================================
interface TierEditDialogProps {
  tier: PricingTier | null;
  open: boolean;
  onClose: () => void;
  onSave: (tier: PricingTier) => void;
  isToggleMode: boolean;
  disabled?: boolean;
}

function TierEditDialog({
  tier,
  open,
  onClose,
  onSave,
  isToggleMode,
  disabled,
}: TierEditDialogProps) {
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);

  // Sensors must be called unconditionally (rules of hooks)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update editing tier when tier prop changes
  useEffect(() => {
    if (tier) {
      setEditingTier({ ...tier });
    } else {
      setEditingTier(null);
    }
  }, [tier]);

  if (!editingTier) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = editingTier.features.findIndex((f) => f.id === active.id);
      const newIndex = editingTier.features.findIndex((f) => f.id === over.id);
      const newFeatures = [...editingTier.features];
      const [removed] = newFeatures.splice(oldIndex, 1);
      newFeatures.splice(newIndex, 0, removed);
      setEditingTier({ ...editingTier, features: newFeatures });
    }
  };

  const addFeature = () => {
    const newFeature: PricingFeature = {
      ...DEFAULT_FEATURE,
      id: `feature-${Date.now()}`,
    };
    setEditingTier({
      ...editingTier,
      features: [...editingTier.features, newFeature],
    });
  };

  const updateFeature = (index: number, updates: Partial<PricingFeature>) => {
    const newFeatures = [...editingTier.features];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    setEditingTier({ ...editingTier, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = editingTier.features.filter((_, i) => i !== index);
    setEditingTier({ ...editingTier, features: newFeatures });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pricing Tier</DialogTitle>
          <DialogDescription>
            Configure the tier details, pricing, and features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tier Name</Label>
              <Input
                value={editingTier.name}
                onChange={(e) =>
                  setEditingTier({ ...editingTier, name: e.target.value })
                }
                placeholder="e.g., Professional"
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editingTier.description || ""}
                onChange={(e) =>
                  setEditingTier({ ...editingTier, description: e.target.value })
                }
                placeholder="e.g., For growing teams"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Pricing</Label>
            {isToggleMode ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Monthly Price</Label>
                  <Input
                    value={editingTier.priceMonthly || ""}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        priceMonthly: e.target.value,
                        price: e.target.value,
                      })
                    }
                    placeholder="29.99"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Annual Price</Label>
                  <Input
                    value={editingTier.priceAnnual || ""}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, priceAnnual: e.target.value })
                    }
                    placeholder="290"
                    disabled={disabled}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm">Annual Savings Badge</Label>
                  <Input
                    value={editingTier.annualSavings || ""}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, annualSavings: e.target.value })
                    }
                    placeholder="Save $58/year"
                    disabled={disabled}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Price</Label>
                  <Input
                    value={editingTier.price}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, price: e.target.value })
                    }
                    placeholder="29.99 or Contact us"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Original Price (optional)</Label>
                  <Input
                    value={editingTier.originalPrice || ""}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, originalPrice: e.target.value })
                    }
                    placeholder="49.99 (strikethrough)"
                    disabled={disabled}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Popular Badge */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Popular Badge</Label>
                <p className="text-sm text-muted-foreground">
                  Highlight this tier with a badge
                </p>
              </div>
              <Switch
                checked={editingTier.isPopular || false}
                onCheckedChange={(checked) =>
                  setEditingTier({ ...editingTier, isPopular: checked })
                }
                disabled={disabled}
              />
            </div>
            {editingTier.isPopular && (
              <div className="space-y-2">
                <Label className="text-sm">Badge Label</Label>
                <Input
                  value={editingTier.popularLabel || ""}
                  onChange={(e) =>
                    setEditingTier({ ...editingTier, popularLabel: e.target.value })
                  }
                  placeholder="Most Popular"
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Features</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Feature
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={editingTier.features.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {editingTier.features.map((feature, index) => (
                    <SortableFeatureRow
                      key={feature.id}
                      feature={feature}
                      onUpdate={(updates) => updateFeature(index, updates)}
                      onRemove={() => removeFeature(index)}
                      disabled={disabled}
                      canRemove={editingTier.features.length > 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Call to Action</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Button Text</Label>
                <Input
                  value={editingTier.buttonText}
                  onChange={(e) =>
                    setEditingTier({ ...editingTier, buttonText: e.target.value })
                  }
                  placeholder="Get Started"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Button URL</Label>
                <Input
                  value={editingTier.buttonUrl}
                  onChange={(e) =>
                    setEditingTier({ ...editingTier, buttonUrl: e.target.value })
                  }
                  placeholder="/signup or https://..."
                  disabled={disabled}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-sm">Button Style</Label>
                <Select
                  value={editingTier.buttonVariant || "primary"}
                  onValueChange={(value: "primary" | "secondary" | "outline") =>
                    setEditingTier({ ...editingTier, buttonVariant: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary (filled)</SelectItem>
                    <SelectItem value="secondary">Secondary (muted)</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editingTier)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Main PricingEditor Component
// =============================================================================
export default function PricingEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: PricingEditorProps) {
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [pendingMode, setPendingMode] = useState<PricingMode | null>(null);

  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = content.tiers.findIndex((t) => t.id === active.id);
      const newIndex = content.tiers.findIndex((t) => t.id === over.id);
      const newTiers = [...content.tiers];
      const [removed] = newTiers.splice(oldIndex, 1);
      newTiers.splice(newIndex, 0, removed);
      onChange({ ...content, tiers: newTiers });
    }
  };

  const handleModeChange = (newMode: PricingMode) => {
    if (newMode !== content.mode) {
      setPendingMode(newMode);
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      onChange({ ...content, mode: pendingMode });
      setPendingMode(null);
    }
  };

  const addTier = () => {
    const newTier: PricingTier = {
      ...DEFAULT_TIER,
      id: `tier-${Date.now()}`,
      features: DEFAULT_TIER.features.map((f, i) => ({
        ...f,
        id: `f${Date.now()}-${i}`,
      })),
    };
    onChange({ ...content, tiers: [...content.tiers, newTier] });
  };

  const updateTier = (index: number, updates: Partial<PricingTier>) => {
    const newTiers = [...content.tiers];
    newTiers[index] = { ...newTiers[index], ...updates };
    onChange({ ...content, tiers: newTiers });
  };

  const removeTier = (index: number) => {
    const newTiers = content.tiers.filter((_, i) => i !== index);
    onChange({ ...content, tiers: newTiers });
  };

  const togglePopular = (index: number) => {
    const newTiers = content.tiers.map((tier, i) => ({
      ...tier,
      isPopular: i === index ? !tier.isPopular : false,
    }));
    onChange({ ...content, tiers: newTiers });
  };

  const saveTier = (updatedTier: PricingTier) => {
    const index = content.tiers.findIndex((t) => t.id === updatedTier.id);
    if (index !== -1) {
      updateTier(index, updatedTier);
    }
    setEditingTier(null);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      {showContent && (
        <div className="space-y-2">
          <Label>Mode</Label>
          <Tabs
            value={content.mode}
            onValueChange={(v) => handleModeChange(v as PricingMode)}
          >
            <TabsList className="grid w-full grid-cols-3">
              {(Object.keys(MODE_LABELS) as PricingMode[]).map((mode) => (
                <TabsTrigger
                  key={mode}
                  value={mode}
                  disabled={disabled}
                  className="text-xs"
                >
                  {MODE_LABELS[mode]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="text-xs text-muted-foreground">
            {MODE_DESCRIPTIONS[content.mode]}
          </p>
        </div>
      )}

      {/* Section Header */}
      {showContent && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Section Header
            <span className="text-muted-foreground">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label className="text-sm">Title</Label>
              <Input
                value={content.sectionTitle || ""}
                onChange={(e) =>
                  onChange({ ...content, sectionTitle: e.target.value })
                }
                placeholder="Choose Your Plan"
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Subtitle</Label>
              <Input
                value={content.sectionSubtitle || ""}
                onChange={(e) =>
                  onChange({ ...content, sectionSubtitle: e.target.value })
                }
                placeholder="Select the perfect plan for your needs"
                disabled={disabled}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Currency & Period */}
      {showContent && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Currency & Period
            <span className="text-muted-foreground">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Currency</Label>
                <Select
                  value={content.currency || "$"}
                  onValueChange={(value: PricingCurrency) =>
                    onChange({ ...content, currency: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {content.currency === "custom" && (
                <div className="space-y-2">
                  <Label className="text-sm">Custom Symbol</Label>
                  <Input
                    value={content.customCurrency || ""}
                    onChange={(e) =>
                      onChange({ ...content, customCurrency: e.target.value })
                    }
                    placeholder="₹"
                    disabled={disabled}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Billing Period</Label>
                <Select
                  value={content.period || "monthly"}
                  onValueChange={(value: PricingPeriod) =>
                    onChange({ ...content, period: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {content.period === "custom" && (
                <div className="space-y-2">
                  <Label className="text-sm">Custom Period</Label>
                  <Input
                    value={content.customPeriod || ""}
                    onChange={(e) =>
                      onChange({ ...content, customPeriod: e.target.value })
                    }
                    placeholder="/user/mo"
                    disabled={disabled}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Period Label</Label>
              <Switch
                checked={content.showPeriod ?? true}
                onCheckedChange={(checked) =>
                  onChange({ ...content, showPeriod: checked })
                }
                disabled={disabled}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Toggle Mode Settings */}
      {showContent && content.mode === "toggle" && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Toggle Settings
            <span className="text-muted-foreground">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Monthly Label</Label>
                <Input
                  value={content.toggleLabels?.monthly || "Monthly"}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      toggleLabels: {
                        ...content.toggleLabels,
                        monthly: e.target.value,
                        annual: content.toggleLabels?.annual || "Annually",
                      },
                    })
                  }
                  placeholder="Monthly"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Annual Label</Label>
                <Input
                  value={content.toggleLabels?.annual || "Annually"}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      toggleLabels: {
                        monthly: content.toggleLabels?.monthly || "Monthly",
                        annual: e.target.value,
                      },
                    })
                  }
                  placeholder="Annually"
                  disabled={disabled}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Default Selection</Label>
              <Select
                value={content.defaultPeriod || "monthly"}
                onValueChange={(value: "monthly" | "annual") =>
                  onChange({ ...content, defaultPeriod: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Pricing Tiers */}
      {showContent && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Pricing Tiers ({content.tiers.length})
            <span className="text-muted-foreground">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={content.tiers.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {content.tiers.map((tier, index) => (
                    <SortableTierCard
                      key={tier.id}
                      tier={tier}
                      onEdit={() => setEditingTier(tier)}
                      onRemove={() => removeTier(index)}
                      onTogglePopular={() => togglePopular(index)}
                      disabled={disabled}
                      canRemove={content.tiers.length > 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTier}
              disabled={disabled}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Tier
            </Button>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Layout Settings */}
      {showLayout && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Layout
            <span className="text-muted-foreground">▼</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Columns</Label>
                <Select
                  value={String(content.columns || 3)}
                  onValueChange={(value) =>
                    onChange({
                      ...content,
                      columns:
                        value === "auto"
                          ? "auto"
                          : (parseInt(value) as 2 | 3 | 4),
                    })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMN_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Gap</Label>
                <Select
                  value={content.gap || "medium"}
                  onValueChange={(value: "small" | "medium" | "large") =>
                    onChange({ ...content, gap: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GAP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Card Corner Radius</Label>
              <Select
                value={content.cardBorderRadius || "medium"}
                onValueChange={(value: "none" | "small" | "medium" | "large") =>
                  onChange({ ...content, cardBorderRadius: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Card Background</Label>
              <Switch
                checked={content.showCardBackground ?? true}
                onCheckedChange={(checked) =>
                  onChange({ ...content, showCardBackground: checked })
                }
                disabled={disabled}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Styling Controls */}
      {showLayout && (
        <StylingControls
          content={content}
          onChange={onChange}
          disabled={disabled}
          siteId={siteId}
        />
      )}

      {/* Tier Edit Dialog */}
      <TierEditDialog
        tier={editingTier}
        open={!!editingTier}
        onClose={() => setEditingTier(null)}
        onSave={saveTier}
        isToggleMode={content.mode === "toggle"}
        disabled={disabled}
      />

      {/* Mode Change Confirmation */}
      <AlertDialog open={!!pendingMode} onOpenChange={() => setPendingMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Pricing Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching modes may affect how your pricing is displayed. Your tier
              data will be preserved, but some fields may not be visible in the
              new mode.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
