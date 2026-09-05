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
        "flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] shadow-apple-sm backdrop-blur-md",
        className
      )}
    >
      {/* Left actions slot */}
      <div className="flex items-center gap-2">{actions}</div>

      {/* Right pipeline stages */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium py-1">
        {stages.map((stage, idx) => {
          const isCurrent = idx === currentIndex;
          const isPast = idx < currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <React.Fragment key={stage.key}>
              <div
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium tracking-tight transition-all",
                  isCurrent &&
                    "bg-teal-600 text-white font-semibold shadow-xs shadow-teal-900/30",
                  isPast &&
                    "bg-[var(--muted)] dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium",
                  isFuture &&
                    "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                )}
              >
                {stage.label}
              </div>
              {idx < stages.length - 1 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-stone-300 dark:text-stone-600 shrink-0"
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
