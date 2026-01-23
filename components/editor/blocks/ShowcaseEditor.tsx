"use client";

import { useState, useEffect } from "react";
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
import { GripVertical, Plus, Trash2, FileText, FolderOpen } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { StylingControls } from "@/components/editor/StylingControls";
import { cn } from "@/lib/utils";
import type {
  ShowcaseContent,
  ShowcaseMode,
  ShowcaseAnimationSpeed,
  ShowcaseLayout,
  DownloadLayout,
  DownloadFileType,
  StatItem,
  DownloadItem,
} from "@/lib/section-types";
import type { EditorMode } from "@/components/editor/inspector/EditorModeToggle";
import { listSiteDocuments, type DocumentFile } from "@/app/actions/storage";
import { FileIcon, getFileTypeFromUrl } from "@/lib/file-icons";

interface ShowcaseEditorProps {
  content: ShowcaseContent;
  onChange: (content: ShowcaseContent) => void;
  disabled?: boolean;
  editorMode?: EditorMode;
  siteId: string;
}

// ============================================================================
// Sortable Stat Item
// ============================================================================

interface SortableStatItemProps {
  stat: StatItem;
  onUpdate: (updates: Partial<StatItem>) => void;
  onDelete: () => void;
}

function SortableStatItem({ stat, onUpdate, onDelete }: SortableStatItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stat.id });

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
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Prefix</Label>
              <Input
                value={stat.prefix || ""}
                onChange={(e) => onUpdate({ prefix: e.target.value })}
                placeholder="$"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Value</Label>
              <Input
                type="number"
                value={stat.value}
                onChange={(e) =>
                  onUpdate({ value: parseInt(e.target.value) || 0 })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Suffix</Label>
              <Input
                value={stat.suffix || ""}
                onChange={(e) => onUpdate({ suffix: e.target.value })}
                placeholder="+, K, %"
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={stat.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Happy Clients"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Icon (optional)</Label>
              <Input
                value={stat.icon || ""}
                onChange={(e) => onUpdate({ icon: e.target.value })}
                placeholder="users, star, heart"
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Sortable Download Item
// ============================================================================

interface SortableDownloadItemProps {
  item: DownloadItem;
  onUpdate: (updates: Partial<DownloadItem>) => void;
  onDelete: () => void;
  onPickDocument: () => void;
}

function SortableDownloadItem({
  item,
  onUpdate,
  onDelete,
  onPickDocument,
}: SortableDownloadItemProps) {
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

  const fileTypes: { value: DownloadFileType; label: string }[] = [
    { value: "pdf", label: "PDF" },
    { value: "doc", label: "Document" },
    { value: "xls", label: "Spreadsheet" },
    { value: "zip", label: "Archive" },
    { value: "img", label: "Image" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "other", label: "Other" },
  ];

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
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <FileIcon type={item.fileType} size={24} />
            <Input
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="File title"
              className="h-8 flex-1"
            />
          </div>

          <Textarea
            value={item.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Description (optional)"
            className="min-h-[60px] resize-none"
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-xs">File URL</Label>
              <Input
                value={item.fileUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  const detectedType = getFileTypeFromUrl(url);
                  onUpdate({ fileUrl: url, fileType: detectedType });
                }}
                placeholder="https://... or select from documents"
                className="h-8"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={onPickDocument}
            >
              <FolderOpen className="mr-1 h-3 w-3" />
              Pick
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={item.fileType}
                onValueChange={(value) =>
                  onUpdate({ fileType: value as DownloadFileType })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fileTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Size</Label>
              <Input
                value={item.fileSize || ""}
                onChange={(e) => onUpdate({ fileSize: e.target.value })}
                placeholder="2.5 MB"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Button Text</Label>
              <Input
                value={item.buttonText || ""}
                onChange={(e) => onUpdate({ buttonText: e.target.value })}
                placeholder="Download"
                className="h-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={item.openInNewWindow || false}
              onCheckedChange={(checked) =>
                onUpdate({ openInNewWindow: checked })
              }
            />
            <Label className="text-xs">Open in new window</Label>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Document Picker Dialog
// ============================================================================

interface DocumentPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (doc: {
    title: string;
    fileUrl: string;
    fileSize: string;
    fileType: DownloadFileType;
    documentId: string;
  }) => void;
  siteId?: string;
}

function DocumentPicker({ open, onClose, onSelect, siteId }: DocumentPickerProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && siteId) {
      setLoading(true);
      listSiteDocuments(siteId)
        .then((result) => {
          if (result.success && result.documents) {
            setDocuments(result.documents);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, siteId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Document</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No documents uploaded</p>
            <p className="mt-1 text-xs">
              Upload documents in Site Settings → Documents
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2 pr-4">
              {documents.map((doc) => {
                const fileType = getFileTypeFromUrl(doc.name);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent"
                    onClick={() => {
                      onSelect({
                        title: doc.name.replace(/\.[^/.]+$/, ""),
                        fileUrl: doc.url,
                        fileSize: formatFileSize(doc.size),
                        fileType,
                        documentId: doc.id,
                      });
                      onClose();
                    }}
                  >
                    <FileIcon type={fileType} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Stats Editor
// ============================================================================

interface StatsEditorProps {
  content: ShowcaseContent;
  onUpdate: (updates: Partial<ShowcaseContent>) => void;
  editorMode: EditorMode;
}

function StatsEditor({ content, onUpdate, editorMode }: StatsEditorProps) {
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
      const oldIndex = content.stats.findIndex((s) => s.id === active.id);
      const newIndex = content.stats.findIndex((s) => s.id === over.id);
      onUpdate({ stats: arrayMove(content.stats, oldIndex, newIndex) });
    }
  };

  const addStat = () => {
    const newStat: StatItem = {
      id: nanoid(),
      value: 100,
      suffix: "+",
      label: "New Stat",
    };
    onUpdate({ stats: [...content.stats, newStat] });
  };

  const updateStat = (id: string, updates: Partial<StatItem>) => {
    onUpdate({
      stats: content.stats.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const deleteStat = (id: string) => {
    onUpdate({ stats: content.stats.filter((s) => s.id !== id) });
  };

  const layoutOptions: { value: ShowcaseLayout; label: string }[] = [
    { value: 2, label: "2 Columns" },
    { value: 3, label: "3 Columns" },
    { value: 4, label: "4 Columns" },
    { value: "auto", label: "Auto" },
  ];

  const speedOptions: { value: ShowcaseAnimationSpeed; label: string }[] = [
    { value: "fast", label: "Fast (1s)" },
    { value: "medium", label: "Medium (2s)" },
    { value: "slow", label: "Slow (3s)" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Items */}
      {showContent && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Stats ({content.stats.length})
            <span className="text-xs text-muted-foreground">Click to expand</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={content.stats.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {content.stats.map((stat) => (
                  <SortableStatItem
                    key={stat.id}
                    stat={stat}
                    onUpdate={(updates) => updateStat(stat.id, updates)}
                    onDelete={() => deleteStat(stat.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addStat}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Stat
            </Button>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Layout Options */}
      {showLayout && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Layout Options
            <span className="text-xs text-muted-foreground">Click to expand</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Columns</Label>
              <Select
                value={String(content.statsLayout)}
                onValueChange={(value) =>
                  onUpdate({
                    statsLayout:
                      value === "auto" ? "auto" : (parseInt(value) as 2 | 3 | 4),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layoutOptions.map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Animation Speed</Label>
              <Select
                value={content.animationSpeed}
                onValueChange={(value) =>
                  onUpdate({ animationSpeed: value as ShowcaseAnimationSpeed })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {speedOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Animate on Scroll</Label>
              <Switch
                checked={content.animateOnScroll}
                onCheckedChange={(checked) =>
                  onUpdate({ animateOnScroll: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Icons</Label>
              <Switch
                checked={content.showStatIcons}
                onCheckedChange={(checked) =>
                  onUpdate({ showStatIcons: checked })
                }
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ============================================================================
// Downloads Editor
// ============================================================================

interface DownloadsEditorProps {
  content: ShowcaseContent;
  onUpdate: (updates: Partial<ShowcaseContent>) => void;
  editorMode: EditorMode;
  siteId?: string;
}

function DownloadsEditor({
  content,
  onUpdate,
  editorMode,
  siteId,
}: DownloadsEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";
  const [pickerItemId, setPickerItemId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = content.downloads.findIndex((d) => d.id === active.id);
      const newIndex = content.downloads.findIndex((d) => d.id === over.id);
      onUpdate({ downloads: arrayMove(content.downloads, oldIndex, newIndex) });
    }
  };

  const addDownload = () => {
    const newItem: DownloadItem = {
      id: nanoid(),
      title: "New File",
      fileUrl: "#",
      fileType: "pdf",
    };
    onUpdate({ downloads: [...content.downloads, newItem] });
  };

  const updateDownload = (id: string, updates: Partial<DownloadItem>) => {
    onUpdate({
      downloads: content.downloads.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    });
  };

  const deleteDownload = (id: string) => {
    onUpdate({ downloads: content.downloads.filter((d) => d.id !== id) });
  };

  const handleDocumentSelect = (doc: {
    title: string;
    fileUrl: string;
    fileSize: string;
    fileType: DownloadFileType;
    documentId: string;
  }) => {
    if (pickerItemId) {
      updateDownload(pickerItemId, {
        title: doc.title,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        documentId: doc.documentId,
      });
    }
  };

  const layoutOptions: { value: DownloadLayout; label: string }[] = [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
  ];

  return (
    <div className="space-y-4">
      {/* Document Picker Dialog */}
      <DocumentPicker
        open={pickerItemId !== null}
        onClose={() => setPickerItemId(null)}
        onSelect={handleDocumentSelect}
        siteId={siteId}
      />

      {/* Download Items */}
      {showContent && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Downloads ({content.downloads.length})
            <span className="text-xs text-muted-foreground">Click to expand</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={content.downloads.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {content.downloads.map((item) => (
                  <SortableDownloadItem
                    key={item.id}
                    item={item}
                    onUpdate={(updates) => updateDownload(item.id, updates)}
                    onDelete={() => deleteDownload(item.id)}
                    onPickDocument={() => setPickerItemId(item.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addDownload}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Download
            </Button>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Layout Options */}
      {showLayout && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Layout Options
            <span className="text-xs text-muted-foreground">Click to expand</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={content.downloadLayout}
                onValueChange={(value) =>
                  onUpdate({ downloadLayout: value as DownloadLayout })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layoutOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {content.downloadLayout === "grid" && (
              <div className="space-y-2">
                <Label>Columns</Label>
                <Select
                  value={String(content.downloadColumns || 2)}
                  onValueChange={(value) =>
                    onUpdate({ downloadColumns: parseInt(value) as 2 | 3 })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Default Button Text</Label>
              <Input
                value={content.defaultButtonText}
                onChange={(e) =>
                  onUpdate({ defaultButtonText: e.target.value })
                }
                placeholder="Download"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show File Size</Label>
              <Switch
                checked={content.showFileSize}
                onCheckedChange={(checked) =>
                  onUpdate({ showFileSize: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show File Type Icon</Label>
              <Switch
                checked={content.showFileType}
                onCheckedChange={(checked) =>
                  onUpdate({ showFileType: checked })
                }
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ============================================================================
// Main ShowcaseEditor
// ============================================================================

export function ShowcaseEditor({
  content,
  onChange,
  disabled,
  editorMode = "all",
  siteId,
}: ShowcaseEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";
  const [showModeChangeDialog, setShowModeChangeDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<ShowcaseMode | null>(null);

  // Helper to update partial content
  const onUpdate = (updates: Partial<ShowcaseContent>) => {
    onChange({ ...content, ...updates });
  };

  const handleModeChange = (newMode: ShowcaseMode) => {
    if (newMode === content.mode) return;

    // Check if there's data that would be lost
    const hasStats = content.stats && content.stats.length > 0;
    const hasDownloads = content.downloads && content.downloads.length > 0;

    if (
      (content.mode === "stats" && hasStats && newMode === "downloads") ||
      (content.mode === "downloads" && hasDownloads && newMode === "stats")
    ) {
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

  return (
    <div className="space-y-4">
      {/* Mode Change Confirmation Dialog */}
      <AlertDialog open={showModeChangeDialog} onOpenChange={setShowModeChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Block Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching modes will not delete your {content.mode} data, but it
              won&apos;t be visible until you switch back. Your{" "}
              {pendingMode === "stats" ? "downloads" : "stats"} data will be
              preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingMode(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange}>
              Switch to {pendingMode === "stats" ? "Stats" : "Downloads"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mode Selector */}
      {showContent && (
        <div className="space-y-2">
          <Label>Block Type</Label>
          <Tabs value={content.mode} onValueChange={(v) => handleModeChange(v as ShowcaseMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Section Header */}
      {showContent && (
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
            Section Header
            <span className="text-xs text-muted-foreground">Click to expand</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={content.sectionTitle || ""}
                onChange={(e) => onUpdate({ sectionTitle: e.target.value })}
                placeholder="Section title"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={content.sectionSubtitle || ""}
                onChange={(e) => onUpdate({ sectionSubtitle: e.target.value })}
                placeholder="Section subtitle"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Mode-specific editors */}
      {content.mode === "stats" && (
        <StatsEditor
          content={content}
          onUpdate={onUpdate}
          editorMode={editorMode}
        />
      )}
      {content.mode === "downloads" && (
        <DownloadsEditor
          content={content}
          onUpdate={onUpdate}
          editorMode={editorMode}
          siteId={siteId}
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

export default ShowcaseEditor;
