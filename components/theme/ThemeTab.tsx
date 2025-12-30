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
import { Sparkles, Eye, Pencil } from "lucide-react";
import { ThemePreview } from "./ThemePreview";
import { ThemeEditor } from "./ThemeEditor";
import { SavedThemesList } from "./SavedThemesList";
import { ThemeGeneratorModal } from "./ThemeGeneratorModal";
import { LogoBrandingCard } from "./LogoBrandingCard";
import { LogoGeneratorModal } from "./LogoGeneratorModal";
import type { Theme } from "@/lib/drizzle/schema/themes";
import type { Site } from "@/lib/drizzle/schema/sites";
import type { HeaderContent } from "@/lib/section-types";

interface ThemeTabProps {
  site: Site;
  themes: Theme[];
  activeTheme: Theme | null;
}

export function ThemeTab({ site, themes, activeTheme }: ThemeTabProps) {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isLogoGeneratorOpen, setIsLogoGeneratorOpen] = useState(false);
  const [viewingLogoJobId, setViewingLogoJobId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  // Get header content for logo display
  const headerContent = site.header_content as HeaderContent | null;

  const handleViewPastLogoJob = (jobId: string) => {
    setViewingLogoJobId(jobId);
    setIsLogoGeneratorOpen(true);
  };

  const handleLogoModalClose = (open: boolean) => {
    setIsLogoGeneratorOpen(open);
    if (!open) {
      setViewingLogoJobId(null);
    }
  };

  const handleThemeSelect = (theme: Theme): void => {
    setEditingTheme(null);
    setSelectedTheme(theme);
    setIsPreviewOpen(true);
  };

  const handleThemeEdit = (theme: Theme): void => {
    setSelectedTheme(theme);
    setEditingTheme(theme);
    setIsPreviewOpen(true);
  };

  const handleEditSave = (): void => {
    setEditingTheme(null);
    setIsPreviewOpen(false);
  };

  const handleEditCancel = (): void => {
    setEditingTheme(null);
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleThemeEdit(activeTheme)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleThemeSelect(activeTheme)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
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

      {/* Logo & Branding Section */}
      <LogoBrandingCard
        site={site}
        headerContent={headerContent}
        onGenerateClick={() => setIsLogoGeneratorOpen(true)}
        onViewPastJob={handleViewPastLogoJob}
      />

      {/* Saved Themes Section */}
      <div>
        <h3 className="font-medium mb-3">
          Saved Themes ({themes.length})
        </h3>
        <SavedThemesList
          themes={themes}
          onThemeSelect={handleThemeSelect}
          onEdit={handleThemeEdit}
        />
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

      {/* Logo Generator Modal */}
      <LogoGeneratorModal
        open={isLogoGeneratorOpen}
        onOpenChange={handleLogoModalClose}
        site={site}
        primaryColor={activeTheme?.data.colors.primary}
        initialJobId={viewingLogoJobId}
      />

      {/* Theme Preview/Edit Sheet */}
      <Sheet
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) {
            setEditingTheme(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-xl flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>
              {editingTheme ? `Edit: ${selectedTheme?.name}` : selectedTheme?.name}
            </SheetTitle>
            <SheetDescription>
              {editingTheme
                ? "Customize colors, fonts, and component styles"
                : selectedTheme?.generation_job_id
                  ? "AI Generated Theme"
                  : "Custom Theme"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex-1 overflow-hidden">
            {editingTheme ? (
              <ThemeEditor
                themeId={editingTheme.id}
                initialData={editingTheme.data}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
              />
            ) : selectedTheme ? (
              <div className="overflow-y-auto h-full pr-2">
                <ThemePreview theme={selectedTheme.data} showRationale />
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
