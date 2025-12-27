"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { SaveStatus } from "@/components/editor/SaveIndicator";

interface UseAutoSaveOptions<T> {
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
}

interface UseAutoSaveReturn<T> {
  saveStatus: SaveStatus;
  triggerSave: (data: T) => void;
  retry: () => void;
}

export function useAutoSave<T>({
  onSave,
  debounceMs = 500,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn<T> {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const lastSavedDataRef = useRef<string | null>(null);

  const save = useCallback(
    async (data: T): Promise<void> => {
      const dataString = JSON.stringify(data);

      // Skip if data hasn't changed since last save
      if (dataString === lastSavedDataRef.current) {
        return;
      }

      setSaveStatus("saving");

      try {
        await onSave(data);
        lastSavedDataRef.current = dataString;
        setSaveStatus("saved");

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus((current) => (current === "saved" ? "idle" : current));
        }, 2000);
      } catch (error) {
        console.error("Auto-save error:", error);
        setSaveStatus("error");
        pendingDataRef.current = data;
      }
    },
    [onSave]
  );

  const triggerSave = useCallback(
    (data: T): void => {
      pendingDataRef.current = data;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new debounced save
      timeoutRef.current = setTimeout(() => {
        save(data);
      }, debounceMs);
    },
    [save, debounceMs]
  );

  const retry = useCallback((): void => {
    if (pendingDataRef.current) {
      save(pendingDataRef.current);
    }
  }, [save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    triggerSave,
    retry,
  };
}
