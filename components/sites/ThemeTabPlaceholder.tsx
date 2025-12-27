import { Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ThemeTabPlaceholder() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Palette className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Theme Customization</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Customize your site&apos;s colors, fonts, and visual style. This feature
          is coming soon.
        </p>
      </CardContent>
    </Card>
  );
}
