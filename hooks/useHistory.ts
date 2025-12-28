"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseHistoryOptions<T> {
  initialState: T;
  storageKey?: string;
  maxHistory?: number;
}

interface UseHistoryReturn<T> {
  state: T;
  set: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

export function useHistory<T>({
  initialState,
  storageKey,
  maxHistory = 50,
}: UseHistoryOptions<T>): UseHistoryReturn<T> {
  // Initialize: always use initialState (from database) as present
  // Only restore past/future from localStorage if present matches
  const [history, setHistory] = useState<HistoryState<T>>(() => {
    if (typeof window === "undefined" || !storageKey) {
      return { past: [], present: initialState, future: [] };
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryState<T>;
        if (
          Array.isArray(parsed.past) &&
          parsed.present !== undefined &&
          Array.isArray(parsed.future)
        ) {
          // Only restore history if stored present matches current database state
          // Otherwise the history is stale and should be discarded
          const storedPresentStr = JSON.stringify(parsed.present);
          const initialStateStr = JSON.stringify(initialState);

          if (storedPresentStr === initialStateStr) {
            // History is valid - restore past/future
            return parsed;
          }
          // History is stale - start fresh with database content
          // Clear the stale localStorage entry
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      // Invalid stored data, use initial
    }

    return { past: [], present: initialState, future: [] };
  });

  // Track the last committed state to avoid duplicate history entries
  const lastCommittedRef = useRef<string>(JSON.stringify(initialState));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set new state with debounced history entry
  const set = useCallback(
    (newState: T) => {
      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Immediately update present for responsive UI, clear future
      setHistory((h) => ({ ...h, present: newState, future: [] }));

      // Debounce the history commit (300ms pause before adding to past)
      debounceRef.current = setTimeout(() => {
        const newStateString = JSON.stringify(newState);

        // Skip if state hasn't changed from last commit
        if (newStateString === lastCommittedRef.current) {
          return;
        }

        setHistory((h) => {
          // Add previous present to past
          const newPast = [...h.past, JSON.parse(lastCommittedRef.current) as T];
          // Trim to max history
          const trimmedPast = newPast.slice(-maxHistory);

          lastCommittedRef.current = newStateString;

          return {
            past: trimmedPast,
            present: h.present,
            future: [],
          };
        });
      }, 300);
    },
    [maxHistory]
  );

  // Undo - go back one step
  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;

      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);

      // Update the committed ref to the restored state
      lastCommittedRef.current = JSON.stringify(previous);

      return {
        past: newPast,
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  // Redo - go forward one step
  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;

      const next = h.future[0];
      const newFuture = h.future.slice(1);

      // Update the committed ref to the restored state
      lastCommittedRef.current = JSON.stringify(next);

      return {
        past: [...h.past, h.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Clear all history
  const clear = useCallback(() => {
    setHistory((h) => ({
      past: [],
      present: h.present,
      future: [],
    }));
    lastCommittedRef.current = JSON.stringify(history.present);
  }, [history.present]);

  // Persist to localStorage on changes
  useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch {
      // localStorage quota exceeded - could implement LRU cleanup here
      console.warn("localStorage quota exceeded for history");
    }
  }, [history, storageKey]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clear,
  };
}
