"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

interface EditorSelectionContextValue {
  // State
  hoveredSectionId: string | null;
  selectedSectionId: string | null;

  // Actions
  setHoveredSectionId: (id: string | null) => void;
  setSelectedSectionId: (id: string | null) => void;

  // Ref registration for scroll sync
  registerEditorSection: (id: string, element: HTMLElement | null) => void;
  registerPreviewSection: (id: string, element: HTMLElement | null) => void;
}

const EditorSelectionContext =
  createContext<EditorSelectionContextValue | null>(null);

export function EditorSelectionProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  // Ref maps for scroll synchronization
  const editorRefs = useRef<Map<string, HTMLElement>>(new Map());
  const previewRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerEditorSection = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        editorRefs.current.set(id, element);
      } else {
        editorRefs.current.delete(id);
      }
    },
    []
  );

  const registerPreviewSection = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        previewRefs.current.set(id, element);
      } else {
        previewRefs.current.delete(id);
      }
    },
    []
  );

  // Scroll both panels when selection changes
  useEffect(() => {
    if (!selectedSectionId) return;

    const editorEl = editorRefs.current.get(selectedSectionId);
    const previewEl = previewRefs.current.get(selectedSectionId);

    // Small delay to allow expansion animation to start
    const timer = setTimeout(() => {
      editorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      previewEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedSectionId]);

  return (
    <EditorSelectionContext.Provider
      value={{
        hoveredSectionId,
        selectedSectionId,
        setHoveredSectionId,
        setSelectedSectionId,
        registerEditorSection,
        registerPreviewSection,
      }}
    >
      {children}
    </EditorSelectionContext.Provider>
  );
}

/**
 * Hook to access editor selection state.
 * Returns no-op implementation when used outside EditorSelectionProvider,
 * allowing components to work in non-editor contexts.
 */
export function useEditorSelection(): EditorSelectionContextValue {
  const context = useContext(EditorSelectionContext);

  // Graceful fallback for non-editor contexts
  if (!context) {
    return {
      hoveredSectionId: null,
      selectedSectionId: null,
      setHoveredSectionId: () => {},
      setSelectedSectionId: () => {},
      registerEditorSection: () => {},
      registerPreviewSection: () => {},
    };
  }

  return context;
}
