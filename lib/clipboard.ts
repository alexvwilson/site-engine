/**
 * Clipboard Utilities
 *
 * Client-safe utilities for clipboard operations.
 * Uses browser Clipboard API with proper error handling.
 *
 * This file is client-safe and can be imported by client components.
 */

/**
 * Result of clipboard operation
 */
export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Copy text to clipboard using Clipboard API
 * Handles permissions errors gracefully
 *
 * @param text - Text to copy to clipboard
 * @returns Result object with success status and optional error message
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    // Check if Clipboard API is available
    if (!navigator.clipboard) {
      return {
        success: false,
        error: "Clipboard API not supported in this browser",
      };
    }

    // Attempt to write to clipboard
    await navigator.clipboard.writeText(text);

    return { success: true };
  } catch (error) {
    console.error("Clipboard copy failed:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        return {
          success: false,
          error: "Clipboard access denied. Please allow clipboard permissions.",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to copy to clipboard",
    };
  }
}

/**
 * Format text for clipboard with optional prefix/suffix
 * Useful for adding context to copied content
 *
 * @param text - Main text content
 * @param options - Optional prefix and suffix
 * @returns Formatted text
 */
export function formatForClipboard(
  text: string,
  options?: {
    prefix?: string;
    suffix?: string;
  },
): string {
  const parts: string[] = [];

  if (options?.prefix) {
    parts.push(options.prefix);
  }

  parts.push(text);

  if (options?.suffix) {
    parts.push(options.suffix);
  }

  return parts.join("\n\n");
}

/**
 * Format array items as bullet list for clipboard
 * Converts array of strings to markdown-style bullet list
 *
 * @param items - Array of text items
 * @returns Formatted bullet list string
 */
export function formatAsBulletList(items: string[]): string {
  return items.map((item) => `• ${item}`).join("\n");
}

/**
 * Format hashtags for clipboard
 * Ensures proper hashtag formatting and spacing
 *
 * @param tags - Array of tag strings (with or without # prefix)
 * @returns Space-separated hashtags
 */
export function formatHashtags(tags: string[]): string {
  return tags
    .map((tag) => {
      const cleanTag = tag.trim();
      return cleanTag.startsWith("#") ? cleanTag : `#${cleanTag}`;
    })
    .join(" ");
}
