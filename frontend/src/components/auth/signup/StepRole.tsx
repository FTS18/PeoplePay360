import React from "react";
import { Building, Briefcase } from "lucide-react";
import { Role } from "@/types";

interface StepRoleProps {
  formData: {
    department: string;
    jobPosition: string;
    role: Role;
  };
  onChange: (field: string, value: any) => void;
}

const DEPARTMENTS = ["Engineering", "Finance", "Human Resources", "Product", "Operations"];

const ROLES_LIST: { role: Role; label: string; description: string }[] = [
  { role: "EMPLOYEE", label: "Staff Employee", description: "Standard personal attendance punch and payslip viewer" },
  { role: "HR_MANAGER", label: "HR Manager", description: "Employee records, contract validation, and leave approvals" },
  { role: "HR_PAYROLL_MANAGER", label: "Payroll Manager", description: "Complete batch payrun execution and wage administration" },
];

export const StepRole: React.FC<StepRoleProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Department *</label>
        <div className="relative">
          <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <select
            value={formData.department}
            onChange={(e) => onChange("department", e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none cursor-pointer"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} className="bg-card text-foreground">
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Designation / Job Position *</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="e.g. Lead Software Engineer"
            value={formData.jobPosition}
            onChange={(e) => onChange("jobPosition", e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <label className="text-xs font-medium text-foreground">Operational Role Assignment</label>
        <div className="p-3.5 rounded-xl border border-teal-600/30 bg-teal-500/5 dark:bg-teal-500/10 flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold text-xs">
            EMP
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">Standard Staff Employee</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              All self-onboarding profiles are provisioned with standard employee permissions (personal attendance & payslips). Elevated roles (HR Manager, Payroll Manager, Admin) are provisioned securely by your System Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
