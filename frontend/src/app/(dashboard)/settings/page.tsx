"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CreditCard,
  Clock,
  CalendarDays,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Briefcase,
  Lock,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";

interface ConfigItem {
  id: string;
  configKey: string;
  configValue: string;
  category: string;
  dataType: string;
  description: string;
  isEditable?: boolean;
  editable?: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

type GroupedConfigs = Record<string, ConfigItem[]>;

import { RoleGuard } from "@/components/common/RoleGuard";

export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]} pageName="System Settings">
      <SettingsContent />
    </RoleGuard>
  );
}

function SettingsContent() {
  const { role } = useAuth();
  const canEdit = ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"].includes(role);

  const [activeTab, setActiveTab] = useState<"COMPANY" | "PAYROLL" | "ATTENDANCE" | "TIMEOFF" | "SYSTEM">("COMPANY");
  const [configs, setConfigs] = useState<GroupedConfigs>({});
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await apiClient.get<GroupedConfigs>("/settings", { bypassCache: true });
      setConfigs(data || {});

      // Flatten config values into form state
      const initialMap: Record<string, string> = {};
      Object.values(data || {}).flatMap((items) => items).forEach((item) => {
        initialMap[item.configKey] = item.configValue;
      });
      setFormState(initialMap);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to load system settings" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (key: string, val: string) => {
    setFormState((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveCategory = async (category: string) => {
    if (!canEdit) return;
    setSaving(true);
    setMessage(null);

    // Filter form state keys belonging to this category
    const categoryItems = configs[category] || [];
    const payloadMap: Record<string, string> = {};
    categoryItems.forEach((item) => {
      const isEditable = item.isEditable ?? (item as any).editable ?? true;
      const currentVal = formState[item.configKey] ?? item.configValue;
      if (isEditable && currentVal !== undefined && currentVal !== null) {
        payloadMap[item.configKey] = String(currentVal);
      }
    });

    if (Object.keys(payloadMap).length === 0) {
      setMessage({ type: "error", text: "No configuration parameters found to update." });
      setSaving(false);
      return;
    }

    try {
      const updatedData = await apiClient.put<GroupedConfigs>("/settings", { configs: payloadMap });
      setConfigs(updatedData || {});

      const updatedMap: Record<string, string> = { ...formState };
      Object.values(updatedData || {}).flatMap((items) => items).forEach((item) => {
        updatedMap[item.configKey] = item.configValue;
      });
      setFormState(updatedMap);

      setMessage({ type: "success", text: `${category} configurations updated successfully!` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update configurations" });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "COMPANY", label: "Company Profile", icon: Building2, desc: "Organization identity, currency, & tax identifiers" },
    { id: "PAYROLL", label: "Payroll & Taxes", icon: CreditCard, desc: "PF, ESI rates, payrun cycle, & overtime rules" },
    { id: "ATTENDANCE", label: "Attendance Policies", icon: Clock, desc: "Shift grace periods, overtime thresholds, & overrides" },
    { id: "TIMEOFF", label: "Leave Policies", icon: CalendarDays, desc: "Carry-forward limits, negative balances, & probation" },
    { id: "SYSTEM", label: "System Preferences", icon: ShieldCheck, desc: "Audit logging, notifications, & session security" },
  ] as const;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Sliders className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">System Administration &amp; Settings</h1>
              <p className="text-xs text-muted-foreground">
                Centralized database-backed configuration rules, tax parameters, and organizational policies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-accent text-foreground transition-all apple-press cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.75} />
            <span>Reload Configs</span>
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-medium ${
            message.type === "success"
              ? "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400"
              : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar Tabs */}
        <div className="space-y-1.5 lg:col-span-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const count = configs[tab.id]?.length || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 apple-press cursor-pointer ${
                  active
                    ? "bg-teal-500/10 border-teal-500/40 text-teal-600 dark:text-teal-400 shadow-sm font-semibold"
                    : "border-border/60 bg-card/60 hover:bg-card hover:border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
                    active
                      ? "bg-teal-500 text-white border-teal-600"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate">{tab.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                      {count}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form Details Content Panel */}
        <div className="lg:col-span-3">
          <div className="border border-border/80 bg-card rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {tabs.find((t) => t.id === activeTab)?.desc}
                </p>
              </div>

              {canEdit ? (
                <button
                  onClick={() => handleSaveCategory(activeTab)}
                  disabled={saving || loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-900/20 transition-all apple-press cursor-pointer disabled:opacity-50"
                >
                  <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} strokeWidth={1.75} />
                  <span>{saving ? "Saving..." : "Save Configuration"}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
                  <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Read-Only (Policy Mode)</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-3">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-teal-500" strokeWidth={1.5} />
                <p>Loading database configuration items...</p>
              </div>
            ) : !configs[activeTab] || configs[activeTab].length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No configuration parameters found under category '{activeTab}'.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {configs[activeTab].map((item) => {
                  const isItemEditable = item.isEditable ?? item.editable ?? true;
                  const currentValue = formState[item.configKey] ?? item.configValue;
                  const isBool = item.dataType === "BOOLEAN";

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-border/70 bg-background/50 hover:border-border transition-colors space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground tracking-tight">
                          {item.configKey}
                        </label>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-medium">
                          {item.dataType}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground min-h-[32px] leading-relaxed">
                        {item.description || "System policy parameter governing enterprise workflow logic."}
                      </p>

                      {isBool ? (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            disabled={!canEdit || !isItemEditable}
                            onClick={() => handleInputChange(item.configKey, currentValue === "true" ? "false" : "true")}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              currentValue === "true" ? "bg-teal-600" : "bg-muted"
                            } ${!canEdit || !isItemEditable ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                currentValue === "true" ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className="text-xs font-semibold text-foreground">
                            {currentValue === "true" ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      ) : (
                        <input
                          type={item.dataType === "NUMBER" ? "number" : "text"}
                          step={item.dataType === "NUMBER" ? "any" : undefined}
                          disabled={!canEdit || !isItemEditable}
                          value={currentValue}
                          onChange={(e) => handleInputChange(item.configKey, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:opacity-60 disabled:bg-muted font-medium transition-all"
                        />
                      )}

                      {item.updatedAt && (
                        <div className="text-[10px] text-muted-foreground/70 pt-1 flex items-center justify-between">
                          <span>Updated by: {item.updatedBy || "System Admin"}</span>
                          <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
