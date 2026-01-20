"use client";

import { useState } from "react";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeaderContent, FooterContent } from "@/lib/section-types";
import { PreviewBlockRenderer } from "@/components/render/PreviewBlockRenderer";
import { HeaderBlock } from "@/components/render/blocks/HeaderBlock";
import { FooterBlock } from "@/components/render/blocks/FooterBlock";
import { DeviceToggle, type DeviceType } from "./DeviceToggle";
import { ColorModePreviewToggle, type PreviewColorMode } from "./ColorModePreviewToggle";
import { generateDefaultDarkPalette } from "@/lib/theme-utils";
import { DEFAULT_THEME } from "@/lib/default-theme";
import { cn } from "@/lib/utils";

const DEVICE_WIDTHS: Record<DeviceType, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

interface PreviewFrameProps {
  sections: Section[];
  theme: ThemeData | null;
  siteHeader?: HeaderContent | null;
  siteFooter?: FooterContent | null;
  /** External device control - when provided, internal state is bypassed */
  device?: DeviceType;
  /** External color mode control - when provided, internal state is bypassed */
  colorMode?: PreviewColorMode;
  /** Hide the internal device/color toggle controls (use when externally controlled) */
  hideControls?: boolean;
}

/**
 * Generates scoped CSS variables for the preview container.
 * Uses unique class selectors to avoid conflicts with admin app styles.
 */
function PreviewThemeStyles({
  theme,
  colorMode
}: {
  theme: ThemeData;
  colorMode: PreviewColorMode;
}): React.ReactElement {
  const lightColors = theme.colors;
  const darkColors = theme.darkColors || generateDefaultDarkPalette(lightColors);
  const colors = colorMode === "dark" ? darkColors : lightColors;

  const css = `
    .preview-container {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --color-foreground: ${colors.foreground};
      --color-muted: ${colors.muted};
      --color-muted-foreground: ${colors.mutedForeground};
      --color-border: ${colors.border};
      --font-heading: "${theme.typography.headingFont.family}", sans-serif;
      --font-body: "${theme.typography.bodyFont.family}", sans-serif;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export function PreviewFrame({
  sections,
  theme,
  siteHeader,
  siteFooter,
  device: externalDevice,
  colorMode: externalColorMode,
  hideControls = false,
}: PreviewFrameProps) {
  // Internal state as fallback when not externally controlled
  const [internalDevice, setInternalDevice] = useState<DeviceType>("desktop");
  const [internalColorMode, setInternalColorMode] =
    useState<PreviewColorMode>("light");

  // Use external values if provided, otherwise use internal state
  const device = externalDevice ?? internalDevice;
  const colorMode = externalColorMode ?? internalColorMode;

  // Use DEFAULT_THEME for header/footer rendering if no theme
  const renderTheme = theme ?? DEFAULT_THEME;

  if (!theme) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">No Active Theme</h3>
          <p className="text-muted-foreground mt-1">
            Generate a theme first to preview your page with styling applied.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PreviewThemeStyles theme={theme} colorMode={colorMode} />

      {!hideControls && (
        <div className="flex justify-center gap-4 py-4 border-b bg-background">
          <DeviceToggle device={device} onChange={setInternalDevice} />
          <ColorModePreviewToggle
            colorMode={colorMode}
            onChange={setInternalColorMode}
          />
        </div>
      )}

      <div className="flex-1 flex justify-center overflow-auto p-4 bg-muted/30">
        <div
          className={cn(
            "preview-container shadow-lg transition-all duration-300 overflow-auto",
            device !== "desktop" && "border rounded-lg"
          )}
          style={{
            width: DEVICE_WIDTHS[device],
            maxWidth: "100%",
            minHeight: device === "desktop" ? "100%" : "auto",
            backgroundColor: "var(--color-background)",
          }}
        >
          {siteHeader && <HeaderBlock content={siteHeader} theme={renderTheme} />}
          {sections.map((section) => (
            <PreviewBlockRenderer
              key={section.id}
              section={section}
              theme={theme}
            />
          ))}
          {siteFooter && <FooterBlock content={siteFooter} theme={renderTheme} />}
        </div>
      </div>
    </div>
  );
}
