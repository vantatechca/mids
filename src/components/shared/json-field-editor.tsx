"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FieldDefinition {
  key: string;
  label: string;
  type: string;
  options?: string[];
}

interface JsonFieldEditorProps {
  value: Record<string, any>[];
  fields: FieldDefinition[];
  onChange: (value: Record<string, any>[]) => void;
  addLabel?: string;
  className?: string;
}

export function JsonFieldEditor({
  value,
  fields,
  onChange,
  addLabel = "Add item",
  className,
}: JsonFieldEditorProps) {
  const handleFieldChange = (
    index: number,
    fieldKey: string,
    fieldValue: string
  ) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [fieldKey]: fieldValue };
    onChange(updated);
  };

  const handleAdd = () => {
    const empty: Record<string, any> = {};
    fields.forEach((f) => (empty[f.key] = ""));
    onChange([...value, empty]);
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {value.map((item, index) => (
        <div
          key={index}
          className="relative rounded-lg border bg-muted/30 p-3 pr-10"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {field.label}
                </Label>
                {field.type === "select" && field.options ? (
                  <Select
                    value={item[field.key] ?? ""}
                    onValueChange={(val) =>
                      handleFieldChange(index, field.key, val)
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={item[field.key] ?? ""}
                    onChange={(e) =>
                      handleFieldChange(index, field.key, e.target.value)
                    }
                    placeholder={field.label}
                    className="h-8 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
