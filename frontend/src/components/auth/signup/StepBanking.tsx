import React from "react";

interface StepBankingProps {
  formData: {
    bankName: string;
    bankAccountNumber: string;
    bankIdentifierCode: string;
    monthlyWage: string;
  };
  onChange: (field: string, value: string) => void;
}

export const StepBanking: React.FC<StepBankingProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Bank Name</label>
          <input
            type="text"
            placeholder="e.g. HDFC Bank"
            value={formData.bankName}
            onChange={(e) => onChange("bankName", e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">IFSC / Routing Code *</label>
          <input
            type="text"
            placeholder="e.g. HDFC0002100"
            value={formData.bankIdentifierCode}
            onChange={(e) => onChange("bankIdentifierCode", e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-teal-600 focus:outline-none uppercase"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Bank Account Number *</label>
        <input
          type="text"
          placeholder="e.g. 5010049283726"
          value={formData.bankAccountNumber}
          onChange={(e) => onChange("bankAccountNumber", e.target.value)}
          className="w-full rounded-xl border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Monthly Base Compensation (₹ INR) *</label>
        <div className="relative">
          <div className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">₹</div>
          <input
            type="number"
            placeholder="e.g. 65000"
            value={formData.monthlyWage}
            onChange={(e) => onChange("monthlyWage", e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none tabular-nums"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          An active running contract will be automatically generated with deterministic payroll rules.
        </p>
      </div>
    </div>
  );
};
