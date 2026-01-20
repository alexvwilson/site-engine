"use client";

import { useState, useEffect, useCallback } from "react";
import type { Page } from "@/lib/drizzle/schema/pages";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeaderContent, FooterContent } from "@/lib/section-types";
import { EditorSelectionProvider } from "@/contexts/EditorSelectionContext";
import { EditorHeader } from "./EditorHeader";
import { SectionsList } from "./SectionsList";
import { BlockPicker } from "./BlockPicker";
import { LayoutSuggestionModal } from "./LayoutSuggestionModal";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import type { ViewMode } from "./ViewModeToggle";
import type { DeviceType } from "@/components/preview/DeviceToggle";
import type { PreviewColorMode } from "@/components/preview/ColorModePreviewToggle";

const STORAGE_KEY = "editor-view-mode";

interface EditorLayoutProps {
  page: Page;
  siteId: string;
  sections: Section[];
  previewSections: Section[];
  theme: ThemeData | null;
  siteHeader: HeaderContent | null;
  siteFooter: FooterContent | null;
}

export function EditorLayout({
  page,
  siteId,
  sections,
  previewSections,
  theme,
  siteHeader,
  siteFooter,
}: EditorLayoutProps) {
  // View mode with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [colorMode, setColorMode] = useState<PreviewColorMode>("light");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved view mode on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (saved && ["builder", "split", "preview"].includes(saved)) {
      setViewMode(saved);
    }
    setIsHydrated(true);
  }, []);

  // Persist view mode changes
  const handleViewModeChange = useCallback((mode: ViewMode): void => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  // Responsive: detect small screens (< 1024px)
  const isSmallScreen = useMediaQuery("(max-width: 1023px)");

  // On small screens, force builder or preview (no split)
  const effectiveViewMode =
    isSmallScreen && viewMode === "split" ? "builder" : viewMode;

  // Keyboard shortcut: Cmd/Ctrl+Shift+P to cycle view modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        const modes: ViewMode[] = isSmallScreen
          ? ["builder", "preview"]
          : ["builder", "split", "preview"];
        const currentIndex = modes.indexOf(effectiveViewMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        handleViewModeChange(modes[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [effectiveViewMode, isSmallScreen, handleViewModeChange]);

  // Show device/color controls when preview is visible
  const showPreviewControls = effectiveViewMode !== "builder";

  // Prevent hydration mismatch by not rendering until client-side
  if (!isHydrated) {
    return (
      <>
        <EditorHeader page={page} siteId={siteId} />
        <div className="flex-1 overflow-auto">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <SectionsList
              sections={sections}
              pageId={page.id}
              siteId={siteId}
            />
            <div className="mt-6 flex justify-center gap-3">
              <LayoutSuggestionModal pageId={page.id} siteId={siteId} />
              <BlockPicker pageId={page.id} siteId={siteId} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <EditorSelectionProvider>
      <EditorHeader
        page={page}
        siteId={siteId}
        viewMode={effectiveViewMode}
        onViewModeChange={handleViewModeChange}
        device={device}
        onDeviceChange={setDevice}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        showPreviewControls={showPreviewControls}
        disableSplit={isSmallScreen}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        {effectiveViewMode !== "preview" && (
          <div
            className={cn(
              "overflow-auto",
              effectiveViewMode === "split" ? "w-[40%] border-r" : "w-full"
            )}
          >
            <div className="container max-w-4xl mx-auto px-4 py-8">
              <SectionsList
                sections={sections}
                pageId={page.id}
                siteId={siteId}
              />
              <div className="mt-6 flex justify-center gap-3">
                <LayoutSuggestionModal pageId={page.id} siteId={siteId} />
                <BlockPicker pageId={page.id} siteId={siteId} />
              </div>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {effectiveViewMode !== "builder" && (
          <div
            className={cn(
              "overflow-hidden",
              effectiveViewMode === "split" ? "w-[60%]" : "w-full"
            )}
          >
            <PreviewFrame
              sections={previewSections}
              theme={theme}
              siteHeader={siteHeader}
              siteFooter={siteFooter}
              device={device}
              colorMode={colorMode}
              hideControls
            />
          </div>
        )}
      </div>
    </EditorSelectionProvider>
  );
}
