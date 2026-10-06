import axiosInstance from '../axios';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: number;
    email?: string;
    fullName?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: Record<string, string> | string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await axiosInstance.post<ApiResponse<AuthResponseData>>(
    'v1/auth/register',
    payload
  );

  return response.data;
};

export interface ForgotPasswordPayload {
  email: string;
}

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const response = await axiosInstance.post<ApiResponse<any>>('v1/auth/forgot-password', payload);
  return response.data;
};

export interface UserRecord {
  id?: number;
  userId?: number;
  email: string;
  fullName?: string;
  username?: string;
  role?: string;
  locked?: boolean;
  isTemporaryPassword?: boolean;
  status?: string;
}

export const getUsers = async () => {
  const response = await axiosInstance.get<ApiResponse<UserRecord[]>>('v1/accounts');
  return response.data;
};

export const getUnassignedAccounts = async () => {
  const response = await axiosInstance.get<ApiResponse<UserRecord[]>>('v1/accounts/unassigned');
  return response.data;
};

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}

export const createUser = async (payload: CreateUserPayload) => {
  const response = await axiosInstance.post<ApiResponse<UserRecord>>('v1/auth/register', payload);
  return response.data;
};

export const updateUser = async (id: number, payload: Partial<CreateUserPayload>) => {
  const response = await axiosInstance.put<ApiResponse<UserRecord>>(`v1/accounts/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/accounts/${id}`);
  return response.data;
};

export const toggleLockUser = async (id: number, _lock: boolean) => {
  const response = await axiosInstance.patch<ApiResponse<any>>(`v1/accounts/${id}/toggle-status`);
  return response.data;
};
