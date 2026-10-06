import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface PayrollItem {
  payrollId?: number;
  employeeId?: number;
  employeeName?: string;
  salaryPeriod: string;
  basicSalary: number;
  netSalary: number;
  status: string;
}

export const getPayrolls = async () => {
  const response = await axiosInstance.get<ApiResponse<PayrollItem[]>>('v1/payroll');
  return response.data;
};

export const runPayrollCalculation = async (period: string) => {
  const response = await axiosInstance.post<ApiResponse<PayrollItem[]>>('v1/payroll/calculate', { period });
  return response.data;
};

export const updatePayrollStatus = async (id: number | string, status: string) => {
  const response = await axiosInstance.patch<ApiResponse<PayrollItem>>(`v1/payroll/${id}/status`, { status });
  return response.data;
};
