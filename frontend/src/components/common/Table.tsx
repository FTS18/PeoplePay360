import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/utils/cn";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  accessor?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  loading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No records found.",
  emptyAction,
  loading = false,
}: TableProps<T>) {
  const getKey = keyExtractor || ((item: any) => item?.id || String(Math.random()));
  if (loading) {
    return (
      <div className="rounded-lg border border-(--border) bg-(--card) p-12 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-(--primary) border-t-transparent" />
        <p className="mt-2 text-xs text-(--muted-foreground)">Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-(--border) bg-(--card) p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-(--secondary) text-(--muted-foreground)">
          <FolderOpen className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <p className="mt-3 text-sm font-medium text-(--foreground)">{emptyMessage}</p>
        <p className="mt-1 text-xs text-(--muted-foreground)">
          Get started by creating a new entry or adjusting filters.
        </p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-(--border) bg-(--card) shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-(--border) bg-(--secondary)/50 text-(--muted-foreground)">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 py-3 font-semibold uppercase tracking-wider text-[10px]",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {data.map((item, rowIdx) => (
              <tr
                key={getKey(item) || rowIdx}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  "hover:bg-(--secondary)/40 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, idx) => {
                  const renderer = col.cell || col.render;
                  const acc = (col.accessorKey || col.accessor) as keyof T | undefined;
                  return (
                    <td
                      key={idx}
                      className={cn(
                        "px-4 py-3 text-(--foreground)",
                        col.align === "right" && "text-right tabular-nums",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {renderer
                        ? renderer(item)
                        : acc && item[acc] !== undefined
                        ? String(item[acc] ?? "")
                        : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
