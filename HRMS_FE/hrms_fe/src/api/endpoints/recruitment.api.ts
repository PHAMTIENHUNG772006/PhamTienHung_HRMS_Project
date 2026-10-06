import axiosInstance from '../axios';
import type { ApiResponse } from './auth.api';

export interface RecruitmentCampaignItem {
  campaignId?: number;
  positionId: number;
  positionName?: string;
  quantityNeeded: number;
  deadline: string;
  description?: string;
}

export interface CandidateItem {
  candidateId?: number;
  campaignId: number;
  positionName?: string;
  candidateName: string;
  email: string;
  cvFileUrl: string;
  source?: string;
  status?: string;
}

export interface CandidateApprovePayload {
  employeeCode: string;
  departmentId: number;
  positionId: number;
  roleName: string;
  status: string;
  idCardNumber?: number;
}

export interface CandidateRequestPayload {
  candidateName: string;
  campaignId: number;
  email?: string;
  cvFileUrl: string;
  source?: string;
  status?: string;
}

export const getCampaigns = async () => {
  const response = await axiosInstance.get<ApiResponse<RecruitmentCampaignItem[]>>('v1/recruitment');
  return response.data;
};

export const createCampaign = async (payload: RecruitmentCampaignItem) => {
  const response = await axiosInstance.post<ApiResponse<RecruitmentCampaignItem>>('v1/recruitment', payload);
  return response.data;
};

export const updateCampaign = async (id: number | string, payload: RecruitmentCampaignItem) => {
  const response = await axiosInstance.put<ApiResponse<RecruitmentCampaignItem>>(`v1/recruitment/${id}`, payload);
  return response.data;
};

export const deleteCampaign = async (id: number | string) => {
  const response = await axiosInstance.delete<ApiResponse<any>>(`v1/recruitment/${id}`);
  return response.data;
};

export const getCandidates = async () => {
  const response = await axiosInstance.get<ApiResponse<CandidateItem[]>>('v1/candidates');
  return response.data;
};

export const approveCandidate = async (id: number | string, payload: CandidateApprovePayload) => {
  const response = await axiosInstance.post<ApiResponse<CandidateItem>>(`v1/candidates/${id}/approve`, payload);
  return response.data;
};

export const createCandidate = async (payload: CandidateRequestPayload) => {
  const response = await axiosInstance.post<ApiResponse<CandidateItem>>('v1/candidates', payload);
  return response.data;
};
