"use client";

import { useCallback, useEffect, useRef } from "react";
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
import { EmbedEditor } from "./blocks/EmbedEditor";
import { BlogFeaturedEditor } from "./BlogFeaturedEditor";
import { BlogGridEditor } from "./BlogGridEditor";
import { SaveIndicator } from "./SaveIndicator";
import { UndoRedoButtons } from "./UndoRedoButtons";
import { updateSection } from "@/app/actions/sections";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useHistory } from "@/hooks/useHistory";

interface SectionEditorProps {
  section: Section;
  siteId: string;
}

export function SectionEditor({ section, siteId }: SectionEditorProps) {
  // Use history hook for undo/redo support
  const {
    state: content,
    set: setContent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<SectionContent>({
    initialState: section.content as SectionContent,
    storageKey: `section-history-${section.id}`,
    maxHistory: 50,
  });

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

  // Track previous content to detect undo/redo changes
  const prevContentRef = useRef(content);

  // When content changes (including from undo/redo), trigger save
  useEffect(() => {
    if (prevContentRef.current !== content) {
      triggerSave(content);
      prevContentRef.current = content;
    }
  }, [content, triggerSave]);

  const handleContentChange = useCallback(
    (newContent: SectionContent): void => {
      setContent(newContent);
    },
    [setContent]
  );

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contenteditable
      const activeElement = document.activeElement;
      const isEditing =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      // Don't intercept if user is editing in a form field
      if (isEditing) return;

      // Check for Ctrl+Z (undo) or Ctrl+Shift+Z (redo)
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }

      // Also support Ctrl+Y for redo (Windows convention)
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const editorProps = {
    content,
    onChange: handleContentChange,
    disabled: saveStatus === "saving",
    siteId,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <UndoRedoButtons
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          disabled={saveStatus === "saving"}
        />
        <SaveIndicator status={saveStatus} />
      </div>

      {section.block_type === "header" && (
        <HeaderEditor {...editorProps} content={content as Parameters<typeof HeaderEditor>[0]["content"]} mode="page" />
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
        <FooterEditor {...editorProps} content={content as Parameters<typeof FooterEditor>[0]["content"]} mode="page" />
      )}
      {section.block_type === "blog_featured" && (
        <BlogFeaturedEditor {...editorProps} content={content as Parameters<typeof BlogFeaturedEditor>[0]["content"]} />
      )}
      {section.block_type === "blog_grid" && (
        <BlogGridEditor {...editorProps} content={content as Parameters<typeof BlogGridEditor>[0]["content"]} />
      )}
      {section.block_type === "embed" && (
        <EmbedEditor {...editorProps} content={content as Parameters<typeof EmbedEditor>[0]["content"]} />
      )}
    </div>
  );
}
