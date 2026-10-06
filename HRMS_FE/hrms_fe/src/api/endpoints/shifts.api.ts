import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface ShiftItem {
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  shiftDate?: string;
}

export const getShifts = async () => {
  const response = await axiosInstance.get<ApiResponse<ShiftItem[]>>('v1/shifts');
  return response.data;
};

export const createShift = async (payload: ShiftItem) => {
  const response = await axiosInstance.post<ApiResponse<ShiftItem>>('v1/shifts', payload);
  return response.data;
};

export const updateShift = async (code: string, payload: ShiftItem) => {
  const response = await axiosInstance.put<ApiResponse<ShiftItem>>(`v1/shifts/${code}`, payload);
  return response.data;
};

export const deleteShift = async (code: string) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/shifts/${code}`);
  return response.data;
};

export const getTodayShifts = async () => {
  const response = await axiosInstance.get<ApiResponse<ShiftItem[]>>('v1/shifts/today');
  return response.data;
};
