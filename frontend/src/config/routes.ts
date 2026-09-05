export const ROUTES = {
  DASHBOARD: "/dashboard",
  EMPLOYEES: {
    LIST: "/employees",
    DETAIL: (id: string) => `/employees/${id}`,
  },
  CONTRACTS: {
    LIST: "/contracts",
    DETAIL: (id: string) => `/contracts/${id}`,
  },
  ATTENDANCE: "/attendance",
  TIMEOFF: {
    REQUESTS: "/timeoff",
    ALLOCATIONS: "/timeoff/allocations",
  },
  PAYROLL: {
    PAYRUNS: "/payroll/payruns",
    PAYRUN_DETAIL: (id: string) => `/payroll/payruns/${id}`,
    PAYSLIPS: "/payroll/payslips",
    PAYSLIP_DETAIL: (id: string) => `/payroll/payslips/${id}`,
    STRUCTURES: "/payroll/structures",
  },
  SCHEDULES: "/schedules",
  USERS: "/users",
  SETTINGS: "/settings",
  LOGIN: "/login",
  SIGNUP: "/signup",
  LEGAL: {
    PRIVACY: "/privacy",
    TERMS: "/terms",
    SECURITY: "/security",
    COOKIES: "/cookies",
  },
} as const;
