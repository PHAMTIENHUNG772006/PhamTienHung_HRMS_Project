import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface AssetItem {
  assetId?: number;
  assetName: string;
  assetType: string;
  status: string;
}

export const getAssets = async () => {
  const response = await axiosInstance.get<ApiResponse<AssetItem[]>>('v1/assets');
  return response.data;
};

export const createAsset = async (payload: AssetItem) => {
  const response = await axiosInstance.post<ApiResponse<AssetItem>>('v1/assets', payload);
  return response.data;
};

export const updateAsset = async (id: number | string, payload: AssetItem) => {
  const response = await axiosInstance.put<ApiResponse<AssetItem>>(`v1/assets/${id}`, payload);
  return response.data;
};

export const deleteAsset = async (id: number | string) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/assets/${id}`);
  return response.data;
};
