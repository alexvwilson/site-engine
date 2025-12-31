"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

/**
 * Toggle button for light/dark mode.
 * Only rendered when site's colorMode is "user_choice".
 * Persists preference to localStorage.
 */
export function ColorModeToggle(): React.ReactElement {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Sync color mode with localStorage on mount AND on every navigation
  // This fixes persistence across client-side navigation in Next.js App Router
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("site-color-mode");

    // Always sync the class with localStorage on mount/navigation
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      // No preference stored yet - check current DOM state
      const hasDarkClass = document.documentElement.classList.contains("dark");
      setIsDark(hasDarkClass);
    }
  }, [pathname]); // Re-run on navigation

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
