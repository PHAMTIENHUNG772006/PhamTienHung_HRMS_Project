import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface PositionItem {
  positionId?: number;
  positionName: string;
  salaryGrade: string;
  active?: boolean;
}

export const getPositions = async () => {
  const response = await axiosInstance.get<ApiResponse<PositionItem[]>>('v1/positions');
  return response.data;
};

export const getPositionById = async (id: number | string) => {
  const response = await axiosInstance.get<ApiResponse<PositionItem>>(`v1/positions/${id}`);
  return response.data;
};

export const createPosition = async (payload: Omit<PositionItem, 'positionId'>) => {
  const response = await axiosInstance.post<ApiResponse<PositionItem>>('v1/positions', payload);
  return response.data;
};

export const updatePosition = async (id: number | string, payload: Omit<PositionItem, 'positionId'>) => {
  const response = await axiosInstance.put<ApiResponse<PositionItem>>(`v1/positions/${id}`, payload);
  return response.data;
};

export const deletePosition = async (id: number | string) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/positions/${id}`);
  return response.data;
};
