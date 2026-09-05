"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
import { Role, UserSession } from "@/types";
import { StepIdentity } from "@/components/auth/signup/StepIdentity";
import { StepRole } from "@/components/auth/signup/StepRole";
import { StepBanking } from "@/components/auth/signup/StepBanking";
import { StepReview } from "@/components/auth/signup/StepReview";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "+91 ",
    identificationNumber: "",
    department: "Engineering",
    jobPosition: "",
    role: "EMPLOYEE" as Role,
    bankName: "HDFC Bank",
    bankAccountNumber: "",
    bankIdentifierCode: "HDFC0002100",
    monthlyWage: "65000",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateCurrentStep = (): string | null => {
    if (step === 1) {
      if (!formData.firstName.trim()) return "First name is required";
      if (!formData.lastName.trim()) return "Last name is required";
      if (!formData.email.trim() || !formData.email.includes("@")) return "A valid work email is required";
      if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters";
    }
    if (step === 2) {
      if (!formData.department.trim()) return "Department selection is required";
      if (!formData.jobPosition.trim()) return "Job position title is required";
    }
    if (step === 3) {
      if (!formData.bankAccountNumber.trim()) return "Bank account number is required";
      if (!formData.bankIdentifierCode.trim()) return "IFSC / Bank identifier code is required";
      if (!formData.monthlyWage || Number(formData.monthlyWage) <= 0) return "Valid monthly compensation is required";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        jobPosition: formData.jobPosition.trim(),
        role: formData.role,
        bankAccountNumber: formData.bankAccountNumber.trim(),
        bankName: formData.bankName.trim(),
        bankIdentifierCode: formData.bankIdentifierCode.trim(),
        identificationNumber: formData.identificationNumber.trim() || "PAN-" + Date.now().toString().slice(-6),
        monthlyWage: Number(formData.monthlyWage),
      };

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Registration failed. Please check your details.");
      }

      const authData = data.data;
      const session: UserSession = {
        id: authData.user.id,
        email: authData.user.email,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: authData.user.role,
        token: authData.accessToken,
      };

      login(session);
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-8 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs transition-colors">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20">
            <CreditCard className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Employee Self-Onboarding</h1>
          <p className="text-xs text-muted-foreground">
            Join PeoplePay360 with automated identity verification & payroll profile setup
          </p>
        </div>

        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span className={step >= 1 ? "text-foreground font-bold" : ""}>1. Personal Info</span>
            <span className={step >= 2 ? "text-foreground font-bold" : ""}>2. Role & Team</span>
            <span className={step >= 3 ? "text-foreground font-bold" : ""}>3. Compensation</span>
            <span className={step >= 4 ? "text-foreground font-bold" : ""}>4. Review</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && <StepIdentity formData={formData} onChange={handleChange} />}
        {step === 2 && <StepRole formData={formData} onChange={handleChange} />}
        {step === 3 && <StepBanking formData={formData} onChange={handleChange} />}
        {step === 4 && <StepReview formData={formData} />}

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  Activating Account...
                </>
              ) : (
                <>
                  Complete Onboarding
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <Link href={ROUTES.LOGIN} className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
            Sign In to Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
