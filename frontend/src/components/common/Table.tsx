import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/utils/cn";
import { Pagination } from "./Pagination";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  accessor?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T) => string;
  onRowClick?: (item: T) => void;
  header?: React.ReactNode;
  emptyMessage?: string;
  emptySubtitle?: string;
  emptyAction?: React.ReactNode;
  loading?: boolean;
  minWidth?: string;
  tableClassName?: string;
  tableLayout?: "fixed" | "auto";
  renderMobileCard?: (item: T) => React.ReactNode;
  defaultMobileView?: "card" | "table";
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  header,
  emptyMessage = "No records found.",
  emptySubtitle = "Get started by creating a new entry or adjusting filters.",
  emptyAction,
  loading = false,
  minWidth = "min-w-[640px]",
  tableClassName,
  tableLayout = "fixed",
  renderMobileCard,
  defaultMobileView = "card",
  pagination,
}: TableProps<T>) {
  const [mobileView, setMobileView] = React.useState<"card" | "table">(defaultMobileView);
  const getKey = keyExtractor || ((item: any) => item?.id || String(Math.random()));

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] shadow-apple-sm backdrop-blur-md">
        {header && <div>{header}</div>}
        <div className="p-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          <p className="mt-3 text-xs font-medium text-[var(--muted-foreground)]">Loading records...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] shadow-apple-sm backdrop-blur-md">
        {header && <div>{header}</div>}
        <div className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] dark:bg-stone-800 text-[var(--muted-foreground)] shadow-2xs">
            <FolderOpen className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">{emptyMessage}</p>
          {emptySubtitle && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {emptySubtitle}
            </p>
          )}
          {emptyAction && <div className="mt-5">{emptyAction}</div>}
        </div>
      </div>
    );
  }

  const renderCell = (col: Column<T>, item: T) => {
    const renderer = col.cell || col.render;
    const acc = (col.accessorKey || col.accessor) as keyof T | undefined;
    if (renderer) return renderer(item);
    if (acc && item[acc] !== undefined) return String(item[acc] ?? "");
    return null;
  };

  const isStatusCol = (col: Column<T>) => {
    const h = col.header.toLowerCase();
    const a = String(col.accessorKey || col.accessor || "").toLowerCase();
    return h.includes("status") || h.includes("category") || a.includes("status");
  };

  const isActionCol = (col: Column<T>) => {
    const h = col.header.toLowerCase();
    const a = String(col.accessorKey || col.accessor || "").toLowerCase();
    return h.includes("action") || h.includes("audit") || h.includes("export") || a.includes("action");
  };

  const statusCol = columns.find(isStatusCol);
  const actionCol = columns.find(isActionCol);
  const employeeOrNameCol = columns.find((c) => {
    const h = c.header.toLowerCase();
    return h.includes("employee") || h.includes("name") || h.includes("reference");
  });
  const primaryCol = employeeOrNameCol || columns.find((c) => !isStatusCol(c) && !isActionCol(c)) || columns[0];
  const detailCols = columns.filter((c) => c !== primaryCol && c !== statusCol && c !== actionCol);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] shadow-apple-sm backdrop-blur-md">
      {header && <div>{header}</div>}

      {/* Mobile Responsive Header Switcher */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] md:hidden bg-[var(--muted)]/20">
        <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
          {data.length} {data.length === 1 ? "record" : "records"}
        </span>
        <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-[var(--muted)]/50 border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setMobileView("card")}
            className={cn(
              "px-2.5 py-0.5 text-[10px] font-semibold rounded-full transition-all cursor-pointer",
              mobileView === "card"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-2xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setMobileView("table")}
            className={cn(
              "px-2.5 py-0.5 text-[10px] font-semibold rounded-full transition-all cursor-pointer",
              mobileView === "table"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-2xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            Table
          </button>
        </div>
      </div>

      {/* Mobile Card View (Default on mobile screens) */}
      {mobileView === "card" && (
        <div className="divide-y divide-[var(--border-subtle)] md:hidden">
          {data.map((item, rowIdx) => {
            if (renderMobileCard) {
              return (
                <div key={getKey(item) || rowIdx} onClick={() => onRowClick && onRowClick(item)}>
                  {renderMobileCard(item)}
                </div>
              );
            }
            return (
              <div
                key={getKey(item) || rowIdx}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  "p-4 space-y-3 transition-colors",
                  onRowClick && "cursor-pointer active:bg-[var(--muted)]/40"
                )}
              >
                {/* Card Top: Primary Title + Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {renderCell(primaryCol, item)}
                  </div>
                  {statusCol && (
                    <div className="shrink-0 pt-0.5">
                      {renderCell(statusCol, item)}
                    </div>
                  )}
                </div>

                {/* Card Middle: Key-Value Metric Grid */}
                {detailCols.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1 border-t border-[var(--border-subtle)]/60">
                    {detailCols.map((col, idx) => (
                      <div key={idx} className="flex flex-col min-w-0">
                        <span className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)] tracking-wider truncate">
                          {col.header}
                        </span>
                        <div
                          className={cn(
                            "text-xs font-medium text-[var(--foreground)] mt-0.5 break-words",
                            col.align === "right" && "tabular-nums"
                          )}
                        >
                          {renderCell(col, item)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Bottom: Actions Bar */}
                {actionCol && (
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                    {renderCell(actionCol, item)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile Horizontal Table View (When Table mode is toggled) */}
      <div className={cn("overflow-x-auto overscroll-x-contain md:hidden", mobileView !== "table" && "hidden")}>
        <div className="flex items-center justify-between px-4 py-1.5 bg-teal-500/5 dark:bg-teal-500/10 border-b border-[var(--border)] text-[11px] text-teal-700 dark:text-teal-400">
          <span>← Swipe horizontally to view all columns →</span>
        </div>
        <table
          className={cn(
            "w-full text-left text-xs border-collapse",
            tableLayout === "fixed" ? "table-fixed" : "table-auto",
            minWidth,
            tableClassName
          )}
        >
          <colgroup>
            {columns.map((col, idx) => (
              <col key={idx} style={col.width ? { width: col.width } : undefined} />
            ))}
          </colgroup>
          <thead className="pp360-table-head">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-[var(--muted-foreground)] border-b border-[var(--border)]",
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
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {data.map((item, rowIdx) => (
              <tr
                key={getKey(item) || rowIdx}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  "hover:bg-stone-50/70 dark:hover:bg-[var(--muted)]/50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={cn(
                      "px-4 py-3.5 text-[var(--foreground)] text-xs font-normal align-middle",
                      col.align === "right" && "text-right tabular-nums",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {renderCell(col, item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop Pristine Table View (Always displayed on md screens and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table
          className={cn(
            "w-full text-left text-xs border-collapse",
            tableLayout === "fixed" ? "table-fixed" : "table-auto",
            minWidth,
            tableClassName
          )}
        >
          <colgroup>
            {columns.map((col, idx) => (
              <col key={idx} style={col.width ? { width: col.width } : undefined} />
            ))}
          </colgroup>
          <thead className="pp360-table-head">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 sm:px-5 py-3 text-[11px] font-semibold tracking-wider uppercase text-[var(--muted-foreground)] border-b border-[var(--border)]",
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
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {data.map((item, rowIdx) => (
              <tr
                key={getKey(item) || rowIdx}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  "hover:bg-stone-50/70 dark:hover:bg-[var(--muted)]/50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={cn(
                      "px-4 sm:px-5 py-3.5 text-[var(--foreground)] text-xs font-normal align-middle",
                      col.align === "right" && "text-right tabular-nums",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {renderCell(col, item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
        />
      )}
    </div>
  );
}

