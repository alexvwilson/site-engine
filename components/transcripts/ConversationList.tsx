"use client";

import { type TranscriptConversation } from "@/lib/drizzle/schema";
import { cn } from "@/lib/utils";
import { MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteTranscriptConversation } from "@/app/actions/transcript-qa";
import { toast } from "sonner";

interface ConversationListProps {
  conversations: TranscriptConversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  transcriptId: string;
  onDelete?: () => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  transcriptId,
  onDelete,
}: ConversationListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] =
    useState<TranscriptConversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (
    e: React.MouseEvent,
    conversation: TranscriptConversation,
  ) => {
    e.stopPropagation();
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;

    setIsDeleting(true);
    const result = await deleteTranscriptConversation(
      conversationToDelete.id,
      transcriptId,
    );
    setIsDeleting(false);

    if (result.success) {
      toast.success("Conversation deleted");
      setDeleteDialogOpen(false);
      setConversationToDelete(null);

      if (activeConversationId === conversationToDelete.id) {
        onSelect("");
      }

      onDelete?.();
    } else {
      toast.error(result.error || "Failed to delete conversation");
    }
  };

  if (conversations.length === 0) {
    return null;
  }

  if (conversations.length === 1) {
    return null;
  }

  return (
    <>
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-base">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="relative group">
              <button
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "w-full text-left p-4 pr-10 border-b hover:bg-muted transition-colors",
                  activeConversationId === conversation.id && "bg-muted",
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium truncate">
                      {conversation.title || "Untitled Conversation"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDeleteClick(e, conversation)}
                aria-label={`Delete conversation: ${conversation.title || "Untitled Conversation"}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;
              {conversationToDelete?.title || "Untitled Conversation"}
              &rdquo;? This will permanently delete the conversation and all
              its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
