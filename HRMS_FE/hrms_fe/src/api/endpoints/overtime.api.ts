import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface OvertimeRequestItem {
  otRequestId?: number;
  employeeId?: number;
  employeeName?: string;
  otDate: string;
  startTime: string;
  endTime: string;
  approvedHours?: number | null;
  status: string;
}

export const getOvertimeRequests = async () => {
  const response = await axiosInstance.get<ApiResponse<OvertimeRequestItem[]>>('v1/overtime-requests');
  return response.data;
};

export const createOvertimeRequest = async (payload: Omit<OvertimeRequestItem, 'otRequestId'>) => {
  const response = await axiosInstance.post<ApiResponse<OvertimeRequestItem>>('v1/overtime-requests', payload);
  return response.data;
};

export const updateOvertimeRequestStatus = async (id: number | string, status: string, approvedHours?: number | null) => {
  const response = await axiosInstance.patch<ApiResponse<OvertimeRequestItem>>(`v1/overtime-requests/${id}/status`, { status, approvedHours });
  return response.data;
};

export const updateOvertimeRequest = async (id: number | string, payload: Omit<OvertimeRequestItem, 'otRequestId'>) => {
  const response = await axiosInstance.put<ApiResponse<OvertimeRequestItem>>(`v1/overtime-requests/${id}`, payload);
  return response.data;
};

export const deleteOvertimeRequest = async (id: number | string) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/overtime-requests/${id}`);
  return response.data;
};
