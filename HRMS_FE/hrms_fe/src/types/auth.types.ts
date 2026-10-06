export type Role = "Admin" | "HR" | "Manager" | "Payroll" | "Employee" | "Guest" | "CANDIDATE";

export interface User {
  id?: number | string;
  email: string;
  fullName?: string;
  role?: Role;
  isTemporaryPassword?: boolean;
  status?: "PENDING_APPROVAL" | "ACTIVE" | "LOCKED" | string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export const normalizeRole = (role: string | undefined): Role => {
  if (!role) return "CANDIDATE";
  const r = role.toUpperCase();
  if (r === "ADMIN" || r === "ROLE_ADMIN") return "Admin";
  if (r === "HR" || r === "ROLE_HR") return "HR";
  if (r === "MANAGER" || r === "ROLE_MANAGER") return "Manager";
  if (r === "PAYROLL" || r === "ROLE_PAYROLL") return "Payroll";
  if (r === "EMPLOYEE" || r === "ROLE_EMPLOYEE") return "Employee";
  if (r === "CANDIDATE" || r === "ROLE_CANDIDATE") return "CANDIDATE";
  if (r === "GUEST" || r === "ROLE_GUEST") return "Guest";
  return "CANDIDATE";
};
