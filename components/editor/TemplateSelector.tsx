"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTemplatesForBlockType, type SectionTemplate } from "@/lib/section-templates";
import { getDefaultContent } from "@/lib/section-defaults";
import { BLOCK_TYPE_INFO } from "@/lib/section-types";
import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";

interface TemplateSelectorProps {
  blockType: BlockType;
  onSelect: (content: SectionContent) => void;
  onBack: () => void;
  disabled?: boolean;
}

export function TemplateSelector({
  blockType,
  onSelect,
  onBack,
  disabled,
}: TemplateSelectorProps) {
  const templates = getTemplatesForBlockType(blockType);
  const blockInfo = BLOCK_TYPE_INFO.find((b) => b.type === blockType);

  const handleSelectTemplate = (template: SectionTemplate): void => {
    onSelect(template.content as SectionContent);
  };

  const handleSelectBlank = (): void => {
    onSelect(getDefaultContent(blockType));
  };

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={disabled}
          className="text-muted-foreground"
        >
          ← Back
        </Button>
        <div>
          <h3 className="font-medium">Choose a {blockInfo?.label} Template</h3>
          <p className="text-sm text-muted-foreground">
            Select a starting point for your section
          </p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto py-2">
        {/* Blank option */}
        <button
          onClick={handleSelectBlank}
          disabled={disabled}
          className={cn(
            "flex flex-col items-start p-4 rounded-lg border-2 border-dashed text-left",
            "hover:border-primary hover:bg-primary/5 transition-colors",
            "disabled:opacity-50 disabled:pointer-events-none",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
        >
          <div className="rounded-full bg-muted p-2 mb-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="font-medium text-sm">Blank</span>
          <span className="text-xs text-muted-foreground mt-1">
            Start with default content
          </span>
        </button>

        {/* Template options */}
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-start p-4 rounded-lg border text-left",
              "hover:border-primary hover:bg-primary/5 transition-colors",
              "disabled:opacity-50 disabled:pointer-events-none",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
          >
            <div className="rounded-full bg-primary/10 p-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium text-sm">{template.name}</span>
            <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {template.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
