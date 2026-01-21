"use client";

import { useState, useEffect, useCallback } from "react";
import type { Page } from "@/lib/drizzle/schema/pages";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeaderContent, FooterContent } from "@/lib/section-types";
import {
  EditorSelectionProvider,
  useEditorSelection,
} from "@/contexts/EditorSelectionContext";
import { EditorHeader } from "./EditorHeader";
import { SectionsList } from "./SectionsList";
import { BlockPicker } from "./BlockPicker";
import { LayoutSuggestionModal } from "./LayoutSuggestionModal";
import { InspectorPanel } from "./InspectorPanel";
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
      <EditorLayoutContent
        page={page}
        siteId={siteId}
        sections={sections}
        previewSections={previewSections}
        theme={theme}
        siteHeader={siteHeader}
        siteFooter={siteFooter}
        effectiveViewMode={effectiveViewMode}
        handleViewModeChange={handleViewModeChange}
        device={device}
        setDevice={setDevice}
        colorMode={colorMode}
        setColorMode={setColorMode}
        showPreviewControls={showPreviewControls}
        isSmallScreen={isSmallScreen}
      />
    </EditorSelectionProvider>
  );
}

interface EditorLayoutContentProps {
  page: Page;
  siteId: string;
  sections: Section[];
  previewSections: Section[];
  theme: ThemeData | null;
  siteHeader: HeaderContent | null;
  siteFooter: FooterContent | null;
  effectiveViewMode: ViewMode;
  handleViewModeChange: (mode: ViewMode) => void;
  device: DeviceType;
  setDevice: (device: DeviceType) => void;
  colorMode: PreviewColorMode;
  setColorMode: (mode: PreviewColorMode) => void;
  showPreviewControls: boolean;
  isSmallScreen: boolean;
}

function EditorLayoutContent({
  page,
  siteId,
  sections,
  previewSections,
  theme,
  siteHeader,
  siteFooter,
  effectiveViewMode,
  handleViewModeChange,
  device,
  setDevice,
  colorMode,
  setColorMode,
  showPreviewControls,
  isSmallScreen,
}: EditorLayoutContentProps): React.ReactElement {
  const { selectedSectionId, setSelectedSectionId } = useEditorSelection();

  // Find the selected section
  const selectedSection = selectedSectionId
    ? sections.find((s) => s.id === selectedSectionId) ?? null
    : null;

  // Show inspector only in split mode with a selection
  const showInspector =
    effectiveViewMode === "split" && selectedSectionId !== null;

  return (
    <>
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
        {/* Section List Panel */}
        {effectiveViewMode !== "preview" && (
          <div
            className={cn(
              "overflow-auto border-r",
              effectiveViewMode === "builder" && "w-full border-r-0",
              effectiveViewMode === "split" && !showInspector && "w-[40%]",
              effectiveViewMode === "split" && showInspector && "w-[25%]"
            )}
          >
            <div
              className={cn(
                "px-4 py-6",
                !showInspector && "container max-w-4xl mx-auto"
              )}
            >
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
              effectiveViewMode === "preview" && "w-full",
              effectiveViewMode === "split" && !showInspector && "w-[60%]",
              effectiveViewMode === "split" && showInspector && "w-[50%]"
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

        {/* Inspector Panel */}
        {showInspector && (
          <div className="w-[25%] border-l overflow-hidden h-full">
            <InspectorPanel
              section={selectedSection}
              siteId={siteId}
              onClose={() => setSelectedSectionId(null)}
            />
          </div>
        )}
      </div>
    </>
  );
}
