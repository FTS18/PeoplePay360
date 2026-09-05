export type Role =
  | "EMPLOYEE"
  | "HR_MANAGER"
  | "HR_PAYROLL_USER"
  | "HR_PAYROLL_MANAGER"
  | "ADMIN";

export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";
export type ContractStatus = "DRAFT" | "RUNNING" | "EXPIRED" | "CANCELLED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "EXCEPTION";
export type TimeOffStatus = "DRAFT" | "CONFIRM" | "APPROVED" | "REFUSED" | "CANCELLED";
export type PayrunStatus = "DRAFT" | "COMPUTED" | "VALIDATED" | "PAID" | "CANCELLED";
export type PayslipStatus = "DRAFT" | "COMPUTED" | "VALIDATED" | "PAID" | "CANCELLED";
export type SalaryRuleCategory = "BASIC" | "ALLOWANCE" | "GROSS" | "DEDUCTION" | "NET";
export type ComputationType = "FIXED" | "PERCENTAGE" | "FORMULA";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  token?: string;
  refreshToken?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phone?: string;
  department: string;
  jobPosition: string;
  role?: Role;
  status: EmployeeStatus;
  bankAccountNumber?: string;
  bankName?: string;
  bankIdentifierCode?: string;
  identificationNumber?: string;
  joiningDate?: string;
  managerId?: string;
  managerName?: string;
  workingScheduleId?: string;
  workingScheduleName?: string;
}

export interface Contract {
  id: string;
  reference: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  jobPosition?: string;
  salaryStructureId?: string;
  salaryStructureName?: string;
  workingScheduleId?: string;
  workingScheduleName?: string;
  wage: number;
  startDate: string;
  endDate?: string;
  status: ContractStatus;
  createdAt?: string;
}

export interface WorkingSchedule {
  id: string;
  name: string;
  type: string;
  averageHoursPerDay: number;
  totalWeeklyHours: number;
  active: boolean;
  lines: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    breakHours: number;
    workHours: number;
  }>;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workedHours: number;
  expectedHours: number;
  status: AttendanceStatus;
  manualOverride: boolean;
  overrideReason?: string;
  reviewedByName?: string;
}

export interface TimeOffType {
  id: string;
  name: string;
  code: string;
  unit: "DAYS" | "HOURS";
  requiresAllocation: boolean;
  colorCode?: string;
  isPaid?: boolean;
  payrollAffecting?: boolean;
  active: boolean;
}

export interface TimeOffBalance {
  timeOffTypeId: string;
  timeOffTypeName: string;
  code: string;
  unit: "DAYS" | "HOURS";
  availableBalance: number;
  colorCode?: string;
}

export interface TimeOffAllocation {
  id: string;
  employeeId: string;
  employeeCode?: string;
  employeeName: string;
  timeOffTypeId: string;
  timeOffTypeName: string;
  allocatedUnits: number;
  validFrom: string;
  validTo: string;
  status: TimeOffStatus;
  approverName?: string;
  approvalDate?: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  timeOffTypeId: string;
  timeOffTypeName: string;
  startDate: string;
  endDate: string;
  requestedUnits: number;
  status: TimeOffStatus;
  reason?: string;
  approverName?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export interface SalaryRule {
  id: string;
  name: string;
  code: string;
  category: SalaryRuleCategory;
  sequence: number;
  computationType: ComputationType;
  fixedAmount?: number;
  percentage?: number;
  percentageBaseCode?: string;
  formula?: string;
  active: boolean;
}

export interface SalaryStructure {
  id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  rulesCount: number;
  rules?: SalaryRule[];
}

export interface Payrun {
  id: string;
  name: string;
  salaryStructureId: string;
  salaryStructureName?: string;
  periodStart: string;
  periodEnd: string;
  status: PayrunStatus;
  totalBasic: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNet: number;
  payslipsCount: number;
  validatedAt?: string;
  paidAt?: string;
}

export interface Payslip {
  id: string;
  payrunId: string;
  payrunName?: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string;
  periodStart: string;
  periodEnd: string;
  workedDays: number;
  basicWage: number;
  grossSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  status: PayslipStatus;
  contractReference?: string;
  pdfGenerated: boolean;
  emailSent: boolean;
  lines?: PayslipLine[];
}

export interface PayslipLine {
  id: string;
  ruleCode: string;
  ruleName: string;
  category: SalaryRuleCategory;
  sequence: number;
  rate?: number;
  amount: number;
}

export interface DashboardSummary {
  totalNetSalaryPaid: number;
  averageSalary: number;
  activeEmployeesCount: number;
  runningContractsCount: number;
  pendingLeaveRequestsCount: number;
  todayPresentCount: number;
}
