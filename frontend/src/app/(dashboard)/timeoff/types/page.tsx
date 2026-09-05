"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, CalendarDays, Pencil, Search } from "lucide-react";
import { timeoffService } from "@/services/timeoffService";
import { TimeOffType } from "@/types";
import { Table, Column } from "@/components/common/Table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { CreateTimeOffTypeModal } from "@/components/modules/timeoff/CreateTimeOffTypeModal";
import { TimeOffTypeDetailModal } from "@/components/modules/timeoff/TimeOffTypeDetailModal";

import { RoleGuard } from "@/components/common/RoleGuard";

export default function TimeOffTypesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]} pageName="Time Off Types">
      <TimeOffTypesContent />
    </RoleGuard>
  );
}

function TimeOffTypesContent() {
  const { hasRole } = useAuth();
  const canManage = hasRole(["ADMIN", "HR_MANAGER"]);

  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TimeOffType | null>(null);
  const [detailType, setDetailType] = useState<TimeOffType | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await timeoffService.getTypes();
      setTypes(Array.isArray(fetched) ? fetched : []);
    } catch (err) {
      console.error("Failed to load time off types", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTypes = React.useMemo(() => {
    if (!searchQuery.trim()) return types;
    const q = searchQuery.toLowerCase();
    return types.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.code?.toLowerCase().includes(q) ||
        t.unit?.toLowerCase().includes(q)
    );
  }, [types, searchQuery]);

  const columns: Column<TimeOffType>[] = [
    {
      header: "Type",
      width: "28%",
      render: (t) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: t.colorCode || "#0d9488" }}
          />
          <span className="font-semibold text-foreground text-xs">{t.name}</span>
        </div>
      ),
    },
    {
      header: "Unit",
      width: "16%",
      render: (t) => (
        <span className="text-xs font-medium text-foreground">{t.unit || "Days"}</span>
      ),
    },
    {
      header: "Allocation",
      width: "20%",
      render: (t) => (
        <span className="text-xs text-muted-foreground font-medium">
          {t.requiresAllocation ? "Required" : "No"}
        </span>
      ),
    },
    {
      header: "Approval",
      width: "18%",
      render: () => (
        <span className="text-xs text-foreground font-medium">Manager</span>
      ),
    },
    {
      header: "Status",
      width: "12%",
      align: "center",
      render: (t) => (
        <StatusBadge status={t.active !== false ? "ACTIVE" : "INACTIVE"} />
      ),
    },
  ];

  if (canManage) {
    columns.push({
      header: "Actions",
      width: "8%",
      align: "center",
      render: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingType(t);
            setModalOpen(true);
          }}
          className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors apple-press cursor-pointer"
          title="Edit Time Off Type"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      ),
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Time Off /</span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Time Off Types</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure entitlement rules, allocation policies, and payroll-affecting leave behavior.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="apple-press inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl border border-border shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} strokeWidth={1.5} />
            Refresh
          </button>
          {canManage && (
            <button
              onClick={() => setModalOpen(true)}
              className="apple-press inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              NEW
            </button>
          )}
        </div>
      </div>

      {/* Wireframe Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search time off types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredTypes}
        loading={loading}
        onRowClick={(type) => setDetailType(type)}
        minWidth="min-w-[640px]"
        emptyMessage="No Time Off Types configured."
        emptySubtitle="System default types include Paid Time Off, Sick Leave, and Comp Off."
      />

      {/* Wireframe Footer Note */}
      <div className="text-[11px] text-muted-foreground/80 italic pt-1">
        Useful note: this list defines policy rules, not employee transactions.
      </div>

      {detailType && (
        <TimeOffTypeDetailModal
          type={detailType}
          onClose={() => setDetailType(null)}
          onEdit={(t) => {
            setEditingType(t);
            setModalOpen(true);
          }}
        />
      )}

      {modalOpen && (
        <CreateTimeOffTypeModal
          typeToEdit={editingType}
          onClose={() => {
            setModalOpen(false);
            setEditingType(null);
          }}
          onSuccess={(savedType) => {
            setTypes((prev) => {
              const idx = prev.findIndex((x) => x.id === savedType.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = savedType;
                return next;
              }
              return [...prev, savedType];
            });
          }}
        />
      )}
    </div>
  );
}

