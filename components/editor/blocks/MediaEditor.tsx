"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Palette, ChevronDown, AlertCircle, CheckCircle2, Code, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { ImageUpload } from "@/components/editor/ImageUpload";
import type {
  MediaContent,
  MediaMode,
  GalleryImage,
  ImageWidth,
  ImageLayout,
  GalleryAspectRatio,
  GalleryLayout,
  GalleryColumns,
  GalleryGap,
  GalleryBorderWidth,
  GalleryBorderRadius,
  GalleryAutoRotateInterval,
  EmbedAspectRatio,
  EmbedSourceType,
  TextBorderWidth,
  TextBorderRadius,
  TextColorMode,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";
import { validateEmbedCode, getEmbedServiceName } from "@/lib/embed-utils";
import {
  listSiteDocuments,
  type DocumentFile,
} from "@/app/actions/storage";

// Dynamically import TiptapEditor to avoid SSR issues with ProseMirror
const TiptapEditor = dynamic(
  () =>
    import("@/components/editor/TiptapEditor").then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md bg-muted/50 min-h-[150px]">
        <div className="h-10 border-b bg-muted/30" />
        <div className="p-3 text-muted-foreground text-sm">
          Loading editor...
        </div>
      </div>
    ),
  }
);

interface MediaEditorProps {
  content: MediaContent;
  onChange: (content: MediaContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

const DEFAULT_GALLERY_IMAGE: GalleryImage = {
  src: "",
  alt: "Image description",
  caption: "",
};

const EMBED_ASPECT_RATIOS: { value: EmbedAspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9 (Video)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "letter", label: "Letter (8.5:11)" },
  { value: "custom", label: "Custom Height" },
];

const MODE_LABELS: Record<MediaMode, string> = {
  single: "Single Image",
  gallery: "Gallery",
  embed: "Embed",
};

/**
 * Check if switching modes would cause data loss
 */
function hasDataForMode(content: MediaContent, mode: MediaMode): boolean {
  switch (mode) {
    case "single":
      return !!(content.src || content.alt || content.caption || content.description);
    case "gallery":
      return !!(content.images && content.images.length > 0 && content.images.some(img => img.src));
    case "embed":
      return !!(content.embedCode || content.embedSrc || content.documentId);
    default:
      return false;
  }
}

export function MediaEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: MediaEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  // Mode switching confirmation
  const [pendingMode, setPendingMode] = useState<MediaMode | null>(null);
  const [showModeWarning, setShowModeWarning] = useState(false);

  // Styling section state
  const [stylingOpen, setStylingOpen] = useState(false);
  const [themePrimaryColor, setThemePrimaryColor] = useState("#3B82F6");

