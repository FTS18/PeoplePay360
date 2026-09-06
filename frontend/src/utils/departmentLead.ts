import { Role } from "@/types";

export interface DeptLeadInfo {
  name: string;
  position: string;
  email: string;
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 500,
  HR_PAYROLL_MANAGER: 400,
  HR_MANAGER: 300,
  HR_PAYROLL_USER: 200,
  EMPLOYEE: 100,
};

export function canManageUser(currentUserRole: Role, targetUserRole?: Role): boolean {
  if (!targetUserRole) return true;
  const currentLevel = ROLE_HIERARCHY[currentUserRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetUserRole] || 0;
  // A user can ONLY manage users of a strictly LOWER role level
  return currentLevel > targetLevel;
}

export const DEPARTMENT_LEADS: Record<string, DeptLeadInfo> = {
  "Engineering": { name: "Rajesh Gupta", position: "VP Engineering", email: "gishan750@gmail.com" },
  "Finance": { name: "Siddharth Joshi", position: "VP Finance & Payroll Lead", email: "vp.finance@peoplepay360.com" },
  "Human Resources": { name: "Ananya Kulkarni", position: "VP People & HR Head", email: "vp.people@peoplepay360.com" },
  "Product & Design": { name: "Meera Iyer", position: "VP Product", email: "vp.product@peoplepay360.com" },
  "Sales & Marketing": { name: "Vikram Mehta", position: "Chief Commercial Officer", email: "cco@peoplepay360.com" },
  "Customer Support": { name: "Prakash Sinha", position: "Support Operations Lead", email: "lead.emp020@peoplepay360.com" },
  "Executive": { name: "Aarav Sharma", position: "Chief Executive Officer", email: "shikharyadav595@gmail.com" },
};

export function getDepartmentLead(department?: string, managerName?: string): DeptLeadInfo {
  if (managerName && managerName.trim().length > 0 && managerName !== "None") {
    return {
      name: managerName,
      position: "Direct Manager & Dept HR Lead",
      email: ""
    };
  }

  const deptKey = Object.keys(DEPARTMENT_LEADS).find(
    (key) => key.toLowerCase() === (department || "").trim().toLowerCase()
  );

  if (deptKey && DEPARTMENT_LEADS[deptKey]) {
    return DEPARTMENT_LEADS[deptKey];
  }

  return {
    name: "Ananya Kulkarni",
    position: "VP People (Global HR Lead)",
    email: "vp.people@peoplepay360.com"
  };
}
