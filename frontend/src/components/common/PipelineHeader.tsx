import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface Stage {
  key: string;
  label: string;
}

interface PipelineHeaderProps {
  stages: Stage[];
  currentStage: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PipelineHeader({
  stages,
  currentStage,
  actions,
  className,
}: PipelineHeaderProps) {
  const currentIndex = stages.findIndex(
    (s) => s.key.toUpperCase() === currentStage.toUpperCase()
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 py-3 px-4 rounded-lg border border-(--border) bg-(--card)",
        className
      )}
    >
      {/* Left actions slot */}
      <div className="flex items-center gap-2">{actions}</div>

      {/* Right pipeline stages */}
      <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
        {stages.map((stage, idx) => {
          const isCurrent = idx === currentIndex;
          const isPast = idx < currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <React.Fragment key={stage.key}>
              <div
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-colors",
                  isCurrent &&
                    "bg-(--primary) text-(--primary-foreground) font-semibold shadow-xs",
                  isPast &&
                    "bg-(--secondary) text-(--muted-foreground)",
                  isFuture &&
                    "text-(--muted-foreground)/60 hover:text-(--muted-foreground)"
                )}
              >
                {stage.label}
              </div>
              {idx < stages.length - 1 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-(--muted-foreground)/40 shrink-0"
                  strokeWidth={1.5}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
