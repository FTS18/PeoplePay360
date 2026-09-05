"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, FileText, Layers } from "lucide-react";
import { ROUTES } from "@/config/routes";

export function PayrollSubNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Payrun Batches", href: ROUTES.PAYROLL.PAYRUNS, icon: CreditCard },
    { label: "Itemized Payslips", href: ROUTES.PAYROLL.PAYSLIPS, icon: FileText },
    { label: "Salary Structures & Rules", href: ROUTES.PAYROLL.STRUCTURES, icon: Layers },
  ];

  return (
    <div className="flex items-center gap-1.5 border-b border-stone-200/80 pb-2 mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? "bg-[oklch(28%_0.06_195)] text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
