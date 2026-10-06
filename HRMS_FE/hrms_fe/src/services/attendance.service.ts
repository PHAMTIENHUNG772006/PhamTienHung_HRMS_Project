import axiosInstance from '../api/axios';
import type { ApiResponse } from '../api/endpoints/auth.api';

export interface AttendanceRecord {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  workDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  lateMinutes: number;
  earlyMinutes: number;
  status: string;
  checkInImage: string | null;
  checkOutImage: string | null;
  shiftCode: string | null;
  shiftName: string | null;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  actualHours: number | null;
  isFullWorkDay: boolean | null;
}

export const getMyAttendances = async () => {
  const response = await axiosInstance.get<ApiResponse<AttendanceRecord[]>>('v1/attendance/my');
  return response.data;
};

export const checkIn = async (imageBlob: Blob, shiftCode: string) => {
  const formData = new FormData();
  // Tạo file từ Blob với đuôi .jpg
  const file = new File([imageBlob], "checkin.jpg", { type: "image/jpeg" });
  formData.append("image", file);
  formData.append("shiftCode", shiftCode);

  const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>('v1/attendance/check-in', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const checkOut = async (imageBlob: Blob, shiftCode: string) => {
  const formData = new FormData();
  // Tạo file từ Blob với đuôi .jpg
  const file = new File([imageBlob], "checkout.jpg", { type: "image/jpeg" });
  formData.append("image", file);
  formData.append("shiftCode", shiftCode);

  const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>('v1/attendance/check-out', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllAttendances = async (startDate?: string, endDate?: string) => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axiosInstance.get<ApiResponse<AttendanceRecord[]>>('v1/attendance/all', { params });
  return response.data;
};
