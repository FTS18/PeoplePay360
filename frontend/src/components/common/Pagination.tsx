"use client";

import React, { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  className?: string;
  maxVisiblePages?: number;
}

export function Pagination({
  totalPages,
  currentPage,
  className,
  maxVisiblePages = 5,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= totalPages || pageIndex === currentPage) {
      return;
    }
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", pageIndex.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(0, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage - half < 0) {
      end = Math.min(totalPages - 1, end + (half - currentPage));
    } else if (currentPage + half >= totalPages) {
      start = Math.max(0, start - (currentPage + half - totalPages + 1));
    }

    const items: (number | "ellipsis")[] = [];

    if (start > 0) {
      items.push(0);
      if (start > 1) {
        items.push("ellipsis");
      }
    }

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (end < totalPages - 1) {
      if (end < totalPages - 2) {
        items.push("ellipsis");
      }
      items.push(totalPages - 1);
    }

    return items;
  }, [totalPages, currentPage, maxVisiblePages]);

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-3 border-t border-[var(--border)] dark:border-[var(--border-subtle)] bg-[var(--card)] dark:bg-[var(--card)] rounded-b-2xl",
        className
      )}
    >
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="relative inline-flex items-center rounded-md border border-[var(--border)] dark:border-[var(--border-subtle)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="relative ml-3 inline-flex items-center rounded-md border border-[var(--border)] dark:border-[var(--border-subtle)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Showing page <span className="font-semibold text-[var(--foreground)]">{currentPage + 1}</span> of{" "}
            <span className="font-semibold text-[var(--foreground)]">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px shadow-apple-sm rounded-md border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white dark:bg-stone-900 overflow-hidden" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed border-r border-[var(--border)] dark:border-[var(--border-subtle)] transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            {pages.map((page, idx) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="relative inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] border-r border-[var(--border)] dark:border-[var(--border-subtle)] bg-white dark:bg-stone-900"
                  >
                    <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                );
              }
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "relative inline-flex items-center px-3.5 py-1.5 text-xs font-semibold transition-colors border-r border-[var(--border)] dark:border-[var(--border-subtle)]",
                    isCurrent
                      ? "z-10 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)] dark:hover:bg-stone-800 bg-white dark:bg-stone-900"
                  )}
                >
                  {page + 1}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] dark:hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
