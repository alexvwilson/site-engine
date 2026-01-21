"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/editor/ImageUpload";
import {
  StylingControls,
  CardBackgroundPanel,
} from "@/components/editor/StylingControls";
import type {
  TestimonialsContent,
  Testimonial,
} from "@/lib/section-types";

interface TestimonialsEditorProps {
  content: TestimonialsContent;
  onChange: (content: TestimonialsContent) => void;
  disabled?: boolean;
  siteId: string;
}

const DEFAULT_TESTIMONIAL: Testimonial = {
  quote: "This is an amazing product!",
  author: "Customer Name",
  role: "Job Title, Company",
  avatar: "",
};

export function TestimonialsEditor({
  content,
  onChange,
  disabled,
  siteId,
}: TestimonialsEditorProps) {
  const handleTestimonialChange = (
    index: number,
    field: keyof Testimonial,
    value: string
  ): void => {
    const newTestimonials = [...content.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    onChange({ ...content, testimonials: newTestimonials });
  };

  const handleAddTestimonial = (): void => {
    onChange({
      ...content,
      testimonials: [...content.testimonials, { ...DEFAULT_TESTIMONIAL }],
    });
  };

  const handleRemoveTestimonial = (index: number): void => {
    const newTestimonials = content.testimonials.filter((_, i) => i !== index);
    onChange({ ...content, testimonials: newTestimonials });
  };

  const updateField = <K extends keyof TestimonialsContent>(
    field: K,
    value: TestimonialsContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Testimonial List */}
      {content.testimonials.map((testimonial, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Testimonial {index + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveTestimonial(index)}
              disabled={disabled || content.testimonials.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove testimonial</span>
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`testimonial-${index}-quote`}>Quote</Label>
            <Textarea
              id={`testimonial-${index}-quote`}
              value={testimonial.quote}
              onChange={(e) =>
                handleTestimonialChange(index, "quote", e.target.value)
              }
              placeholder="What they said about your product or service"
              rows={3}
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`testimonial-${index}-author`}>Author Name</Label>
              <Input
                id={`testimonial-${index}-author`}
                value={testimonial.author}
                onChange={(e) =>
                  handleTestimonialChange(index, "author", e.target.value)
                }
                placeholder="Jane Smith"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`testimonial-${index}-role`}>Role/Title</Label>
              <Input
                id={`testimonial-${index}-role`}
                value={testimonial.role}
                onChange={(e) =>
                  handleTestimonialChange(index, "role", e.target.value)
                }
                placeholder="CEO, Example Corp"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Avatar (optional)</Label>
            <ImageUpload
              value={testimonial.avatar ?? ""}
              onChange={(url) => handleTestimonialChange(index, "avatar", url)}
              siteId={siteId}
              disabled={disabled}
              placeholder="Drag & drop an avatar"
            />
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        className="w-full"
        onClick={handleAddTestimonial}
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Testimonial
      </Button>

      {/* Styling Section */}
      <StylingControls
        content={content}
        onChange={onChange}
        disabled={disabled}
        siteId={siteId}
        textSizeDescription="Scales quotes, author names, and roles proportionally."
      >
        {/* Card Background Panel */}
        <CardBackgroundPanel
          title="Testimonial Cards"
          showCardBackground={content.showCardBackground ?? true}
          cardBackgroundColor={content.cardBackgroundColor}
          onShowCardBackgroundChange={(checked) =>
            updateField("showCardBackground", checked)
          }
          onCardBackgroundColorChange={(color) =>
            updateField("cardBackgroundColor", color)
          }
          onCardBackgroundColorReset={() => updateField("cardBackgroundColor", "")}
          disabled={disabled}
          showDescription="Cards have solid backgrounds (text uses theme colors)"
          hideDescription="Cards are transparent (text adapts to section background)"
        />
      </StylingControls>
    </div>
  );
}
