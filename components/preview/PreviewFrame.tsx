"use client";

import { useState } from "react";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeaderContent, FooterContent } from "@/lib/section-types";
import { PageRenderer } from "@/components/render/PageRenderer";
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
}: PreviewFrameProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [colorMode, setColorMode] = useState<PreviewColorMode>("light");

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

      <div className="flex justify-center gap-4 py-4 border-b bg-background">
        <DeviceToggle device={device} onChange={setDevice} />
        <ColorModePreviewToggle colorMode={colorMode} onChange={setColorMode} />
      </div>

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
          <PageRenderer sections={sections} theme={theme} />
          {siteFooter && <FooterBlock content={siteFooter} theme={renderTheme} />}
        </div>
      </div>
    </div>
  );
}
