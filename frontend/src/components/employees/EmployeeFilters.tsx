import React from "react";
import { Search, Kanban, LayoutGrid, List, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface EmployeeFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  departments: string[];
  viewMode: "kanban" | "grid" | "list";
  onViewModeChange: (mode: "kanban" | "grid" | "list") => void;
  onAddEmployee: () => void;
}

export function EmployeeFilters({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  departments,
  viewMode,
  onViewModeChange,
  onAddEmployee,
}: EmployeeFiltersProps) {
  const { role } = useAuth();
  const canManage = role === "HR_MANAGER" || role === "ADMIN";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-60 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-(--muted-foreground)" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-(--border) bg-(--card) py-2 pl-9 pr-3 text-xs text-(--foreground) focus:border-(--primary) focus:outline-hidden"
          />
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="rounded-lg border border-(--border) bg-(--card) py-2 px-3 text-xs text-(--foreground) focus:border-(--primary) focus:outline-hidden"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-(--border) bg-(--card) p-1">
          <button
            onClick={() => onViewModeChange("kanban")}
            className={`rounded p-1.5 transition-colors ${
              viewMode === "kanban"
                ? "bg-(--secondary) text-(--foreground)"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
            title="Kanban Board"
          >
            <Kanban className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`rounded p-1.5 transition-colors ${
              viewMode === "grid"
                ? "bg-(--secondary) text-(--foreground)"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
            title="Card Grid"
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`rounded p-1.5 transition-colors ${
              viewMode === "list"
                ? "bg-(--secondary) text-(--foreground)"
                : "text-(--muted-foreground) hover:text-(--foreground)"
            }`}
            title="Table List"
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {canManage && (
          <button
            onClick={onAddEmployee}
            className="flex items-center gap-1.5 rounded-lg bg-(--primary) py-2 px-3 text-xs font-medium text-(--primary-foreground) hover:bg-(--primary)/90 shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Add Employee</span>
          </button>
        )}
      </div>
    </div>
  );
}
