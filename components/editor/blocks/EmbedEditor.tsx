"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Code, FileText, Loader2 } from "lucide-react";
import type {
  EmbedContent,
  EmbedAspectRatio,
  EmbedSourceType,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";
import { validateEmbedCode, getEmbedServiceName } from "@/lib/embed-utils";
import {
  listSiteDocuments,
  type DocumentFile,
} from "@/app/actions/storage";

interface EmbedEditorProps {
  content: EmbedContent;
  onChange: (content: EmbedContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

const ASPECT_RATIOS: { value: EmbedAspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9 (Video)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "letter", label: "Letter (8.5:11)" },
  { value: "custom", label: "Custom Height" },
];

export function EmbedEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: EmbedEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docsLoaded, setDocsLoaded] = useState(false);

  const sourceType: EmbedSourceType = content.sourceType || "embed";

  // Fetch documents when PDF tab is selected
  useEffect(() => {
    if (sourceType === "pdf" && !docsLoaded) {
      loadDocuments();
    }
  }, [sourceType, siteId, docsLoaded]);

  const loadDocuments = async (): Promise<void> => {
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
  };

  const handleSourceTypeChange = (type: string): void => {
    const newSourceType = type as EmbedSourceType;
    // Clear content when switching source types
    onChange({
      ...content,
      sourceType: newSourceType,
      src: "",
      embedCode: "",
      documentId: undefined,
      documentSlug: undefined,
      title: "",
    });
    setError(null);
  };

  const handleEmbedCodeChange = (value: string): void => {
    if (!value.trim()) {
      setError(null);
      onChange({ ...content, embedCode: value, src: "" });
      return;
    }

    const result = validateEmbedCode(value);

    if (result.valid && result.parsed) {
      setError(null);
      onChange({
        ...content,
        embedCode: value,
        src: result.parsed.src,
        title: result.parsed.title || content.title,
      });
    } else {
      setError(result.error || "Invalid embed code");
      onChange({ ...content, embedCode: value, src: "" });
    }
  };

  const handleDocumentSelect = (docId: string): void => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      // Use root-level /docs/ path - works for both custom domains and internal routes
      const pdfUrl = `/docs/${doc.slug}`;
      onChange({
        ...content,
        sourceType: "pdf",
        documentId: doc.id,
        documentSlug: doc.slug,
        src: pdfUrl,
        title: doc.name.replace(/\.pdf$/i, ""),
      });
    }
  };

  const handleAspectRatioChange = (value: EmbedAspectRatio): void => {
    onChange({ ...content, aspectRatio: value });
  };

  const handleCustomHeightChange = (value: string): void => {
    const height = parseInt(value, 10);
    if (!isNaN(height) && height > 0) {
      onChange({ ...content, customHeight: height });
    }
  };

  const handleTitleChange = (value: string): void => {
    onChange({ ...content, title: value });
  };

  const isValid = !!content.src;

  const getAspectRatioStyle = (): React.CSSProperties => {
    if (content.aspectRatio === "custom") {
      return { height: `${content.customHeight || 400}px` };
    }
    if (content.aspectRatio === "letter") {
      return { aspectRatio: "8.5/11" };
    }
    return { aspectRatio: content.aspectRatio.replace(":", "/") };
  };

  return (
    <div className="space-y-4">
      {/* Content Section */}
      {showContent && (
        <>
          {/* Source Type Tabs */}
          <Tabs value={sourceType} onValueChange={handleSourceTypeChange}>
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
                  value={content.embedCode}
                  onChange={(e) => handleEmbedCodeChange(e.target.value)}
                  placeholder='Paste iframe embed code here (e.g., <iframe src="https://youtube.com/embed/...")'
                  disabled={disabled}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Supported: YouTube, Vimeo, Google Maps, Spotify, SoundCloud
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isValid && content.src && sourceType === "embed" && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    {getEmbedServiceName(content.src)} embed detected
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
                    onValueChange={handleDocumentSelect}
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

              {isValid && content.src && sourceType === "pdf" && (
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
              value={content.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Descriptive title for accessibility"
              disabled={disabled}
            />
          </div>

          {/* Preview */}
          {isValid && content.src && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="relative w-full overflow-hidden rounded-md border bg-muted"
                style={getAspectRatioStyle()}
              >
                <iframe
                  src={content.src}
                  title={content.title || "Embedded content"}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!content.src && !error && sourceType === "embed" && (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <Code className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Paste an embed code above to preview
              </p>
            </div>
          )}

          {!content.src && sourceType === "pdf" && documents.length > 0 && (
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
            <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
            <Select
              value={content.aspectRatio}
              onValueChange={handleAspectRatioChange}
              disabled={disabled}
            >
              <SelectTrigger id="aspect-ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {content.aspectRatio === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-height">Height (pixels)</Label>
              <Input
                id="custom-height"
                type="number"
                value={content.customHeight || 400}
                onChange={(e) => handleCustomHeightChange(e.target.value)}
                min={100}
                max={1000}
                disabled={disabled}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
