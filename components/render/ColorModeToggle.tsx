"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

// Use useLayoutEffect on client, useEffect on server (for SSR compatibility)
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Toggle button for light/dark mode.
 * Only rendered when site's colorMode is "user_choice".
 * Persists preference to localStorage.
 */
export function ColorModeToggle(): React.ReactElement {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Sync color mode IMMEDIATELY before browser paints (useLayoutEffect)
  // This prevents flash of wrong color mode during navigation
  // Uses "site-dark" class to avoid conflict with next-themes "dark" class
  useIsomorphicLayoutEffect(() => {
    const stored = localStorage.getItem("site-color-mode");

    // Always sync the class with localStorage on mount/navigation
    if (stored === "dark") {
      document.documentElement.classList.add("site-dark");
      setIsDark(true);
    } else if (stored === "light") {
      document.documentElement.classList.remove("site-dark");
      setIsDark(false);
    } else {
      // No preference stored yet - check current DOM state
      const hasDarkClass = document.documentElement.classList.contains("site-dark");
      setIsDark(hasDarkClass);
    }
  }, [pathname]); // Re-run on navigation

  // Separate effect for mounted state (can use regular useEffect)
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMode = (): void => {
    const newMode = !isDark;
    setIsDark(newMode);

    if (newMode) {
      document.documentElement.classList.add("site-dark");
      localStorage.setItem("site-color-mode", "dark");
    } else {
      document.documentElement.classList.remove("site-dark");
      localStorage.setItem("site-color-mode", "light");
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 rounded-full transition-colors"
        style={{
          backgroundColor: "var(--color-muted)",
          color: "var(--color-foreground)",
        }}
        aria-label="Toggle color mode"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="p-2 rounded-full transition-colors hover:opacity-80"
      style={{
        backgroundColor: "var(--color-muted)",
        color: "var(--color-foreground)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
