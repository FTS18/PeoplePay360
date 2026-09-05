import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Role } from "@/types";

interface StepReviewProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    jobPosition: string;
    role: Role;
    bankName: string;
    bankAccountNumber: string;
    monthlyWage: string;
  };
}

export const StepReview: React.FC<StepReviewProps> = ({ formData }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <span className="text-xs font-bold text-foreground">Profile Summary</span>
          <span className="rounded bg-teal-500/10 text-teal-700 dark:text-teal-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            {formData.role.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground">Full Name</span>
            <p className="font-semibold text-foreground">{formData.firstName} {formData.lastName}</p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground">Work Email</span>
            <p className="font-semibold text-foreground truncate">{formData.email}</p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground">Department</span>
            <p className="font-semibold text-foreground">{formData.department}</p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground">Position</span>
            <p className="font-semibold text-foreground">{formData.jobPosition}</p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground">Disbursement Account</span>
            <p className="font-semibold text-foreground">
              {formData.bankName} (••••{formData.bankAccountNumber.slice(-4) || "0000"})
            </p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground">Monthly Wage</span>
            <p className="font-bold text-foreground tabular-nums">
              ₹{Number(formData.monthlyWage || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400">
        <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>Standard 40h/week working schedule will be bound automatically upon signup.</span>
      </div>
    </div>
  );
};
