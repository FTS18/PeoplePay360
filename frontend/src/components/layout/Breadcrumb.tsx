"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/dashboard") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[oklch(20%_0.02_240)]">
        Dashboard Overview
      </div>
    );
  }

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[oklch(50%_0.02_240)]">
      <Link href="/dashboard" className="hover:text-[oklch(20%_0.02_240)] transition-colors flex items-center gap-1">
        <Home className="h-3.5 w-3.5" strokeWidth={1.5} />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const formatted = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-[oklch(60%_0.02_240)]" strokeWidth={1.5} />
            {isLast ? (
              <span className="font-semibold text-[oklch(20%_0.02_240)]">{formatted}</span>
            ) : (
              <Link href={href} className="hover:text-[oklch(20%_0.02_240)] transition-colors">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
