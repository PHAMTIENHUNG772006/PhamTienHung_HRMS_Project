import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface Employee {
  employeeId?: number;
  userId?: number | null;
  fullName?: string;
  idCardNumber?: number | '';
  departmentId?: number | '';
  departmentName?: string;
  positionId?: number | '';
  positionName?: string;
  joiningDate?: string;
  status?: string;
  bankAccountNumber?: string;
  basicSalary?: number | '';
  // Fallback fields for local simulation / backward compatibility
  id?: number | string;
  employeeCode?: string;
  name?: string;
  email?: string;
  department?: string;
  role?: string;
}

export const getEmployees = async () => {
  const response = await axiosInstance.get<ApiResponse<Employee[]>>('v1/employees');
  return response.data;
};

export const createEmployee = async (payload: Omit<Employee, 'employeeId'>) => {
  const response = await axiosInstance.post<ApiResponse<Employee>>('v1/employees', payload);
  return response.data;
};

export const updateEmployee = async (id: number | string, payload: Omit<Employee, 'employeeId'>) => {
  const response = await axiosInstance.put<ApiResponse<Employee>>(`v1/employees/${id}`, payload);
  return response.data;
};

export const deleteEmployee = async (id: number | string) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/employees/${id}`);
  return response.data;
};
