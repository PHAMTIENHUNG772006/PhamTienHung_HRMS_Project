import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface DepartmentItem {
  departmentId?: number;
  departmentCode: string;
  departmentName: string;
  description?: string;
  managerId?: number | null;
  managerName?: string;
  active?: boolean;
}

export const getDepartments = async () => {
  const response = await axiosInstance.get<ApiResponse<DepartmentItem[]>>('v1/departments');
  return response.data;
};

export const getDepartmentById = async (id: number | string) => {
  const response = await axiosInstance.get<ApiResponse<DepartmentItem>>(`v1/departments/${id}`);
  return response.data;
};

export const createDepartment = async (payload: Omit<DepartmentItem, 'departmentId'>) => {
  const response = await axiosInstance.post<ApiResponse<DepartmentItem>>('v1/departments', payload);
  return response.data;
};

export const updateDepartment = async (id: number | string, payload: Omit<DepartmentItem, 'departmentId'>) => {
  const response = await axiosInstance.put<ApiResponse<DepartmentItem>>(`v1/departments/${id}`, payload);
  return response.data;
};

export const deleteDepartment = async (id: number | string) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/departments/${id}`);
  return response.data;
};
