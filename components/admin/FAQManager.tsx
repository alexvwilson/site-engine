"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";
import {
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
  toggleFaqActive,
} from "@/app/actions/landing-content";
import type { LandingFaq } from "@/lib/drizzle/schema/landing-content";

interface FAQManagerProps {
  initialFaqs: LandingFaq[];
}

export function FAQManager({ initialFaqs }: FAQManagerProps) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [editingFaq, setEditingFaq] = useState<LandingFaq | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = faqs.findIndex((f) => f.id === active.id);
    const newIndex = faqs.findIndex((f) => f.id === over.id);
    const newOrder = arrayMove(faqs, oldIndex, newIndex);

    setFaqs(newOrder);
    startTransition(async () => {
      await reorderFaqs(newOrder.map((f) => f.id));
    });
  }

  function handleOpenAdd() {
    setEditingFaq(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(faq: LandingFaq) {
    setEditingFaq(faq);
    setIsDialogOpen(true);
  }

  async function handleSave(data: { question: string; answer: string }) {
    if (editingFaq) {
      await updateFaq(editingFaq.id, data);
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === editingFaq.id ? { ...f, ...data } : f
        )
      );
    } else {
      await createFaq(data);
      // Refresh will happen via revalidatePath, but we can optimistically add
    }
    setIsDialogOpen(false);
  }

  async function handleToggle(id: string, isActive: boolean) {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_active: isActive } : f))
    );
    startTransition(async () => {
      await toggleFaqActive(id, isActive);
    });
  }

  async function handleDelete() {
    if (!deleteId) return;
    setFaqs((prev) => prev.filter((f) => f.id !== deleteId));
    await deleteFaq(deleteId);
    setDeleteId(null);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">FAQ Items</CardTitle>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add FAQ
          </Button>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No FAQ items yet. Add your first FAQ above.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={faqs.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <SortableFAQItem
                      key={faq.id}
                      faq={faq}
                      onEdit={() => handleOpenEdit(faq)}
                      onToggle={(active) => handleToggle(faq.id, active)}
                      onDelete={() => setDeleteId(faq.id)}
                      disabled={isPending}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <FAQDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        faq={editingFaq}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this FAQ item. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================================
// Sortable FAQ Item
// ============================================================================

function SortableFAQItem({
  faq,
  onEdit,
  onToggle,
  onDelete,
  disabled,
}: {
  faq: LandingFaq;
  onEdit: () => void;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
        disabled={disabled}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{faq.question}</p>
        <p className="text-sm text-muted-foreground truncate">{faq.answer}</p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={faq.is_active}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          disabled={disabled}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// FAQ Dialog (Add/Edit)
// ============================================================================

function FAQDialog({
  open,
  onOpenChange,
  faq,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: LandingFaq | null;
  onSave: (data: { question: string; answer: string }) => Promise<void>;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setQuestion(faq?.question ?? "");
      setAnswer(faq?.answer ?? "");
    }
    onOpenChange(open);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setIsSaving(true);
    await onSave({ question: question.trim(), answer: answer.trim() });
    setIsSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{faq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., How does AI theme generation work?"
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide a clear, helpful answer..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {faq ? "Save Changes" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
