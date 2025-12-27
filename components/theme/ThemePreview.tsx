"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";

interface ThemePreviewProps {
  theme: ThemeData;
  showRationale?: boolean;
}

export function ThemePreview({ theme, showRationale = false }: ThemePreviewProps) {
  const { colors, typography, components } = theme;

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div>
        <h4 className="text-sm font-medium mb-3">Color Palette</h4>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          <ColorSwatch color={colors.primary} label="Primary" />
          <ColorSwatch color={colors.secondary} label="Secondary" />
          <ColorSwatch color={colors.accent} label="Accent" />
          <ColorSwatch color={colors.background} label="Background" />
          <ColorSwatch color={colors.foreground} label="Text" />
          <ColorSwatch color={colors.muted} label="Muted" />
          <ColorSwatch color={colors.mutedForeground} label="Muted Text" />
          <ColorSwatch color={colors.border} label="Border" />
        </div>
        {showRationale && colors.rationale && (
          <p className="text-xs text-muted-foreground mt-2">{colors.rationale}</p>
        )}
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-medium mb-3">Typography</h4>
        <div className="space-y-2 p-4 rounded-lg border bg-card">
          <p
            className="font-semibold"
            style={{
              fontFamily: typography.headingFont.family,
              fontSize: typography.scale.h3,
              lineHeight: typography.lineHeights.tight,
              color: colors.foreground,
            }}
          >
            {typography.headingFont.family}
          </p>
          <p
            style={{
              fontFamily: typography.bodyFont.family,
              fontSize: typography.scale.body,
              lineHeight: typography.lineHeights.normal,
              color: colors.foreground,
            }}
          >
            Body text in {typography.bodyFont.family}. The quick brown fox jumps over the lazy dog.
          </p>
          <p
            style={{
              fontFamily: typography.bodyFont.family,
              fontSize: typography.scale.small,
              color: colors.mutedForeground,
            }}
          >
            Small text sample for captions and metadata.
          </p>
        </div>
        {showRationale && typography.rationale && (
          <p className="text-xs text-muted-foreground mt-2">{typography.rationale}</p>
        )}
      </div>

      {/* Component Samples */}
      <div>
        <h4 className="text-sm font-medium mb-3">Components</h4>
        <div
          className="p-4 rounded-lg border space-y-4"
          style={{ backgroundColor: colors.background }}
        >
          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              style={{
                backgroundColor: colors.primary,
                color: "#FFFFFF",
                borderRadius: components.button.borderRadius,
              }}
            >
              Primary
            </Button>
            <Button
              variant="outline"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: components.button.borderRadius,
              }}
            >
              Outline
            </Button>
            <Button
              variant="ghost"
              style={{
                color: colors.foreground,
                borderRadius: components.button.borderRadius,
              }}
            >
              Ghost
            </Button>
          </div>

          {/* Input */}
          <Input
            placeholder="Sample input field"
            style={{
              borderColor: colors.border,
              borderRadius: components.input.borderRadius,
            }}
          />

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              style={{
                backgroundColor: colors.primary,
                color: "#FFFFFF",
                borderRadius: components.badge.borderRadius,
              }}
            >
              Badge
            </Badge>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: colors.secondary,
                color: "#FFFFFF",
                borderRadius: components.badge.borderRadius,
              }}
            >
              Secondary
            </Badge>
            <Badge
              variant="outline"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
                borderRadius: components.badge.borderRadius,
              }}
            >
              Outline
            </Badge>
          </div>

          {/* Sample Card */}
          <Card
            style={{
              borderRadius: components.card.borderRadius,
              boxShadow: components.card.shadow,
              borderColor: colors.border,
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle
                className="text-base"
                style={{
                  fontFamily: typography.headingFont.family,
                  color: colors.foreground,
                }}
              >
                Sample Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-sm"
                style={{
                  fontFamily: typography.bodyFont.family,
                  color: colors.mutedForeground,
                }}
              >
                This is how cards will look with your theme applied.
              </p>
            </CardContent>
          </Card>
        </div>
        {showRationale && components.rationale && (
          <p className="text-xs text-muted-foreground mt-2">{components.rationale}</p>
        )}
      </div>
    </div>
  );
}

interface ColorSwatchProps {
  color: string;
  label: string;
}

function ColorSwatch({ color, label }: ColorSwatchProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-md border shadow-sm"
        style={{ backgroundColor: color }}
        title={`${label}: ${color}`}
      />
      <span className="text-[10px] text-muted-foreground truncate w-full text-center">
        {label}
      </span>
    </div>
  );
}
