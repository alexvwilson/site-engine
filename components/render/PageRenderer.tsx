import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { SocialLink, SocialIconStyle, ImageFit } from "@/lib/section-types";
import { BlockRenderer } from "./BlockRenderer";
import { getPageStyles } from "./utilities/theme-styles";

interface PageRendererProps {
  sections: Section[];
  theme: ThemeData;
  siteId?: string;
  basePath?: string;
  pageId?: string;
  socialLinks?: SocialLink[];
  socialIconStyle?: SocialIconStyle;
  imageFit?: ImageFit;
}

export async function PageRenderer({
  sections,
  theme,
  siteId,
  basePath = "",
  pageId,
  socialLinks = [],
  socialIconStyle = "brand",
  imageFit = "cover",
}: PageRendererProps) {
  if (sections.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={getPageStyles(theme)}
      >
        <p style={{ color: "var(--color-muted-foreground)" }}>
          No sections added yet. Go back to the editor to add content.
        </p>
      </div>
    );
  }

  return (
    <div style={getPageStyles(theme)}>
      {sections.map((section) => (
        <BlockRenderer
          key={section.id}
          section={section}
          theme={theme}
          siteId={siteId}
          basePath={basePath}
          pageId={pageId}
          socialLinks={socialLinks}
          socialIconStyle={socialIconStyle}
          imageFit={imageFit}
        />
      ))}
    </div>
  );
}
