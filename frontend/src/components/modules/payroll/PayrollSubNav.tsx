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
    <div className="flex items-center pb-2 mb-4">
      {/* Apple Segmented Nav Control */}
      <div className="apple-segmented-track border border-stone-300/70 dark:border-stone-700/70 shadow-2xs overflow-x-auto py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`apple-press apple-segmented-item ${isActive ? "active font-semibold" : ""}`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
