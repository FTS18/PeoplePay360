"use client";

import { useCallback } from "react";
import { driver } from "driver.js";

export function useOnboardingTour() {
  const startTour = useCallback(() => {
    if (typeof window === "undefined") return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.6,
      popoverClass: "pp360-tour-popover",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Get Started",
      onDestroyStarted: () => {
        try {
          localStorage.setItem("peoplepay_tour_completed", "true");
        } catch {
          // Ignore storage errors
        }
        driverObj.destroy();
      },
      steps: [
        {
          element: "#sidebar-nav",
          popover: {
            title: "Operational Modules",
            description:
              "Navigate seamlessly across Employees, Contracts, Live Attendance, Time-off Approvals, and Batch Payroll.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#sidebar-persona",
          popover: {
            title: "Persona Simulation",
            description:
              "Switch roles instantly (HR Manager, Payroll Manager, Employee) to test fine-grained RBAC permission boundaries.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#topbar-theme-toggle",
          popover: {
            title: "Theme Toggle",
            description:
              "Toggle effortlessly between light mode and high-contrast dark mode. Settings are persisted automatically.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#dashboard-metrics",
          popover: {
            title: "Executive Workforce Metrics",
            description:
              "Track active headcount, active running contracts, pending leave requests, and net payroll expenditures.",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#dashboard-analytics",
          popover: {
            title: "Financial Distribution Analytics",
            description:
              "Visualize department-wise operational compensation distribution and historical monthly disbursement trends.",
            side: "top",
            align: "center",
          },
        },
        {
          element: "#punch-clock-widget",
          popover: {
            title: "Live Attendance Punch Clock",
            description:
              "Real-time clock-in and clock-out with deterministic timestamp recording and audit overrides.",
            side: "left",
            align: "center",
          },
        },
      ],
    });

    driverObj.drive();
  }, []);

  const autoStartTour = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const hasCompleted = localStorage.getItem("peoplepay_tour_completed");
      if (!hasCompleted) {
        // Delay slightly for smooth page hydration
        const timer = setTimeout(() => {
          startTour();
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore
    }
  }, [startTour]);

  return { startTour, autoStartTour };
}
