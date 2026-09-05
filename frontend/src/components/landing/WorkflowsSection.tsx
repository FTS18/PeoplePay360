"use client";

const WORKFLOWS = [
  {
    num: "1",
    title: "Scenario A: Onboarding to Payslip Delivery",
    steps: [
      "Employee profile created & shift schedule assigned",
      "Active employment contract registered with wage",
      "Shift punch records logged via attendance terminal",
      "Payrun initialized for the target pay period",
      "Pre-payroll warning scanner checks missing data",
      "Salary rules calculate gross and net pay",
      "Payrun finalized, payslip PDF generated & emailed",
    ],
  },
  {
    num: "2",
    title: "Scenario B: Leave Request & Balance Deduction",
    steps: [
      "Leave policy configured (Days or Hours)",
      "Annual leave quota allocated to employee",
      "Employee submits leave application",
      "Overlap & balance availability check runs",
      "Manager approves leave request",
      "Leave quota balance automatically debited",
      "Work entry reflected on final payslip",
    ],
  },
];

export function WorkflowsSection() {
  return (
    <section id="workflows" className="py-20 bg-[#071d1b] text-white border-b border-teal-900/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-white font-anton">
            End-to-End{" "}
            <span className="font-serif italic font-normal text-teal-300 capitalize tracking-normal text-3xl sm:text-5xl">
              Operational Workflows
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-teal-200/80 font-medium">
            See how employee records flow from onboarding to payslip delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WORKFLOWS.map((wf) => (
            <div key={wf.num} className="p-6 sm:p-8 rounded-3xl border border-teal-800/80 bg-[#0d2a27] shadow-xl space-y-4">
              <div className="font-bold text-sm text-teal-300 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center text-xs border border-teal-700 font-mono">
                  {wf.num}
                </span>
                <span>{wf.title}</span>
              </div>
              <div className="text-xs text-teal-100/80 space-y-2 font-mono leading-relaxed">
                {wf.steps.map((step, i) => (
                  <div key={i}>{i + 1}. {step}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
