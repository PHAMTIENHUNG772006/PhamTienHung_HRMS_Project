import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface ShiftAssignmentItem {
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  assignDate: string;
}

export interface ShiftAssignmentRequest {
  employeeIds: number[];
  shiftCode: string;
  fromDate: string;
  toDate: string;
}

export const getShiftAssignments = async (startDate?: string, endDate?: string) => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await axiosInstance.get<ApiResponse<ShiftAssignmentItem[]>>('v1/shift-assignments', { params });
  return response.data;
};

export const createShiftAssignment = async (payload: ShiftAssignmentRequest) => {
  const response = await axiosInstance.post<ApiResponse<ShiftAssignmentItem>>('v1/shift-assignments', payload);
  return response.data;
};

export const deleteShiftAssignment = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/shift-assignments/${id}`);
  return response.data;
};

export const getMyShiftAssignmentsToday = async () => {
  const response = await axiosInstance.get<ApiResponse<ShiftAssignmentItem[]>>('v1/shift-assignments/my-today');
  return response.data;
};

