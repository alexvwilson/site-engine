"use client";

import { useState } from "react";
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
import { GripVertical, Plus, Trash2, MapPin, Video } from "lucide-react";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

import { StylingControls } from "@/components/editor/StylingControls";
import { cn } from "@/lib/utils";
import type {
  CalendarContent,
  CalendarMode,
  CalendarEvent,
  CalendarEventType,
  CalendarEmbedPlatform,
  CountdownUnit,
  CalendarEventCardStyle,
} from "@/lib/section-types";
import type { EditorMode } from "@/components/editor/inspector/EditorModeToggle";

interface CalendarEditorProps {
  content: CalendarContent;
  onChange: (content: CalendarContent) => void;
  disabled?: boolean;
  editorMode?: EditorMode;
  siteId: string;
}

// Common timezones for dropdown
const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (AZ)" },
  { value: "America/Anchorage", label: "Alaska (AK)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HI)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "UTC", label: "UTC" },
];

// ============================================================================
// Sortable Event Item
// ============================================================================

interface SortableEventItemProps {
  event: CalendarEvent;
  onUpdate: (updates: Partial<CalendarEvent>) => void;
  onDelete: () => void;
  disabled?: boolean;
}

function SortableEventItem({
  event,
  onUpdate,
  onDelete,
  disabled,
}: SortableEventItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card p-3",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
          disabled={disabled}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <Label className="text-xs">Event Title</Label>
            <Input
              value={event.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Event title"
              className="h-8"
              disabled={disabled}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              value={event.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Event description"
              className="min-h-[60px] resize-none"
              disabled={disabled}
            />
          </div>

          {/* Date/Time Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={event.startDate}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className="h-8"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Start Time (optional)</Label>
              <Input
                type="time"
                value={event.startTime || ""}
                onChange={(e) => onUpdate({ startTime: e.target.value })}
                className="h-8"
                disabled={disabled}
              />
            </div>
          </div>

          {/* End Date/Time Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">End Date (optional)</Label>
              <Input
                type="date"
                value={event.endDate || ""}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                className="h-8"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Time (optional)</Label>
              <Input
                type="time"
                value={event.endTime || ""}
                onChange={(e) => onUpdate({ endTime: e.target.value })}
                className="h-8"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-1">
            <Label className="text-xs">Timezone</Label>
            <Select
              value={event.timezone}
              onValueChange={(value) => onUpdate({ timezone: value })}
              disabled={disabled}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Type & Location */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Event Type</Label>
              <Select
                value={event.eventType}
                onValueChange={(value) =>
                  onUpdate({ eventType: value as CalendarEventType })
                }
                disabled={disabled}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Virtual
                    </span>
                  </SelectItem>
                  <SelectItem value="in-person">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      In-Person
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {event.eventType === "virtual" ? "Meeting Link" : "Location"}
              </Label>
              <Input
                value={event.location || ""}
                onChange={(e) => onUpdate({ location: e.target.value })}
                placeholder={
                  event.eventType === "virtual"
                    ? "https://zoom.us/..."
                    : "123 Main St"
                }
                className="h-8"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onDelete}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Events List Editor
// ============================================================================

interface EventsListEditorProps {
  content: CalendarContent;
  onUpdate: (updates: Partial<CalendarContent>) => void;
  editorMode: EditorMode;
  disabled?: boolean;
}

function EventsListEditor({
  content,
  onUpdate,
  editorMode,
  disabled,
}: EventsListEditorProps) {
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
      const oldIndex = content.events.findIndex((e) => e.id === active.id);
      const newIndex = content.events.findIndex((e) => e.id === over.id);
      onUpdate({ events: arrayMove(content.events, oldIndex, newIndex) });
    }
  };

  const addEvent = () => {
    const today = new Date().toISOString().split("T")[0];
    const newEvent: CalendarEvent = {
      id: nanoid(),
      title: "New Event",
      startDate: today,
      timezone: "America/New_York",
      eventType: "virtual",
    };
    onUpdate({ events: [...content.events, newEvent] });
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    onUpdate({
      events: content.events.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    });
  };

  const deleteEvent = (id: string) => {
    onUpdate({ events: content.events.filter((e) => e.id !== id) });
  };

  const cardStyleOptions: { value: CalendarEventCardStyle; label: string }[] = [
    { value: "simple", label: "Simple" },
    { value: "detailed", label: "Detailed" },
  ];

  return (
    <div className="space-y-4">
      {/* Events */}
      {showContent && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Events ({content.events.length})
            <span className="text-xs text-muted-foreground">
              Click to expand
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            {content.events.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No events yet. Add your first event to get started.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={content.events.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {content.events.map((event) => (
                    <SortableEventItem
                      key={event.id}
                      event={event}
                      onUpdate={(updates) => updateEvent(event.id, updates)}
                      onDelete={() => deleteEvent(event.id)}
                      disabled={disabled}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addEvent}
              disabled={disabled}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Event
            </Button>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Display Options */}
      {showLayout && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Display Options
            <span className="text-xs text-muted-foreground">
              Click to expand
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Card Style</Label>
              <Select
                value={content.eventCardStyle}
                onValueChange={(value) =>
                  onUpdate({ eventCardStyle: value as CalendarEventCardStyle })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardStyleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Add to Calendar</Label>
              <Switch
                checked={content.showAddToCalendar}
                onCheckedChange={(checked) =>
                  onUpdate({ showAddToCalendar: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Timezone</Label>
              <Switch
                checked={content.showTimezone}
                onCheckedChange={(checked) =>
                  onUpdate({ showTimezone: checked })
                }
                disabled={disabled}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ============================================================================
// Countdown Editor
// ============================================================================

interface CountdownEditorProps {
  content: CalendarContent;
  onUpdate: (updates: Partial<CalendarContent>) => void;
  editorMode: EditorMode;
  disabled?: boolean;
}

function CountdownEditor({
  content,
  onUpdate,
  editorMode,
  disabled,
}: CountdownEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  const unitOptions: { value: CountdownUnit; label: string }[] = [
    { value: "days", label: "Days" },
    { value: "hours", label: "Hours" },
    { value: "minutes", label: "Minutes" },
    { value: "seconds", label: "Seconds" },
  ];

  return (
    <div className="space-y-4">
      {/* Countdown Content */}
      {showContent && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Countdown Settings
            <span className="text-xs text-muted-foreground">
              Click to expand
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Countdown Title</Label>
              <Input
                value={content.countdownTitle || ""}
                onChange={(e) => onUpdate({ countdownTitle: e.target.value })}
                placeholder="Launching Soon"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Countdown Subtitle (optional)</Label>
              <Input
                value={content.countdownSubtitle || ""}
                onChange={(e) =>
                  onUpdate({ countdownSubtitle: e.target.value })
                }
                placeholder="Get ready for something amazing"
                disabled={disabled}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Target Date</Label>
                <Input
                  type="date"
                  value={content.targetDate || ""}
                  onChange={(e) => onUpdate({ targetDate: e.target.value })}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target Time</Label>
                <Input
                  type="time"
                  value={content.targetTime || ""}
                  onChange={(e) => onUpdate({ targetTime: e.target.value })}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={content.targetTimezone || "America/New_York"}
                onValueChange={(value) => onUpdate({ targetTimezone: value })}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Completion Message</Label>
              <Input
                value={content.completionMessage || ""}
                onChange={(e) =>
                  onUpdate({ completionMessage: e.target.value })
                }
                placeholder="The event has started!"
                disabled={disabled}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Display Options */}
      {showLayout && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Display Options
            <span className="text-xs text-muted-foreground">
              Click to expand
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Smallest Unit</Label>
              <Select
                value={content.smallestUnit || "seconds"}
                onValueChange={(value) =>
                  onUpdate({ smallestUnit: value as CountdownUnit })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Timer will count down to this unit
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Event Details</Label>
              <Switch
                checked={content.showEventDetails ?? true}
                onCheckedChange={(checked) =>
                  onUpdate({ showEventDetails: checked })
                }
                disabled={disabled}
              />
            </div>

            {content.showEventDetails && content.events.length > 0 && (
              <div className="space-y-2">
                <Label>Event for Details</Label>
                <Select
                  value={content.countdownEventId || content.events[0]?.id || ""}
                  onValueChange={(value) =>
                    onUpdate({ countdownEventId: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {content.events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Show details from this event below the countdown
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ============================================================================
// Embed Editor
// ============================================================================

interface EmbedEditorProps {
  content: CalendarContent;
  onUpdate: (updates: Partial<CalendarContent>) => void;
  editorMode: EditorMode;
  disabled?: boolean;
}

function EmbedEditor({
  content,
  onUpdate,
  editorMode,
  disabled,
}: EmbedEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  const platformOptions: { value: CalendarEmbedPlatform; label: string }[] = [
    { value: "calendly", label: "Calendly" },
    { value: "cal.com", label: "Cal.com" },
    { value: "custom", label: "Custom Embed" },
  ];

  return (
    <div className="space-y-4">
      {/* Embed Content */}
      {showContent && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Embed Settings
            <span className="text-xs text-muted-foreground">
              Click to expand
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={content.embedPlatform || "calendly"}
                onValueChange={(value) =>
                  onUpdate({ embedPlatform: value as CalendarEmbedPlatform })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {content.embedPlatform === "calendly"
                  ? "Calendly Username or Event URL"
                  : content.embedPlatform === "cal.com"
                    ? "Cal.com Username or Event URL"
                    : "Embed URL"}
              </Label>
              <Input
                value={content.embedUrl || ""}
                onChange={(e) => onUpdate({ embedUrl: e.target.value })}
                placeholder={
                  content.embedPlatform === "calendly"
                    ? "your-name or calendly.com/your-name/30min"
                    : content.embedPlatform === "cal.com"
                      ? "your-name or cal.com/your-name/30min"
                      : "https://..."
                }
                disabled={disabled}
              />
              {content.embedPlatform !== "custom" && (
                <p className="text-xs text-muted-foreground">
                  Enter your username or full event URL
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Display Options */}
      {showLayout && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Display Options
            <span className="text-xs text-muted-foreground">
              Click to expand
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Embed Height</Label>
              <Input
                value={content.embedHeight || "630"}
                onChange={(e) => onUpdate({ embedHeight: e.target.value })}
                placeholder="630"
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Height in pixels (default: 630)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Hide Cookie Banner</Label>
              <Switch
                checked={content.embedHideCookieBanner ?? false}
                onCheckedChange={(checked) =>
                  onUpdate({ embedHideCookieBanner: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Hide Event Details</Label>
              <Switch
                checked={content.embedHideEventDetails ?? false}
                onCheckedChange={(checked) =>
                  onUpdate({ embedHideEventDetails: checked })
                }
                disabled={disabled}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ============================================================================
// Main Calendar Editor
// ============================================================================

export function CalendarEditor({
  content,
  onChange,
  disabled,
  editorMode = "all",
  siteId,
}: CalendarEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";
  const [showModeChangeDialog, setShowModeChangeDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<CalendarMode | null>(null);

  // Helper to update partial content
  const onUpdate = (updates: Partial<CalendarContent>) => {
    onChange({ ...content, ...updates });
  };

  const handleModeChange = (newMode: CalendarMode) => {
    if (newMode === content.mode) return;

    // Check if there's significant data that would be hidden
    const hasEvents = content.events && content.events.length > 0;
    const hasCountdownConfig = content.targetDate || content.countdownTitle;
    const hasEmbedConfig = content.embedUrl;

    const currentHasData =
      (content.mode === "list" && hasEvents) ||
      (content.mode === "countdown" && hasCountdownConfig) ||
      (content.mode === "embed" && hasEmbedConfig);

    if (currentHasData) {
      setPendingMode(newMode);
      setShowModeChangeDialog(true);
    } else {
      onUpdate({ mode: newMode });
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      onUpdate({ mode: pendingMode });
    }
    setShowModeChangeDialog(false);
    setPendingMode(null);
  };

  const getModeLabel = (mode: CalendarMode): string => {
    switch (mode) {
      case "list":
        return "Events List";
      case "countdown":
        return "Countdown";
      case "embed":
        return "Scheduling";
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Change Confirmation Dialog */}
      <AlertDialog
        open={showModeChangeDialog}
        onOpenChange={setShowModeChangeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Calendar Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching from {getModeLabel(content.mode)} to{" "}
              {pendingMode && getModeLabel(pendingMode)} mode will not delete
              your existing data, but it won&apos;t be visible until you switch
              back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingMode(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange}>
              Switch to {pendingMode && getModeLabel(pendingMode)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mode Selector */}
      {showContent && (
        <div className="space-y-2">
          <Label>Calendar Type</Label>
          <Tabs
            value={content.mode}
            onValueChange={(v) => handleModeChange(v as CalendarMode)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Events</TabsTrigger>
              <TabsTrigger value="countdown">Countdown</TabsTrigger>
              <TabsTrigger value="embed">Schedule</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Section Header */}
      {showContent && (
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Section Header
            <span className="text-xs text-muted-foreground">
              Click to expand
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={content.sectionTitle || ""}
                onChange={(e) => onUpdate({ sectionTitle: e.target.value })}
                placeholder="Upcoming Events"
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle (optional)</Label>
              <Input
                value={content.sectionSubtitle || ""}
                onChange={(e) => onUpdate({ sectionSubtitle: e.target.value })}
                placeholder="Join us at these upcoming events"
                disabled={disabled}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Mode-specific editors */}
      {content.mode === "list" && (
        <EventsListEditor
          content={content}
          onUpdate={onUpdate}
          editorMode={editorMode}
          disabled={disabled}
        />
      )}
      {content.mode === "countdown" && (
        <CountdownEditor
          content={content}
          onUpdate={onUpdate}
          editorMode={editorMode}
          disabled={disabled}
        />
      )}
      {content.mode === "embed" && (
        <EmbedEditor
          content={content}
          onUpdate={onUpdate}
          editorMode={editorMode}
          disabled={disabled}
        />
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

export default CalendarEditor;
