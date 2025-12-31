/**
 * Anchor ID validation and utilities for same-page navigation
 */

const ANCHOR_ID_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{0,49}$/;

export function isValidAnchorId(id: string): boolean {
  if (!id || id.trim() === "") return true;
  return ANCHOR_ID_REGEX.test(id);
}

export function getAnchorIdError(id: string): string | null {
  if (!id || id.trim() === "") return null;

  if (id.length > 50) {
    return "Anchor ID must be 50 characters or less";
  }
  if (!/^[a-zA-Z]/.test(id)) {
    return "Anchor ID must start with a letter";
  }
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    return "Anchor ID can only contain letters, numbers, and hyphens";
  }
  return null;
}
