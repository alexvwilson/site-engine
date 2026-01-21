"use client";

import { useState, useEffect, useCallback } from "react";
import type { BlockType } from "@/lib/drizzle/schema/sections";

const FAVORITES_KEY = "blockpicker-favorites";
const RECENT_KEY = "blockpicker-recent";
const MAX_RECENT = 5;

interface BlockPickerStorage {
  favorites: BlockType[];
  recent: BlockType[];
  toggleFavorite: (blockType: BlockType) => void;
  addRecent: (blockType: BlockType) => void;
  isFavorite: (blockType: BlockType) => boolean;
}

/**
 * Custom hook for managing BlockPicker favorites and recently used blocks.
 * Data is persisted to localStorage for cross-session persistence.
 */
export function useBlockPickerStorage(): BlockPickerStorage {
  const [favorites, setFavorites] = useState<BlockType[]>([]);
  const [recent, setRecent] = useState<BlockType[]>([]);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      const storedRecent = localStorage.getItem(RECENT_KEY);
      if (storedRecent) {
        setRecent(JSON.parse(storedRecent));
      }
    } catch {
      // localStorage not available (SSR or private browsing)
    }
  }, []);

  const toggleFavorite = useCallback((blockType: BlockType): void => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(blockType)
        ? prev.filter((t) => t !== blockType)
        : [...prev, blockType];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      } catch {
        // Ignore localStorage errors
      }
      return newFavorites;
    });
  }, []);

  const addRecent = useCallback((blockType: BlockType): void => {
    setRecent((prev) => {
      // Remove if already in list, add to front, limit to MAX_RECENT
      const filtered = prev.filter((t) => t !== blockType);
      const newRecent = [blockType, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
      } catch {
        // Ignore localStorage errors
      }
      return newRecent;
    });
  }, []);

  const isFavorite = useCallback(
    (blockType: BlockType): boolean => favorites.includes(blockType),
    [favorites]
  );

  return { favorites, recent, toggleFavorite, addRecent, isFavorite };
}
