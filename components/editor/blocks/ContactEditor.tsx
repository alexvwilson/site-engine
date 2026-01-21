"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StylingControls,
  FormBackgroundPanel,
} from "@/components/editor/StylingControls";
import type {
  ContactContent,
  ContactVariant,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";

interface ContactEditorProps {
  content: ContactContent;
  onChange: (content: ContactContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

export function ContactEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: ContactEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  const handleChange = (
    field: keyof ContactContent,
    value: string | ContactVariant
  ): void => {
    onChange({ ...content, [field]: value });
  };

  const updateField = <K extends keyof ContactContent>(
    field: K,
    value: ContactContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  // Handle legacy data that may have fields array instead of variant
  const currentVariant = content.variant ?? "simple";

  return (
    <div className="space-y-6">
      {/* Content Section */}
      {showContent && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-heading">Heading</Label>
            <Input
              id="contact-heading"
              value={content.heading}
              onChange={(e) => handleChange("heading", e.target.value)}
              placeholder="Get in Touch"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-description">Description</Label>
            <Textarea
              id="contact-description"
              value={content.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Let visitors know how to reach you"
              rows={2}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-variant">Form Type</Label>
            <Select
              value={currentVariant}
              onValueChange={(value: ContactVariant) =>
                handleChange("variant", value)
              }
              disabled={disabled}
            >
              <SelectTrigger id="contact-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple (Name, Email, Message)</SelectItem>
                <SelectItem value="detailed">
                  Detailed (+ Company, Phone)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {currentVariant === "detailed"
                ? "Shows: Name, Email, Company, Phone, Message"
                : "Shows: Name, Email, Message"}
            </p>
          </div>
        </div>
      )}

      {/* Styling Section */}
      {showLayout && (
        <StylingControls
          content={content}
          onChange={onChange}
          disabled={disabled}
          siteId={siteId}
          textSizeDescription="Scales heading, description, and labels proportionally."
        >
          {/* Form Background Panel */}
          <FormBackgroundPanel
            showFormBackground={content.showFormBackground ?? true}
            formBackgroundColor={content.formBackgroundColor}
            onShowFormBackgroundChange={(checked) =>
              updateField("showFormBackground", checked)
            }
            onFormBackgroundColorChange={(color) =>
              updateField("formBackgroundColor", color)
            }
            onFormBackgroundColorReset={() => updateField("formBackgroundColor", "")}
            disabled={disabled}
          />
        </StylingControls>
      )}
    </div>
  );
}
