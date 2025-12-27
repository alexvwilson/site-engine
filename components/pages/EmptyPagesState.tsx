import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyPagesStateProps {
  onCreateClick: () => void;
}

export function EmptyPagesState({ onCreateClick }: EmptyPagesStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Start building your site by creating your first page. It will
          automatically become your homepage.
        </p>
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create First Page
        </Button>
      </CardContent>
    </Card>
  );
}
