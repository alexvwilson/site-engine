"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sparkles, Eye } from "lucide-react";
import { ThemePreview } from "./ThemePreview";
import { SavedThemesList } from "./SavedThemesList";
import { ThemeGeneratorModal } from "./ThemeGeneratorModal";
import type { Theme } from "@/lib/drizzle/schema/themes";
import type { Site } from "@/lib/drizzle/schema/sites";

interface ThemeTabProps {
  site: Site;
  themes: Theme[];
  activeTheme: Theme | null;
}

export function ThemeTab({ site, themes, activeTheme }: ThemeTabProps) {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Active Theme Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Current Theme</CardTitle>
            <Button onClick={() => setIsGeneratorOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate New Theme
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTheme ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{activeTheme.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {activeTheme.generation_job_id
                      ? "AI Generated"
                      : "Manually Created"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleThemeSelect(activeTheme)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>

              {/* Quick Color Preview */}
              <div className="flex gap-1 h-8">
                {[
                  activeTheme.data.colors.primary,
                  activeTheme.data.colors.secondary,
                  activeTheme.data.colors.accent,
                  activeTheme.data.colors.background,
                  activeTheme.data.colors.foreground,
                  activeTheme.data.colors.muted,
                  activeTheme.data.colors.border,
                ].map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 first:rounded-l-md last:rounded-r-md"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Typography Info */}
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Fonts:</span>{" "}
                {activeTheme.data.typography.headingFont.family} /{" "}
                {activeTheme.data.typography.bodyFont.family}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-2">No Active Theme</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your first theme to customize your site&apos;s appearance.
              </p>
              <Button onClick={() => setIsGeneratorOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Theme
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Themes Section */}
      <div>
        <h3 className="font-medium mb-3">
          Saved Themes ({themes.length})
        </h3>
        <SavedThemesList themes={themes} onThemeSelect={handleThemeSelect} />
      </div>

      {/* Theme Generator Modal */}
      <ThemeGeneratorModal
        open={isGeneratorOpen}
        onOpenChange={setIsGeneratorOpen}
        siteId={site.id}
        siteName={site.name}
        onThemeGenerated={() => {
          // The page will revalidate via server action
        }}
      />

      {/* Theme Preview Sheet */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedTheme?.name}</SheetTitle>
            <SheetDescription>
              {selectedTheme?.generation_job_id
                ? "AI Generated Theme"
                : "Custom Theme"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedTheme && (
              <ThemePreview theme={selectedTheme.data} showRationale />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
