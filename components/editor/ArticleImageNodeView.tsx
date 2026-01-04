"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignRight, Maximize2, Trash2 } from "lucide-react";
import type { ArticleImageAlignment, ArticleImageWidth } from "@/lib/section-types";

const alignmentOptions = [
  { value: "left" as const, icon: AlignLeft, label: "Left" },
  { value: "right" as const, icon: AlignRight, label: "Right" },
  { value: "center" as const, icon: AlignCenter, label: "Center" },
  { value: "full" as const, icon: Maximize2, label: "Full" },
];

const widthOptions: { value: ArticleImageWidth; label: string }[] = [
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
  { value: 75, label: "75%" },
  { value: 100, label: "100%" },
];

export function ArticleImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps): React.JSX.Element {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { src, alt, alignment, width } = node.attrs as {
    src: string;
    alt: string;
    alignment: ArticleImageAlignment;
    width: ArticleImageWidth;
  };

  const handleAlignmentChange = (newAlignment: ArticleImageAlignment): void => {
    updateAttributes({ alignment: newAlignment });
  };

  const handleWidthChange = (newWidth: string): void => {
    updateAttributes({ width: parseInt(newWidth) });
  };

  const handleDelete = (): void => {
    setPopoverOpen(false);
    deleteNode();
  };

  return (
    <NodeViewWrapper
      className="article-inline-image-wrapper"
      data-alignment={alignment}
      style={{
        // Apply width for non-full alignments
        // Float/display styles are handled by CSS in ArticleTiptapEditor
        ...(alignment !== "full" && {
          width: `${width}%`,
        }),
        ...(alignment === "full" && {
          width: "100%",
        }),
      }}
    >
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div
            className={`relative cursor-pointer group ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt || ""}
              className="w-full h-auto"
              style={{ borderRadius: "var(--article-image-rounding, 8px)" }}
              draggable={false}
            />
            {/* Hover overlay */}
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center"
              style={{ borderRadius: "var(--article-image-rounding, 8px)" }}
            >
              <span className="opacity-0 group-hover:opacity-100 text-white text-xs bg-black/50 px-2 py-1 rounded transition-opacity">
                Click to edit
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-4">
            <div className="font-medium text-sm">Image Settings</div>

            {/* Alignment */}
            <div className="space-y-2">
              <Label className="text-xs">Alignment</Label>
              <div className="flex gap-1">
                {alignmentOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={alignment === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAlignmentChange(opt.value)}
                    className="flex-1 h-8 px-2"
                    title={opt.label}
                  >
                    <opt.icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Width (only for non-full alignments) */}
            {alignment !== "full" && (
              <div className="space-y-2">
                <Label className="text-xs">Width</Label>
                <Select
                  value={width.toString()}
                  onValueChange={handleWidthChange}
                >
                  <SelectTrigger className="h-8">
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

            {/* Delete Button */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Image
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </NodeViewWrapper>
  );
}