  // Embed-specific state
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docsLoaded, setDocsLoaded] = useState(false);

  const currentMode = content.mode || "single";
  const embedSourceType: EmbedSourceType = content.embedSourceType || "embed";

  // Read the theme primary color from CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root)
      .getPropertyValue("--color-primary")
      .trim();
    if (primaryColor) {
      setThemePrimaryColor(primaryColor);
    }
  }, []);

  const loadDocuments = useCallback(async (): Promise<void> => {
    setIsLoadingDocs(true);
    try {
      const result = await listSiteDocuments(siteId);
      if (result.success && result.documents) {
        setDocuments(result.documents);
      }
      setDocsLoaded(true);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [siteId]);

  // Fetch documents when embed mode with PDF is selected
  useEffect(() => {
    if (currentMode === "embed" && embedSourceType === "pdf" && !docsLoaded) {
      loadDocuments();
    }
  }, [currentMode, embedSourceType, docsLoaded, loadDocuments]);

  // Mode switching logic
  const handleModeChange = (newMode: MediaMode): void => {
    if (newMode === currentMode) return;

    // Check if current mode has data that would be lost
    if (hasDataForMode(content, currentMode)) {
      setPendingMode(newMode);
      setShowModeWarning(true);
    } else {
      // Safe to switch without warning
      applyModeChange(newMode);
    }
  };

  const applyModeChange = (newMode: MediaMode): void => {
    // Keep styling settings, clear mode-specific content
    onChange({
      ...content,
      mode: newMode,
      // Clear single mode fields
      src: newMode === "single" ? content.src : undefined,
      alt: newMode === "single" ? content.alt : undefined,
      caption: newMode === "single" ? content.caption : undefined,
      description: newMode === "single" ? content.description : undefined,
      // Clear gallery mode fields
      images: newMode === "gallery" ? content.images : undefined,
      // Clear embed mode fields
      embedCode: newMode === "embed" ? content.embedCode : undefined,
      embedSrc: newMode === "embed" ? content.embedSrc : undefined,
      embedTitle: newMode === "embed" ? content.embedTitle : undefined,
    });
    setPendingMode(null);
    setShowModeWarning(false);
    setEmbedError(null);
  };

  const handleConfirmModeChange = (): void => {
    if (pendingMode) {
      applyModeChange(pendingMode);
    }
  };

  const handleCancelModeChange = (): void => {
    setPendingMode(null);
    setShowModeWarning(false);
  };

  // Generic field updater
  const updateField = <K extends keyof MediaContent>(
    field: K,
    value: MediaContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  // ==================== SINGLE MODE HANDLERS ====================

  // Check if current layout shows text
  const showsText = !!(content.layout && content.layout !== "image-only");
  const isSideBySide = content.layout === "image-left" || content.layout === "image-right";
  const totalWidth = isSideBySide
    ? (content.imageWidth ?? 50) + (content.textWidth ?? 50)
    : 0;
  const exceedsMaxWidth = totalWidth > 100;

  // ==================== GALLERY MODE HANDLERS ====================

  const handleGalleryImageChange = (
    index: number,
    field: keyof GalleryImage,
    value: string
  ): void => {
    const images = content.images ?? [];
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange({ ...content, images: newImages });
  };

  const handleAddGalleryImage = (): void => {
    const images = content.images ?? [];
    onChange({
      ...content,
      images: [...images, { ...DEFAULT_GALLERY_IMAGE }],
    });
  };

  const handleRemoveGalleryImage = (index: number): void => {
    const images = content.images ?? [];
    const newImages = images.filter((_, i) => i !== index);
    onChange({ ...content, images: newImages });
  };

  // ==================== EMBED MODE HANDLERS ====================

  const handleEmbedSourceTypeChange = (type: string): void => {
    const newSourceType = type as EmbedSourceType;
    onChange({
      ...content,
      embedSourceType: newSourceType,
      embedSrc: "",
      embedCode: "",
      documentId: undefined,
      documentSlug: undefined,
      embedTitle: "",
    });
    setEmbedError(null);
  };

  const handleEmbedCodeChange = (value: string): void => {
    if (!value.trim()) {
      setEmbedError(null);
      onChange({ ...content, embedCode: value, embedSrc: "" });
      return;
    }

    const result = validateEmbedCode(value);

    if (result.valid && result.parsed) {
      setEmbedError(null);
      onChange({
        ...content,
        embedCode: value,
        embedSrc: result.parsed.src,
        embedTitle: result.parsed.title || content.embedTitle,
      });
    } else {
      setEmbedError(result.error || "Invalid embed code");
      onChange({ ...content, embedCode: value, embedSrc: "" });
    }
  };

  const handleDocumentSelect = (docId: string): void => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      const pdfUrl = `/docs/${doc.slug}`;
      onChange({
        ...content,
        embedSourceType: "pdf",
        documentId: doc.id,
        documentSlug: doc.slug,
        embedSrc: pdfUrl,
        embedTitle: doc.name.replace(/\.pdf$/i, ""),
      });
    }
  };

  const getEmbedAspectRatioStyle = (): React.CSSProperties => {
    const aspectRatio = content.embedAspectRatio ?? "16:9";
    if (aspectRatio === "custom") {
      return { height: `${content.customHeight || 400}px` };
    }
    if (aspectRatio === "letter") {
      return { aspectRatio: "8.5/11" };
    }
    return { aspectRatio: aspectRatio.replace(":", "/") };
  };

  const embedIsValid = !!content.embedSrc;

  return (
    <div className="space-y-6">
      {/* Mode Selector - Always visible */}
      <div className="space-y-2">
        <Label>Media Type</Label>
        <Tabs value={currentMode} onValueChange={(v) => handleModeChange(v as MediaMode)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single" disabled={disabled}>
              Single Image
            </TabsTrigger>
            <TabsTrigger value="gallery" disabled={disabled}>
              Gallery
            </TabsTrigger>
            <TabsTrigger value="embed" disabled={disabled}>
              Embed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mode-specific content editors */}
      {currentMode === "single" && (
        <SingleModeEditor
          content={content}
          disabled={disabled}
          siteId={siteId}
          showContent={showContent}
          showLayout={showLayout}
          showsText={showsText}
          isSideBySide={isSideBySide}
          totalWidth={totalWidth}
          exceedsMaxWidth={exceedsMaxWidth}
          updateField={updateField}
        />
      )}

      {currentMode === "gallery" && (
        <GalleryModeEditor
          content={content}
          onChange={onChange}
          disabled={disabled}
          siteId={siteId}
          showContent={showContent}
          showLayout={showLayout}
          themePrimaryColor={themePrimaryColor}
          onImageChange={handleGalleryImageChange}
          onAddImage={handleAddGalleryImage}
          onRemoveImage={handleRemoveGalleryImage}
        />
      )}

      {currentMode === "embed" && (
        <EmbedModeEditor
          content={content}
          disabled={disabled}
          showContent={showContent}
          showLayout={showLayout}
          embedSourceType={embedSourceType}
          embedError={embedError}
          documents={documents}
          isLoadingDocs={isLoadingDocs}
          embedIsValid={embedIsValid}
          onSourceTypeChange={handleEmbedSourceTypeChange}
          onEmbedCodeChange={handleEmbedCodeChange}
          onDocumentSelect={handleDocumentSelect}
          getAspectRatioStyle={getEmbedAspectRatioStyle}
          updateField={updateField}
        />
      )}

      {/* Styling Section (Collapsible) - Layout mode */}
      {showLayout && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Collapsible
              open={stylingOpen}
              onOpenChange={setStylingOpen}
              className="flex-1"
            >
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                <Palette className="h-4 w-4" />
                Styling
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${stylingOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
            </Collapsible>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="enable-styling"
                className="text-sm text-muted-foreground"
              >
                {content.enableStyling ?? false ? "On" : "Off"}
              </Label>
              <Switch
                id="enable-styling"
                checked={content.enableStyling ?? false}
                onCheckedChange={(checked) => {
                  updateField("enableStyling", checked);
                  if (checked && !stylingOpen) {
                    setStylingOpen(true);
                  }
                }}
                disabled={disabled}
              />
            </div>
          </div>

          <Collapsible open={stylingOpen} onOpenChange={setStylingOpen}>
            <CollapsibleContent className="space-y-6">
              {/* Border Controls */}
              <div className="space-y-4 rounded-lg border p-4">
                <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                  Border
                </Label>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-border">Show Border</Label>
                  <Switch
                    id="show-border"
                    checked={content.showBorder ?? false}
                    onCheckedChange={(checked) => updateField("showBorder", checked)}
                    disabled={disabled}
                  />
                </div>

                {content.showBorder && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Width</Label>
                        <Select
                          value={content.borderWidth ?? "medium"}
                          onValueChange={(v) =>
                            updateField("borderWidth", v as TextBorderWidth)
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="thin">Thin (1px)</SelectItem>
                            <SelectItem value="medium">Medium (2px)</SelectItem>
                            <SelectItem value="thick">Thick (4px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Corners</Label>
                        <Select
                          value={content.borderRadius ?? "medium"}
                          onValueChange={(v) =>
                            updateField("borderRadius", v as TextBorderRadius)
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Square</SelectItem>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="full">Pill</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Border Color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={content.borderColor || themePrimaryColor}
                          onChange={(e) => updateField("borderColor", e.target.value)}
                          disabled={disabled}
                          className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-sm text-muted-foreground">
                          {content.borderColor || "Using theme primary"}
                        </span>
                        {content.borderColor && (
                          <button
                            type="button"
                            onClick={() => updateField("borderColor", "")}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                            disabled={disabled}
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Background & Overlay Controls */}
              <div className="space-y-4 rounded-lg border p-4">
                <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                  Background
                </Label>

                <div className="space-y-2">
                  <Label>Background Image</Label>
                  <ImageUpload
                    value={content.backgroundImage || ""}
                    onChange={(url) => updateField("backgroundImage", url)}
                    siteId={siteId}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Overlay Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={content.overlayColor || "#000000"}
                      onChange={(e) => updateField("overlayColor", e.target.value)}
                      disabled={disabled}
                      className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-sm text-muted-foreground">
                      {content.overlayColor || "#000000"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Overlay Opacity</Label>
                    <span className="text-sm text-muted-foreground">
                      {content.overlayOpacity ?? 0}%
                    </span>
                  </div>
                  <Slider
                    value={[content.overlayOpacity ?? 0]}
                    onValueChange={([v]) => updateField("overlayOpacity", v)}
                    min={0}
                    max={100}
                    step={5}
                    disabled={disabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.backgroundImage
                      ? "Overlay tints the background image"
                      : "Acts as a solid background color when no image is set"}
                  </p>
                </div>
              </div>

              {/* Typography Controls (only when single mode layout shows text) */}
              {currentMode === "single" && showsText && (
                <div className="space-y-4 rounded-lg border p-4">
                  <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                    Typography
                  </Label>

                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <Select
                      value={content.textColorMode ?? "auto"}
                      onValueChange={(v) =>
                        updateField("textColorMode", v as TextColorMode)
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          Auto (detect from background)
                        </SelectItem>
                        <SelectItem value="light">Light (white text)</SelectItem>
                        <SelectItem value="dark">Dark (black text)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Auto uses light text when a background image is set.
                    </p>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Mode Change Warning Dialog */}
      <AlertDialog open={showModeWarning} onOpenChange={setShowModeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch media type?</AlertDialogTitle>
            <AlertDialogDescription>
              You have content in the current mode ({MODE_LABELS[currentMode]}).
              Switching to {pendingMode ? MODE_LABELS[pendingMode] : ""} will clear
              that content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelModeChange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmModeChange}>
              Switch Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== SINGLE MODE EDITOR ====================

interface SingleModeEditorProps {
  content: MediaContent;
  disabled?: boolean;
  siteId: string;
  showContent: boolean;
  showLayout: boolean;
  showsText: boolean;
  isSideBySide: boolean;
  totalWidth: number;
  exceedsMaxWidth: boolean;
  updateField: <K extends keyof MediaContent>(field: K, value: MediaContent[K]) => void;
}

function SingleModeEditor({
  content,
  disabled,
  siteId,
  showContent,
  showLayout,
  showsText,
  isSideBySide,
  totalWidth,
  exceedsMaxWidth,
  updateField,
}: SingleModeEditorProps) {
  return (
    <>
      {/* Content Section */}
      {showContent && (
        <>
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUpload
              value={content.src ?? ""}
              onChange={(url) => updateField("src", url)}
              siteId={siteId}
              disabled={disabled}
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="image-alt">Alt Text</Label>
            <Input
              id="image-alt"
              value={content.alt ?? ""}
              onChange={(e) => updateField("alt", e.target.value)}
              placeholder="Describe the image for accessibility"
              disabled={disabled}
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="image-caption">Caption (optional)</Label>
            <Input
              id="image-caption"
              value={content.caption ?? ""}
              onChange={(e) => updateField("caption", e.target.value)}
              placeholder="Brief caption below the image"
              disabled={disabled}
            />
          </div>

          {/* Description - Only shown when layout includes text */}
          {showsText && (
            <div className="space-y-2">
              <Label>Description</Label>
              <TiptapEditor
                value={content.description ?? ""}
                onChange={(html) => updateField("description", html)}
                placeholder="Add a detailed description..."
                disabled={disabled}
              />
            </div>
          )}
        </>
      )}

      {/* Layout Section */}
      {showLayout && (
        <>
          {/* Image Width */}
          <div className="space-y-2">
            <Label>Image Width</Label>
            <Select
              value={String(content.imageWidth ?? 50)}
              onValueChange={(v) => updateField("imageWidth", Number(v) as ImageWidth)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10% - Very Small</SelectItem>
                <SelectItem value="25">25% - Small</SelectItem>
                <SelectItem value="50">50% - Medium</SelectItem>
                <SelectItem value="75">75% - Large</SelectItem>
                <SelectItem value="100">100% - Full Width</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls the width of the image section relative to the page.
            </p>
          </div>

          {/* Layout */}
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={content.layout ?? "image-only"}
              onValueChange={(v) => updateField("layout", v as ImageLayout)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image-only">Image Only</SelectItem>
                <SelectItem value="image-left">Image Left + Text Right</SelectItem>
                <SelectItem value="image-right">Image Right + Text Left</SelectItem>
                <SelectItem value="image-top">Image Top + Text Below</SelectItem>
                <SelectItem value="image-bottom">Text Top + Image Below</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text Width - Only for side-by-side layouts */}
          {isSideBySide && (
            <div className="space-y-2">
              <Label>Text Width</Label>
              <Select
                value={String(content.textWidth ?? 50)}
                onValueChange={(v) => updateField("textWidth", Number(v) as ImageWidth)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10% - Very Small</SelectItem>
                  <SelectItem value="25">25% - Small</SelectItem>
                  <SelectItem value="50">50% - Medium</SelectItem>
                  <SelectItem value="75">75% - Large</SelectItem>
                  <SelectItem value="100">100% - Full Width</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Image ({content.imageWidth ?? 50}%) + Text ({content.textWidth ?? 50}%) = {totalWidth}%
              </p>
              {exceedsMaxWidth && (
                <p className="text-xs text-destructive">
                  Warning: Total exceeds 100%. Content may wrap or overflow.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

// ==================== GALLERY MODE EDITOR ====================

interface GalleryModeEditorProps {
  content: MediaContent;
  onChange: (content: MediaContent) => void;
  disabled?: boolean;
  siteId: string;
  showContent: boolean;
  showLayout: boolean;
  themePrimaryColor: string;
  onImageChange: (index: number, field: keyof GalleryImage, value: string) => void;
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

function GalleryModeEditor({
  content,
  onChange,
  disabled,
  siteId,
  showContent,
  showLayout,
  themePrimaryColor,
  onImageChange,
  onAddImage,
  onRemoveImage,
}: GalleryModeEditorProps) {
  const images = content.images ?? [];
  const layout = content.galleryLayout ?? "grid";
  const aspectRatio = content.galleryAspectRatio ?? "1:1";
  const columns = content.columns ?? "auto";
  const gap = content.gap ?? "medium";
  const lightbox = content.lightbox ?? false;
  const autoRotate = content.autoRotate ?? false;
  const autoRotateInterval = content.autoRotateInterval ?? 5;
  const showBorder = content.showBorder ?? true;
  const borderWidth = content.borderWidth ?? "thin";
  const borderRadius = content.borderRadius ?? "medium";
  const borderColor = content.borderColor ?? "";

  return (
    <>
      {/* Gallery Settings Panel - Layout */}
      {showLayout && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium text-sm">Gallery Settings</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Layout */}
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={layout}
                onValueChange={(value: GalleryLayout) =>
                  onChange({ ...content, galleryLayout: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select
                value={aspectRatio}
                onValueChange={(value: GalleryAspectRatio) =>
                  onChange({ ...content, galleryAspectRatio: value })
                }
                disabled={disabled || layout === "masonry"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                  <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                  <SelectItem value="4:3">Landscape (4:3)</SelectItem>
                  <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                  <SelectItem value="original">Original</SelectItem>
                </SelectContent>
              </Select>
              {layout === "masonry" && (
                <p className="text-xs text-muted-foreground">
                  Masonry uses original aspect ratios
                </p>
              )}
            </div>

            {/* Columns */}
            <div className="space-y-2">
              <Label>{layout === "carousel" ? "Visible Images" : "Columns"}</Label>
              <Select
                value={String(columns)}
                onValueChange={(value) =>
                  onChange({
                    ...content,
                    columns:
                      value === "auto" ? "auto" : (parseInt(value) as GalleryColumns),
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
              {layout === "carousel" && (
                <p className="text-xs text-muted-foreground">
                  Images visible at once
                </p>
              )}
            </div>

            {/* Gap */}
            <div className="space-y-2">
              <Label>Spacing</Label>
              <Select
                value={gap}
                onValueChange={(value: GalleryGap) =>
                  onChange({ ...content, gap: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Border Settings */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="gallery-border-toggle"
                checked={showBorder}
                onCheckedChange={(checked) =>
                  onChange({ ...content, showBorder: checked })
                }
                disabled={disabled}
              />
              <Label htmlFor="gallery-border-toggle" className="cursor-pointer">
                Show image borders
              </Label>
            </div>

            {/* Border Radius - Always visible */}
            <div className="space-y-2 pl-10">
              <Label>Corner Rounding</Label>
              <Select
                value={borderRadius}
                onValueChange={(value: GalleryBorderRadius) =>
                  onChange({ ...content, borderRadius: value as TextBorderRadius })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="full">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showBorder && (
              <div className="grid grid-cols-2 gap-4 pl-10">
                {/* Border Width */}
                <div className="space-y-2">
                  <Label>Border Width</Label>
                  <Select
                    value={borderWidth}
                    onValueChange={(value: GalleryBorderWidth) =>
                      onChange({ ...content, borderWidth: value as TextBorderWidth })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thin">Thin</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="thick">Thick</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Border Color */}
                <div className="space-y-2">
                  <Label>Border Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={borderColor || themePrimaryColor}
                      onChange={(e) =>
                        onChange({ ...content, borderColor: e.target.value })
                      }
                      disabled={disabled}
                      className="h-9 w-14 rounded border cursor-pointer disabled:opacity-50"
                    />
                    {borderColor && (
                      <button
                        type="button"
                        onClick={() => onChange({ ...content, borderColor: "" })}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                        disabled={disabled}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {borderColor ? borderColor : "Using theme primary"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lightbox Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="gallery-lightbox-toggle"
              checked={lightbox}
              onCheckedChange={(checked) =>
                onChange({ ...content, lightbox: checked })
              }
              disabled={disabled}
            />
            <Label htmlFor="gallery-lightbox-toggle" className="cursor-pointer">
              Enable lightbox (fullscreen on click)
            </Label>
          </div>

          {/* Auto-Rotate (Carousel only) */}
          {layout === "carousel" && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="gallery-auto-rotate-toggle"
                  checked={autoRotate}
                  onCheckedChange={(checked) =>
                    onChange({ ...content, autoRotate: checked })
                  }
                  disabled={disabled}
                />
                <Label htmlFor="gallery-auto-rotate-toggle" className="cursor-pointer">
                  Auto-rotate carousel
                </Label>
              </div>

              {autoRotate && (
                <div className="space-y-2 pl-10">
                  <Label>Interval</Label>
                  <Select
                    value={String(autoRotateInterval)}
                    onValueChange={(value) =>
                      onChange({
                        ...content,
                        autoRotateInterval: parseInt(value) as GalleryAutoRotateInterval,
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="7">7 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pauses on hover
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image List - Content */}
      {showContent && (
        <>
          {images.length === 0 && (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              No images yet. Add your first image below.
            </div>
          )}

          {images.map((image, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Image {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveImage(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                  value={image.src}
                  onChange={(url) => onImageChange(index, "src", url)}
                  siteId={siteId}
                  disabled={disabled}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`gallery-${index}-alt`}>Alt Text</Label>
                  <Input
                    id={`gallery-${index}-alt`}
                    value={image.alt}
                    onChange={(e) => onImageChange(index, "alt", e.target.value)}
                    placeholder="Image description"
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`gallery-${index}-caption`}>Caption (optional)</Label>
                  <Input
                    id={`gallery-${index}-caption`}
                    value={image.caption ?? ""}
                    onChange={(e) => onImageChange(index, "caption", e.target.value)}
                    placeholder="Add a caption"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={onAddImage}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </>
      )}
    </>
  );
}

// ==================== EMBED MODE EDITOR ====================

interface EmbedModeEditorProps {
  content: MediaContent;
  disabled?: boolean;
  showContent: boolean;
  showLayout: boolean;
  embedSourceType: EmbedSourceType;
  embedError: string | null;
  documents: DocumentFile[];
  isLoadingDocs: boolean;
  embedIsValid: boolean;
  onSourceTypeChange: (type: string) => void;
  onEmbedCodeChange: (value: string) => void;
  onDocumentSelect: (docId: string) => void;
  getAspectRatioStyle: () => React.CSSProperties;
  updateField: <K extends keyof MediaContent>(field: K, value: MediaContent[K]) => void;
}

function EmbedModeEditor({
  content,
  disabled,
  showContent,
  showLayout,
  embedSourceType,
  embedError,
  documents,
  isLoadingDocs,
  embedIsValid,
  onSourceTypeChange,
  onEmbedCodeChange,
  onDocumentSelect,
  getAspectRatioStyle,
  updateField,
}: EmbedModeEditorProps) {
  return (
    <>
      {/* Content Section */}
      {showContent && (
        <>
          {/* Source Type Tabs */}
          <Tabs value={embedSourceType} onValueChange={onSourceTypeChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="embed" disabled={disabled}>
                <Code className="mr-2 h-4 w-4" />
                Embed Code
              </TabsTrigger>
              <TabsTrigger value="pdf" disabled={disabled}>
                <FileText className="mr-2 h-4 w-4" />
                PDF Document
              </TabsTrigger>
            </TabsList>

            {/* Embed Code Tab */}
            <TabsContent value="embed" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embed-code">Embed Code</Label>
                <Textarea
                  id="embed-code"
                  value={content.embedCode ?? ""}
                  onChange={(e) => onEmbedCodeChange(e.target.value)}
                  placeholder='Paste iframe embed code here (e.g., <iframe src="https://youtube.com/embed/...")'
                  disabled={disabled}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Supported: YouTube, Vimeo, Google Maps, Spotify, SoundCloud
                </p>
              </div>

              {embedError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{embedError}</AlertDescription>
                </Alert>
              )}

              {embedIsValid && content.embedSrc && embedSourceType === "embed" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    {getEmbedServiceName(content.embedSrc)} embed detected
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* PDF Document Tab */}
            <TabsContent value="pdf" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-select">Select Document</Label>
                {isLoadingDocs ? (
                  <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading documents...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-8 w-8" />
                    <p>No documents uploaded</p>
                    <p className="mt-1 text-xs">
                      Upload PDFs in Settings → Documents
                    </p>
                  </div>
                ) : (
                  <Select
                    value={content.documentId || ""}
                    onValueChange={onDocumentSelect}
                    disabled={disabled}
                  >
                    <SelectTrigger id="document-select">
                      <SelectValue placeholder="Choose a PDF document" />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {embedIsValid && content.embedSrc && embedSourceType === "pdf" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    PDF selected: {content.documentSlug}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="embed-title">Title (optional)</Label>
            <Input
              id="embed-title"
              value={content.embedTitle || ""}
              onChange={(e) => updateField("embedTitle", e.target.value)}
              placeholder="Descriptive title for accessibility"
              disabled={disabled}
            />
          </div>

          {/* Preview */}
          {embedIsValid && content.embedSrc && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="relative w-full overflow-hidden rounded-md border bg-muted"
                style={getAspectRatioStyle()}
              >
                <iframe
                  src={content.embedSrc}
                  title={content.embedTitle || "Embedded content"}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!content.embedSrc && !embedError && embedSourceType === "embed" && (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <Code className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Paste an embed code above to preview
              </p>
            </div>
          )}

          {!content.embedSrc && embedSourceType === "pdf" && documents.length > 0 && (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Select a document above to preview
              </p>
            </div>
          )}
        </>
      )}

      {/* Layout Section */}
      {showLayout && (
        <>
          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label htmlFor="embed-aspect-ratio">Aspect Ratio</Label>
            <Select
              value={content.embedAspectRatio ?? "16:9"}
              onValueChange={(v) => updateField("embedAspectRatio", v as EmbedAspectRatio)}
              disabled={disabled}
            >
              <SelectTrigger id="embed-aspect-ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMBED_ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {content.embedAspectRatio === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-height">Height (pixels)</Label>
              <Input
                id="custom-height"
                type="number"
                value={content.customHeight || 400}
                onChange={(e) => {
                  const height = parseInt(e.target.value, 10);
                  if (!isNaN(height) && height > 0) {
                    updateField("customHeight", height);
                  }
                }}
                min={100}
                max={1000}
                disabled={disabled}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
