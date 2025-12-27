"use client";

import { useState, useCallback } from "react";
import { HeaderEditor } from "./blocks/HeaderEditor";
import { HeroEditor } from "./blocks/HeroEditor";
import { TextEditor } from "./blocks/TextEditor";
import { ImageEditor } from "./blocks/ImageEditor";
import { GalleryEditor } from "./blocks/GalleryEditor";
import { FeaturesEditor } from "./blocks/FeaturesEditor";
import { CTAEditor } from "./blocks/CTAEditor";
import { TestimonialsEditor } from "./blocks/TestimonialsEditor";
import { ContactEditor } from "./blocks/ContactEditor";
import { FooterEditor } from "./blocks/FooterEditor";
import { SaveIndicator } from "./SaveIndicator";
import { updateSection } from "@/app/actions/sections";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";
import { useAutoSave } from "@/hooks/useAutoSave";

interface SectionEditorProps {
  section: Section;
}

export function SectionEditor({ section }: SectionEditorProps) {
  const [content, setContent] = useState<SectionContent>(
    section.content as SectionContent
  );

  const saveContent = useCallback(
    async (contentToSave: SectionContent): Promise<void> => {
      await updateSection(section.id, contentToSave);
    },
    [section.id]
  );

  const { saveStatus, triggerSave } = useAutoSave({
    onSave: saveContent,
    debounceMs: 500,
  });

  const handleContentChange = useCallback(
    (newContent: SectionContent): void => {
      setContent(newContent);
      triggerSave(newContent);
    },
    [triggerSave]
  );

  const editorProps = {
    content,
    onChange: handleContentChange,
    disabled: saveStatus === "saving",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SaveIndicator status={saveStatus} />
      </div>

      {section.block_type === "header" && (
        <HeaderEditor {...editorProps} content={content as Parameters<typeof HeaderEditor>[0]["content"]} />
      )}
      {section.block_type === "hero" && (
        <HeroEditor {...editorProps} content={content as Parameters<typeof HeroEditor>[0]["content"]} />
      )}
      {section.block_type === "text" && (
        <TextEditor {...editorProps} content={content as Parameters<typeof TextEditor>[0]["content"]} />
      )}
      {section.block_type === "image" && (
        <ImageEditor {...editorProps} content={content as Parameters<typeof ImageEditor>[0]["content"]} />
      )}
      {section.block_type === "gallery" && (
        <GalleryEditor {...editorProps} content={content as Parameters<typeof GalleryEditor>[0]["content"]} />
      )}
      {section.block_type === "features" && (
        <FeaturesEditor {...editorProps} content={content as Parameters<typeof FeaturesEditor>[0]["content"]} />
      )}
      {section.block_type === "cta" && (
        <CTAEditor {...editorProps} content={content as Parameters<typeof CTAEditor>[0]["content"]} />
      )}
      {section.block_type === "testimonials" && (
        <TestimonialsEditor {...editorProps} content={content as Parameters<typeof TestimonialsEditor>[0]["content"]} />
      )}
      {section.block_type === "contact" && (
        <ContactEditor {...editorProps} content={content as Parameters<typeof ContactEditor>[0]["content"]} />
      )}
      {section.block_type === "footer" && (
        <FooterEditor {...editorProps} content={content as Parameters<typeof FooterEditor>[0]["content"]} />
      )}
    </div>
  );
}
