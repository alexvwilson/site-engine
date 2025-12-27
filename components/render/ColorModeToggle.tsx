"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Toggle button for light/dark mode.
 * Only rendered when site's colorMode is "user_choice".
 * Persists preference to localStorage.
 */
export function ColorModeToggle(): React.ReactElement {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize state from localStorage/DOM on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("site-color-mode");
    const hasDarkClass = document.documentElement.classList.contains("dark");
    setIsDark(stored === "dark" || hasDarkClass);
  }, []);

  const toggleMode = (): void => {
    const newMode = !isDark;
    setIsDark(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("site-color-mode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
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
