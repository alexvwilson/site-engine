"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { GripVertical, Plus, Trash2, ChevronDown } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AccordionContent,
  AccordionMode,
  AccordionIconStyle,
  AccordionItem,
  CurriculumModule,
  CurriculumLesson,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";

// Dynamically import TiptapEditor to avoid SSR issues with ProseMirror
const TiptapEditor = dynamic(
  () =>
    import("@/components/editor/TiptapEditor").then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md bg-muted/50 min-h-[100px]">
        <div className="h-10 border-b bg-muted/30" />
        <div className="p-3 text-muted-foreground text-sm">
          Loading editor...
        </div>
      </div>
    ),
  }
);

interface AccordionEditorProps {
  content: AccordionContent;
  onChange: (content: AccordionContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

const MODE_LABELS: Record<AccordionMode, string> = {
  faq: "FAQ",
  curriculum: "Curriculum",
  custom: "Custom",
};

const DEFAULT_FAQ_ITEM: AccordionItem = {
  id: "",
  title: "New Question",
  content: "<p>Answer goes here...</p>",
};

const DEFAULT_CUSTOM_ITEM: AccordionItem = {
  id: "",
  title: "New Section",
  content: "<p>Section content...</p>",
};

const DEFAULT_LESSON: CurriculumLesson = {
  id: "",
  title: "New Lesson",
  duration: "",
  isLocked: false,
  isCompleted: false,
};

const DEFAULT_MODULE: CurriculumModule = {
  id: "",
  title: "New Module",
  description: "",
  lessons: [],
};

/**
 * Check if switching modes would cause data loss
 */
function hasDataForMode(content: AccordionContent, mode: AccordionMode): boolean {
  switch (mode) {
    case "faq":
      return !!(
        content.faqItems &&
        content.faqItems.length > 0 &&
        content.faqItems.some((item) => item.title || item.content)
      );
    case "curriculum":
      return !!(
        content.modules &&
        content.modules.length > 0 &&
        content.modules.some((m) => m.title || m.lessons.length > 0)
      );
    case "custom":
      return !!(
        content.customItems &&
        content.customItems.length > 0 &&
        content.customItems.some((item) => item.title || item.content)
      );
    default:
      return false;
  }
}

// =============================================================================
// Sortable FAQ/Custom Item Component
// =============================================================================
interface SortableAccordionItemProps {
  item: AccordionItem;
  index: number;
  label: string;
  onUpdate: (field: keyof AccordionItem, value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
  showNumbering?: boolean;
}

function SortableAccordionItem({
  item,
  index,
  label,
  onUpdate,
  onRemove,
  disabled,
  canRemove,
  showNumbering,
}: SortableAccordionItemProps) {
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
            {showNumbering ? `${index + 1}. ` : ""}
            {label} {index + 1}
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
          <span className="sr-only">Remove {label}</span>
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`item-${item.id}-title`}>Title</Label>
        <Input
          id={`item-${item.id}-title`}
          value={item.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Enter title"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <TiptapEditor
          value={item.content}
          onChange={(html) => onUpdate("content", html)}
          placeholder="Enter content..."
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Sortable Lesson Component
// =============================================================================
interface SortableLessonProps {
  lesson: CurriculumLesson;
  index: number;
  onUpdate: (field: keyof CurriculumLesson, value: string | boolean) => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

function SortableLesson({
  lesson,
  index,
  onUpdate,
  onRemove,
  disabled,
  canRemove,
}: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg p-3 space-y-3 bg-muted/30",
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
          <span className="text-xs font-medium text-muted-foreground">
            Lesson {index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          disabled={disabled || !canRemove}
        >
          <Trash2 className="h-3 w-3" />
          <span className="sr-only">Remove lesson</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`lesson-${lesson.id}-title`} className="text-xs">
            Title
          </Label>
          <Input
            id={`lesson-${lesson.id}-title`}
            value={lesson.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Lesson title"
            disabled={disabled}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`lesson-${lesson.id}-duration`} className="text-xs">
            Duration (optional)
          </Label>
          <Input
            id={`lesson-${lesson.id}-duration`}
            value={lesson.duration || ""}
            onChange={(e) => onUpdate("duration", e.target.value)}
            placeholder="e.g. 5 min"
            disabled={disabled}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id={`lesson-${lesson.id}-locked`}
            checked={lesson.isLocked || false}
            onCheckedChange={(checked) => onUpdate("isLocked", checked)}
            disabled={disabled}
          />
          <Label htmlFor={`lesson-${lesson.id}-locked`} className="text-xs">
            Locked
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id={`lesson-${lesson.id}-completed`}
            checked={lesson.isCompleted || false}
            onCheckedChange={(checked) => onUpdate("isCompleted", checked)}
            disabled={disabled}
          />
          <Label htmlFor={`lesson-${lesson.id}-completed`} className="text-xs">
            Completed
          </Label>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Sortable Module Component
// =============================================================================
interface SortableModuleProps {
  module: CurriculumModule;
  index: number;
  onUpdate: (module: CurriculumModule) => void;
  onRemove: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

function SortableModule({
  module,
  index,
  onUpdate,
  onRemove,
  disabled,
  canRemove,
}: SortableModuleProps) {
  const [isOpen, setIsOpen] = useState(true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddLesson = (): void => {
    const newLesson: CurriculumLesson = {
      ...DEFAULT_LESSON,
      id: `lesson-${Date.now()}`,
    };
    onUpdate({
      ...module,
      lessons: [...module.lessons, newLesson],
    });
  };

  const handleUpdateLesson = (
    lessonIndex: number,
    field: keyof CurriculumLesson,
    value: string | boolean
  ): void => {
    const newLessons = [...module.lessons];
    newLessons[lessonIndex] = {
      ...newLessons[lessonIndex],
      [field]: value,
    };
    onUpdate({ ...module, lessons: newLessons });
  };

  const handleRemoveLesson = (lessonIndex: number): void => {
    const newLessons = module.lessons.filter((_, i) => i !== lessonIndex);
    onUpdate({ ...module, lessons: newLessons });
  };

  const handleLessonDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
    const newIndex = module.lessons.findIndex((l) => l.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newLessons = [...module.lessons];
    const [removed] = newLessons.splice(oldIndex, 1);
    newLessons.splice(newIndex, 0, removed);
    onUpdate({ ...module, lessons: newLessons });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg overflow-hidden",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4 bg-muted/50">
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
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <span className="text-sm font-medium">Module {index + 1}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            disabled={disabled || !canRemove}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove module</span>
          </Button>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4 border-t">
            <div className="space-y-2">
              <Label htmlFor={`module-${module.id}-title`}>Module Title</Label>
              <Input
                id={`module-${module.id}-title`}
                value={module.title}
                onChange={(e) => onUpdate({ ...module, title: e.target.value })}
                placeholder="Enter module title"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`module-${module.id}-description`}>
                Description (optional)
              </Label>
              <Input
                id={`module-${module.id}-description`}
                value={module.description || ""}
                onChange={(e) =>
                  onUpdate({ ...module, description: e.target.value })
                }
                placeholder="Brief module description"
                disabled={disabled}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Lessons</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddLesson}
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Lesson
                </Button>
              </div>

              {module.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                  No lessons yet. Click &quot;Add Lesson&quot; to start.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleLessonDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={module.lessons.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <SortableLesson
                          key={lesson.id}
                          lesson={lesson}
                          index={lessonIndex}
                          onUpdate={(field, value) =>
                            handleUpdateLesson(lessonIndex, field, value)
                          }
                          onRemove={() => handleRemoveLesson(lessonIndex)}
                          disabled={disabled}
                          canRemove={module.lessons.length > 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// =============================================================================
// Main Accordion Editor
// =============================================================================
export function AccordionEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: AccordionEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  // Mode switching confirmation
  const [pendingMode, setPendingMode] = useState<AccordionMode | null>(null);
  const [showModeWarning, setShowModeWarning] = useState(false);

  const currentMode = content.mode || "faq";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update a field in content
  const updateField = <K extends keyof AccordionContent>(
    field: K,
    value: AccordionContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  // Mode switching logic
  const handleModeChange = (newMode: AccordionMode): void => {
    if (newMode === currentMode) return;

    // Check if current mode has data that would be lost
    if (hasDataForMode(content, currentMode)) {
      setPendingMode(newMode);
      setShowModeWarning(true);
    } else {
      applyModeChange(newMode);
    }
  };

  const applyModeChange = (newMode: AccordionMode): void => {
    // Keep styling and behavior settings, just change mode
    onChange({
      ...content,
      mode: newMode,
    });
    setPendingMode(null);
  };

  const cancelModeChange = (): void => {
    setPendingMode(null);
    setShowModeWarning(false);
  };

  const confirmModeChange = (): void => {
    if (pendingMode) {
      applyModeChange(pendingMode);
    }
    setShowModeWarning(false);
  };

  // FAQ/Custom Items handlers
  const handleAddItem = (type: "faq" | "custom"): void => {
    const itemsKey = type === "faq" ? "faqItems" : "customItems";
    const defaultItem = type === "faq" ? DEFAULT_FAQ_ITEM : DEFAULT_CUSTOM_ITEM;
    const currentItems = content[itemsKey] || [];
    const newItem = {
      ...defaultItem,
      id: `${type}-${Date.now()}`,
    };
    updateField(itemsKey, [...currentItems, newItem]);
  };

  const handleUpdateItem = (
    type: "faq" | "custom",
    index: number,
    field: keyof AccordionItem,
    value: string
  ): void => {
    const itemsKey = type === "faq" ? "faqItems" : "customItems";
    const items = [...(content[itemsKey] || [])];
    items[index] = { ...items[index], [field]: value };
    updateField(itemsKey, items);
  };

  const handleRemoveItem = (type: "faq" | "custom", index: number): void => {
    const itemsKey = type === "faq" ? "faqItems" : "customItems";
    const items = (content[itemsKey] || []).filter((_, i) => i !== index);
    updateField(itemsKey, items);
  };

  const handleItemDragEnd = (
    type: "faq" | "custom",
    event: DragEndEvent
  ): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const itemsKey = type === "faq" ? "faqItems" : "customItems";
    const items = content[itemsKey] || [];
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, removed);
    updateField(itemsKey, newItems);
  };

  // Module handlers
  const handleAddModule = (): void => {
    const newModule: CurriculumModule = {
      ...DEFAULT_MODULE,
      id: `module-${Date.now()}`,
      lessons: [{ ...DEFAULT_LESSON, id: `lesson-${Date.now()}` }],
    };
    updateField("modules", [...(content.modules || []), newModule]);
  };

  const handleUpdateModule = (
    index: number,
    module: CurriculumModule
  ): void => {
    const modules = [...(content.modules || [])];
    modules[index] = module;
    updateField("modules", modules);
  };

  const handleRemoveModule = (index: number): void => {
    const modules = (content.modules || []).filter((_, i) => i !== index);
    updateField("modules", modules);
  };

  const handleModuleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const modules = content.modules || [];
    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newModules = [...modules];
    const [removed] = newModules.splice(oldIndex, 1);
    newModules.splice(newIndex, 0, removed);
    updateField("modules", newModules);
  };

  const faqItems = content.faqItems || [];
  const customItems = content.customItems || [];
  const modules = content.modules || [];

  return (
    <div className="space-y-6">
      {/* Mode Switching Warning Dialog */}
      <AlertDialog open={showModeWarning} onOpenChange={setShowModeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Accordion Type?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching from {MODE_LABELS[currentMode]} to{" "}
              {pendingMode && MODE_LABELS[pendingMode]} mode will keep your
              existing data, but you&apos;ll be editing a different set of
              items. Your {MODE_LABELS[currentMode]} content will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelModeChange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mode Tabs */}
      {showContent && (
        <Tabs
          value={currentMode}
          onValueChange={(v) => handleModeChange(v as AccordionMode)}
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {/* Section Header (shared across modes) */}
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title (optional)</Label>
              <Input
                id="section-title"
                value={content.sectionTitle || ""}
                onChange={(e) => updateField("sectionTitle", e.target.value)}
                placeholder="e.g. Frequently Asked Questions"
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-subtitle">
                Section Subtitle (optional)
              </Label>
              <Input
                id="section-subtitle"
                value={content.sectionSubtitle || ""}
                onChange={(e) => updateField("sectionSubtitle", e.target.value)}
                placeholder="e.g. Find answers to common questions"
                disabled={disabled}
              />
            </div>
          </div>

          {/* FAQ Mode */}
          <TabsContent value="faq" className="space-y-4 mt-4">
            {/* FAQ-specific settings */}
            <div className="flex items-center justify-between">
              <Label htmlFor="show-numbering">Show Numbering</Label>
              <Switch
                id="show-numbering"
                checked={content.showNumbering || false}
                onCheckedChange={(checked) =>
                  updateField("showNumbering", checked)
                }
                disabled={disabled}
              />
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Questions</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem("faq")}
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>

              {faqItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                  No questions yet. Click &quot;Add Question&quot; to start.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleItemDragEnd("faq", e)}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={faqItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {faqItems.map((item, index) => (
                        <SortableAccordionItem
                          key={item.id}
                          item={item}
                          index={index}
                          label="Question"
                          onUpdate={(field, value) =>
                            handleUpdateItem("faq", index, field, value)
                          }
                          onRemove={() => handleRemoveItem("faq", index)}
                          disabled={disabled}
                          canRemove={faqItems.length > 1}
                          showNumbering={content.showNumbering}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </TabsContent>

          {/* Curriculum Mode */}
          <TabsContent value="curriculum" className="space-y-4 mt-4">
            {/* Curriculum-specific settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-lesson-count">Show Lesson Count</Label>
                <Switch
                  id="show-lesson-count"
                  checked={content.showLessonCount ?? true}
                  onCheckedChange={(checked) =>
                    updateField("showLessonCount", checked)
                  }
                  disabled={disabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-total-duration">Show Total Duration</Label>
                <Switch
                  id="show-total-duration"
                  checked={content.showTotalDuration ?? true}
                  onCheckedChange={(checked) =>
                    updateField("showTotalDuration", checked)
                  }
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Modules</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddModule}
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Module
                </Button>
              </div>

              {modules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                  No modules yet. Click &quot;Add Module&quot; to start.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleModuleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={modules.map((m) => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {modules.map((module, index) => (
                        <SortableModule
                          key={module.id}
                          module={module}
                          index={index}
                          onUpdate={(m) => handleUpdateModule(index, m)}
                          onRemove={() => handleRemoveModule(index)}
                          disabled={disabled}
                          canRemove={modules.length > 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </TabsContent>

          {/* Custom Mode */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            {/* Custom Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sections</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem("custom")}
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              </div>

              {customItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                  No sections yet. Click &quot;Add Section&quot; to start.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleItemDragEnd("custom", e)}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={customItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {customItems.map((item, index) => (
                        <SortableAccordionItem
                          key={item.id}
                          item={item}
                          index={index}
                          label="Section"
                          onUpdate={(field, value) =>
                            handleUpdateItem("custom", index, field, value)
                          }
                          onRemove={() => handleRemoveItem("custom", index)}
                          disabled={disabled}
                          canRemove={customItems.length > 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Behavior Settings */}
      {showLayout && (
        <div className="space-y-4 rounded-lg border p-4">
          <Label className="text-xs uppercase text-muted-foreground tracking-wide">
            Behavior
          </Label>

          <div className="space-y-2">
            <Label htmlFor="icon-style">Icon Style</Label>
            <Select
              value={content.iconStyle || "chevron"}
              onValueChange={(v) =>
                updateField("iconStyle", v as AccordionIconStyle)
              }
              disabled={disabled}
            >
              <SelectTrigger id="icon-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chevron">Chevron</SelectItem>
                <SelectItem value="plus-minus">Plus/Minus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allow-multiple">Allow Multiple Open</Label>
            <Switch
              id="allow-multiple"
              checked={content.allowMultipleOpen || false}
              onCheckedChange={(checked) =>
                updateField("allowMultipleOpen", checked)
              }
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-expand-all">Show Expand All Button</Label>
            <Switch
              id="show-expand-all"
              checked={content.showExpandAll ?? true}
              onCheckedChange={(checked) =>
                updateField("showExpandAll", checked)
              }
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="default-expand-first">
              Expand First Item by Default
            </Label>
            <Switch
              id="default-expand-first"
              checked={content.defaultExpandFirst ?? true}
              onCheckedChange={(checked) =>
                updateField("defaultExpandFirst", checked)
              }
              disabled={disabled}
            />
          </div>
        </div>
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
    </div>
  );
}
