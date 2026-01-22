"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlockIcon } from "./BlockIcon";
import { ContentTab } from "./inspector/ContentTab";
import { DesignTab } from "./inspector/DesignTab";
import { AdvancedTab } from "./inspector/AdvancedTab";
import {
  EditorModeToggle,
  type EditorMode,
} from "./inspector/EditorModeToggle";
import { SaveIndicator } from "./SaveIndicator";
import { UndoRedoButtons } from "./UndoRedoButtons";
import { useHistory } from "@/hooks/useHistory";
import { useAutoSave } from "@/hooks/useAutoSave";
import { updateSection } from "@/app/actions/sections";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";
import { BLOCK_TYPE_INFO } from "@/lib/section-types";

type InspectorTab = "content" | "design" | "advanced";

const EDITOR_MODE_STORAGE_KEY = "editor-mode-preference";

interface InspectorPanelProps {
  section: Section | null;
  siteId: string;
  onClose: () => void;
}

export function InspectorPanel({
  section,
  siteId,
  onClose,
}: InspectorPanelProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<InspectorTab>("content");

  // Editor mode state with localStorage persistence
  const [editorMode, setEditorMode] = useState<EditorMode>(() => {
    if (typeof window === "undefined") return "all";
    const stored = localStorage.getItem(EDITOR_MODE_STORAGE_KEY);
    if (stored === "content" || stored === "layout" || stored === "all") {
      return stored;
    }
    return "all";
  });

  const handleEditorModeChange = (mode: EditorMode): void => {
    setEditorMode(mode);
    localStorage.setItem(EDITOR_MODE_STORAGE_KEY, mode);
  };

  // Track section ID to reset state when selection changes
  const currentSectionIdRef = useRef<string | null>(null);

  // Undo/redo history for the current section
  const {
    state: historyContent,
    set: setContent,
    undo,
    redo,
    canUndo,
    canRedo,
    clear: clearHistory,
  } = useHistory<SectionContent>({
    initialState: (section?.content as SectionContent) ?? {},
    storageKey: section ? `section-history-${section.id}` : undefined,
    maxHistory: 50,
  });

  // Use section.content directly if section changed but history hasn't synced yet
  // This prevents passing stale content to editors during the render before useEffect runs
  const content =
    section && section.id !== currentSectionIdRef.current
      ? (section.content as SectionContent)
      : historyContent;

  // Auto-save with debounce
  const saveContent = useCallback(
    async (contentToSave: SectionContent): Promise<void> => {
      if (!section) return;
      await updateSection(section.id, contentToSave);
    },
    [section]
  );

  const { saveStatus, triggerSave } = useAutoSave({
    onSave: saveContent,
    debounceMs: 500,
  });

  // Track content changes for auto-save
  const prevContentRef = useRef(content);

  useEffect(() => {
    if (prevContentRef.current !== content && section) {
      triggerSave(content);
      prevContentRef.current = content;
    }
  }, [content, triggerSave, section]);

  // Update content when section changes
  useEffect(() => {
    if (section && section.id !== currentSectionIdRef.current) {
      currentSectionIdRef.current = section.id;
      setContent(section.content as SectionContent);
      clearHistory();
      prevContentRef.current = section.content as SectionContent;
      setActiveTab("content");
    } else if (!section) {
      currentSectionIdRef.current = null;
    }
  }, [section, setContent, clearHistory]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Check if user is typing in an input, textarea, or contenteditable
      const activeElement = document.activeElement;
      const isEditing =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      if (isEditing) return;

      // Ctrl/Cmd + Z for undo, Ctrl/Cmd + Shift + Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }

      // Ctrl/Cmd + Y for redo (Windows convention)
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }

      // Escape to close inspector
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, onClose]);

  const handleContentChange = useCallback(
    (newContent: SectionContent): void => {
      setContent(newContent);
    },
    [setContent]
  );

  // Empty state when no section selected
  if (!section) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="text-muted-foreground">
          <p className="text-sm">Select a section to edit</p>
          <p className="text-xs mt-1">Click a section in the list or preview</p>
        </div>
      </div>
    );
  }

  const blockInfo = BLOCK_TYPE_INFO.find((b) => b.type === section.block_type);
  const isSaving = saveStatus === "saving";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <BlockIcon
            blockType={section.block_type}
            className="h-4 w-4 shrink-0 text-muted-foreground"
          />
          <span className="font-medium text-sm truncate">
            {blockInfo?.label ?? section.block_type}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SaveIndicator status={saveStatus} />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close inspector</span>
          </Button>
        </div>
      </div>

      {/* Undo/Redo Controls */}
      <div className="px-4 py-2 border-b">
        <UndoRedoButtons
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          disabled={isSaving}
        />
      </div>

      {/* Editor Mode Toggle - only show when Content tab is active */}
      {activeTab === "content" && (
        <div className="px-4 py-2 border-b bg-muted/20">
          <EditorModeToggle
            mode={editorMode}
            onChange={handleEditorModeChange}
            disabled={isSaving}
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as InspectorTab)}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-4 pt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content" className="text-xs">
              Content
            </TabsTrigger>
            <TabsTrigger value="design" className="text-xs">
              Design
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">
              Advanced
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <TabsContent value="content" className="mt-0 focus-visible:outline-none">
                <ContentTab
                  key={section.id}
                  section={section}
                  content={content}
                  onChange={handleContentChange}
                  siteId={siteId}
                  disabled={isSaving}
                  editorMode={editorMode}
                />
              </TabsContent>
              <TabsContent value="design" className="mt-0 focus-visible:outline-none">
                <DesignTab
                  content={content}
                  onChange={handleContentChange}
                  siteId={siteId}
                  disabled={isSaving}
                />
              </TabsContent>
              <TabsContent value="advanced" className="mt-0 focus-visible:outline-none">
                <AdvancedTab section={section} disabled={isSaving} />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
