"use client";

import { getStageConfig } from "@/lib/constants/pipeline-stages";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  stage: string;
  className?: string;
}

export function StatusBadge({ stage, className }: StatusBadgeProps) {
  const config = getStageConfig(stage);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}
