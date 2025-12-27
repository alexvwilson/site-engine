"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactContent, ContactField } from "@/lib/section-types";

interface ContactEditorProps {
  content: ContactContent;
  onChange: (content: ContactContent) => void;
  disabled?: boolean;
}

const DEFAULT_FIELD: ContactField = {
  type: "text",
  label: "New Field",
  required: false,
};

export function ContactEditor({ content, onChange, disabled }: ContactEditorProps) {
  const handleChange = (field: keyof ContactContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  const handleFieldChange = (
    index: number,
    field: keyof ContactField,
    value: string | boolean
  ): void => {
    const newFields = [...content.fields];
    newFields[index] = { ...newFields[index], [field]: value } as ContactField;
    onChange({ ...content, fields: newFields });
  };

  const handleAddField = (): void => {
    onChange({
      ...content,
      fields: [...content.fields, { ...DEFAULT_FIELD }],
    });
  };

  const handleRemoveField = (index: number): void => {
    const newFields = content.fields.filter((_, i) => i !== index);
    onChange({ ...content, fields: newFields });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contact-heading">Heading</Label>
        <Input
          id="contact-heading"
          value={content.heading}
          onChange={(e) => handleChange("heading", e.target.value)}
          placeholder="Get in Touch"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-description">Description</Label>
        <Textarea
          id="contact-description"
          value={content.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Let visitors know how to reach you"
          rows={2}
          disabled={disabled}
        />
      </div>

      <div className="space-y-4">
        <Label>Form Fields</Label>
        {content.fields.map((field, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Field {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveField(index)}
                disabled={disabled || content.fields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove field</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`field-${index}-label`}>Label</Label>
                <Input
                  id={`field-${index}-label`}
                  value={field.label}
                  onChange={(e) => handleFieldChange(index, "label", e.target.value)}
                  placeholder="Field label"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`field-${index}-type`}>Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value) => handleFieldChange(index, "type", value)}
                  disabled={disabled}
                >
                  <SelectTrigger id={`field-${index}-type`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="textarea">Text Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id={`field-${index}-required`}
                checked={field.required}
                onCheckedChange={(checked) => handleFieldChange(index, "required", checked)}
                disabled={disabled}
              />
              <Label htmlFor={`field-${index}-required`}>Required</Label>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddField}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>
    </div>
  );
}
