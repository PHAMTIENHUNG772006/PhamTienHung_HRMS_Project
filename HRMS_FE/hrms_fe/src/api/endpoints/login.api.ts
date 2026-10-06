import type { Role } from '../../types/auth.types';
import axiosInstance from '../axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    userId?: number;
    user?: {
      email?: string;
      fullName?: string;
      role?: Role;
    };
  };
  error?: Record<string, string> | string;
}

export const loginUser = async (payload: LoginPayload) => {
  const response = await axiosInstance.post<LoginResponse>('v1/auth/login', payload);
  return response.data;
};

export interface RefreshTokenResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    username: string;
    email: string;
    role: Role;
    userId?: number;
  };
}

export const silentRefresh = async (refreshToken: string) => {
  const response = await axiosInstance.post<RefreshTokenResponse>('v1/auth/refresh-token', { refreshToken });
  return response.data;
};
