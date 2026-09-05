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
      <div className="flex flex-1 flex-wrap items-center gap-2.5 w-full">
        {/* Apple Spotlight Search Field */}
        <div className="relative w-full sm:w-auto sm:min-w-64 flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-stone-300/80 dark:border-stone-700/80 bg-card py-2 pl-9.5 pr-4 text-xs text-foreground placeholder:text-muted-foreground/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all font-medium"
          />
        </div>

        {/* Department Filter Pill */}
        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="w-full sm:w-auto rounded-full border border-stone-300/80 dark:border-stone-700/80 bg-card py-2 px-4 text-xs font-medium text-foreground shadow-apple-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all cursor-pointer"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
        {/* Apple Segmented View Mode Switcher */}
        <div className="apple-segmented-track border border-stone-300/70 dark:border-stone-700/70 shadow-2xs">
          <button
            onClick={() => onViewModeChange("kanban")}
            className={`apple-press apple-segmented-item ${viewMode === "kanban" ? "active" : ""}`}
            title="Kanban Board"
          >
            <Kanban className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden md:inline">Kanban</span>
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`apple-press apple-segmented-item ${viewMode === "grid" ? "active" : ""}`}
            title="Card Grid"
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden md:inline">Grid</span>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`apple-press apple-segmented-item ${viewMode === "list" ? "active" : ""}`}
            title="Table List"
          >
            <List className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden md:inline">List</span>
          </button>
        </div>

        {canManage && (
          <button
            onClick={onAddEmployee}
            className="apple-press flex items-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 py-2 px-4 text-xs font-semibold text-white shadow-apple-sm transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>Add Employee</span>
          </button>
        )}
      </div>
    </div>
  );
}
