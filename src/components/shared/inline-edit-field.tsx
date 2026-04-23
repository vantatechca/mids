"use client";

import * as React from "react";
import { Check, X, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "select" | "textarea";
  options?: { label: string; value: string }[];
  className?: string;
  placeholder?: string;
}

export function InlineEditField({
  value,
  onSave,
  type = "text",
  options = [],
  className,
  placeholder = "Click to edit",
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  React.useEffect(() => {
    if (isEditing) {
      if (type === "text") inputRef.current?.focus();
      if (type === "textarea") textareaRef.current?.focus();
    }
  }, [isEditing, type]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 hover:bg-muted",
          className
        )}
        onClick={() => setIsEditing(true)}
      >
        <span className={cn(!value && "text-muted-foreground italic")}>
          {value || placeholder}
        </span>
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="flex items-center gap-1">
        <Select
          value={editValue}
          onValueChange={(val) => {
            setEditValue(val);
            onSave(val);
            setIsEditing(false);
          }}
        >
          <SelectTrigger className="h-8 w-auto min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="space-y-1">
        <Textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="min-h-[60px] text-sm"
        />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 text-sm"
      />
    </div>
  );
}
