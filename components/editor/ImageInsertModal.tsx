"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./ImageUpload";
import { AlignLeft, AlignCenter, AlignRight, Maximize2 } from "lucide-react";
import type { ArticleImageAlignment, ArticleImageWidth } from "@/lib/section-types";

interface ImageInsertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  onInsert: (
    src: string,
    alt: string,
    alignment: ArticleImageAlignment,
    width: ArticleImageWidth
  ) => void;
}

const alignmentOptions = [
  { value: "left" as const, icon: AlignLeft, label: "Float Left" },
  { value: "right" as const, icon: AlignRight, label: "Float Right" },
  { value: "center" as const, icon: AlignCenter, label: "Center" },
  { value: "full" as const, icon: Maximize2, label: "Full Width" },
];

const widthOptions: { value: ArticleImageWidth; label: string }[] = [
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
  { value: 75, label: "75%" },
  { value: 100, label: "100%" },
];

export function ImageInsertModal({
  open,
  onOpenChange,
  siteId,
  onInsert,
}: ImageInsertModalProps): React.JSX.Element {
  const [imageSrc, setImageSrc] = useState("");
  const [altText, setAltText] = useState("");
  const [alignment, setAlignment] = useState<ArticleImageAlignment>("center");
  const [width, setWidth] = useState<ArticleImageWidth>(50);

  const handleInsert = (): void => {
    if (!imageSrc) return;
    onInsert(imageSrc, altText || "Image", alignment, width);
    // Reset state for next use
    setImageSrc("");
    setAltText("");
    setAlignment("center");
    setWidth(50);
  };

  const handleOpenChange = (newOpen: boolean): void => {
    if (!newOpen) {
      // Reset state when closing
      setImageSrc("");
      setAltText("");
      setAlignment("center");
      setWidth(50);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Selection */}
          <ImageUpload
            value={imageSrc}
            onChange={setImageSrc}
            siteId={siteId}
            placeholder="Upload or select an image to insert"
          />

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt Text</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility..."
            />
            <p className="text-xs text-muted-foreground">
              Helps with SEO and screen readers
            </p>
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-2">
              {alignmentOptions.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={alignment === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAlignment(opt.value)}
                  className="flex-1"
                  title={opt.label}
                >
                  <opt.icon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline text-xs">{opt.label.split(" ")[1] || opt.label}</span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {alignment === "left" && "Image floats left, text wraps on the right"}
              {alignment === "right" && "Image floats right, text wraps on the left"}
              {alignment === "center" && "Image centered, text flows above and below"}
              {alignment === "full" && "Image spans full width of the article"}
            </p>
          </div>

          {/* Width (only for non-full alignments) */}
          {alignment !== "full" && (
            <div className="space-y-2">
              <Label>Image Width</Label>
              <Select
                value={width.toString()}
                onValueChange={(v) => setWidth(parseInt(v) as ArticleImageWidth)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {widthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview hint */}
          {imageSrc && (
            <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
              <strong>Preview:</strong> {width}% width, {alignment} aligned
            </div>
          )}

          {/* Insert Button */}
          <Button
            type="button"
            onClick={handleInsert}
            disabled={!imageSrc}
            className="w-full"
          >
            Insert Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
