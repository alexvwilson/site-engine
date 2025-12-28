"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Link, X, Loader2, ImageIcon, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/app/actions/storage";
import { ImageLibrary } from "./ImageLibrary";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  siteId: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  siteId,
  disabled,
  placeholder = "Drag & drop an image, or click to browse",
  className,
}: ImageUploadProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "library" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress since FormData upload doesn't support progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90));
      }, 100);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("siteId", siteId);

      const result = await uploadImage(formData);

      clearInterval(progressInterval);
      setIsUploading(false);

      if (result.success && result.url) {
        setUploadProgress(100);
        onChange(result.url);
        setUrlInput(result.url);
        setMode("upload");
      } else {
        setError(result.error || "Upload failed");
        setUploadProgress(0);
      }
    },
    [siteId, onChange]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        await handleUpload(file);
      } else {
        setError("Please drop an image file");
      }
    },
    [disabled, handleUpload]
  );

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlSubmit = (): void => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError(null);
    }
  };

  const handleRemove = (): void => {
    onChange("");
    setUrlInput("");
    setUploadProgress(0);
    setError(null);
  };

  const handleZoneClick = (): void => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "upload" | "library" | "url")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" disabled={disabled}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="library" disabled={disabled}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Library
          </TabsTrigger>
          <TabsTrigger value="url" disabled={disabled}>
            <Link className="h-4 w-4 mr-2" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          {value ? (
            <div className="relative border rounded-lg overflow-hidden bg-muted/50">
              <img
                src={value}
                alt="Uploaded"
                className="w-full h-48 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EImage not found%3C/text%3E%3C/svg%3E";
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={handleZoneClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleZoneClick();
                }
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragging && "border-primary bg-primary/5",
                isUploading && "pointer-events-none opacity-50",
                disabled && "opacity-50 cursor-not-allowed",
                !isDragging && !disabled && "hover:border-primary/50"
              )}
            >
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                  <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{placeholder}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF, WebP, SVG up to 5MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || isUploading}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-3">
          <ImageLibrary
            siteId={siteId}
            onSelect={(url) => {
              onChange(url);
              setUrlInput(url);
              setMode("upload");
            }}
          />
        </TabsContent>

        <TabsContent value="url" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={disabled || !urlInput.trim()}
            >
              Apply
            </Button>
          </div>
          {value && (
            <div className="relative border rounded-lg overflow-hidden bg-muted/50">
              <img
                src={value}
                alt="Preview"
                className="w-full h-48 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EImage not found%3C/text%3E%3C/svg%3E";
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
