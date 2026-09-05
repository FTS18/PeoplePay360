import React from "react";
import { User, Mail, Lock, Phone, Shield } from "lucide-react";

interface StepIdentityProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    identificationNumber: string;
  };
  onChange: (field: string, value: string) => void;
}

export const StepIdentity: React.FC<StepIdentityProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">First Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="e.g. Vikram"
              value={formData.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Last Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="e.g. Patel"
              value={formData.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Work Email Address *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="email"
            placeholder="vikram.patel@company.com"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground">Secure Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={(e) => onChange("password", e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">PAN / Tax ID</label>
          <div className="relative">
            <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="e.g. ABCDE1234F"
              value={formData.identificationNumber}
              onChange={(e) => onChange("identificationNumber", e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-teal-600 focus:outline-none uppercase"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
