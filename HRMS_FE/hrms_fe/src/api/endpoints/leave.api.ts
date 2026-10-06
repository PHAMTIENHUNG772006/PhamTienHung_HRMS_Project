import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface LeaveRequestItem {
  leaveRequestId?: number;
  employeeId?: number;
  employeeName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
}

export const getLeaveRequests = async () => {
  const response = await axiosInstance.get<ApiResponse<LeaveRequestItem[]>>('v1/leave-requests');
  return response.data;
};

export const createLeaveRequest = async (payload: Omit<LeaveRequestItem, 'leaveRequestId'>) => {
  const response = await axiosInstance.post<ApiResponse<LeaveRequestItem>>('v1/leave-requests', payload);
  return response.data;
};

export const updateLeaveRequestStatus = async (id: number | string, status: string) => {
  const response = await axiosInstance.patch<ApiResponse<LeaveRequestItem>>(`v1/leave-requests/${id}/status`, { status });
  return response.data;
};

export const updateLeaveRequest = async (id: number, payload: Omit<LeaveRequestItem, 'leaveRequestId'>) => {
  const response = await axiosInstance.put<ApiResponse<LeaveRequestItem>>(`v1/leave-requests/${id}`, payload);
  return response.data;
};

export const deleteLeaveRequest = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<void>>(`v1/leave-requests/${id}`);
  return response.data;
};
