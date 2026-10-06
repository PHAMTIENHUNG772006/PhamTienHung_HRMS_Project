import type { Role } from "../types/auth.types";

export interface Feature {
  code: string;
  name: string;
}

export const FEATURES: Feature[] = [
  { code: "F01", name: "Đăng nhập & Xác thực" },
  { code: "F02", name: "Quản lý Tài khoản & Quyền hạn" },
  { code: "F03", name: "Quản lý Hồ sơ nhân viên" },
  { code: "F04", name: "Quản lý Phòng ban & Chức vụ" },
  { code: "F05", name: "Chấm công (GPS/WiFi/QR/FaceID)" },
  { code: "F06", name: "Thiết lập Ca làm việc" },
  { code: "F07", name: "Phê duyệt Đơn xin nghỉ phép" },
  { code: "F08", name: "Phê duyệt Đơn đăng ký tăng ca" },
  { code: "F09", name: "Tính toán lương & Xuất Phiếu lương" },
  { code: "F10", name: "Quản lý Chiến dịch tuyển dụng" },
  { code: "F11", name: "Cấp phát & Thu hồi Tài sản" },
  { code: "F12", name: "Xem Dashboard & Xuất Báo cáo" },
];

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  Admin: ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12"],
  HR: ["F01", "F03", "F04", "F05", "F06", "F07", "F08", "F10", "F11", "F12"],
  Manager: ["F01", "F06", "F07", "F08", "F12"],
  Payroll: ["F01", "F09", "F12"],
  Employee: ["F01", "F05", "F07", "F08", "F12"],
  Guest: ["F01"],
  CANDIDATE: ["F01"],
};

export const hasPermissionHelper = (role: Role | undefined, featureCode: string): boolean => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(featureCode) : false;
};
