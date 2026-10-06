package com.company.hrms.module.recruitment.service;

import com.company.hrms.model.dto.request.RecruitmentRequestDto;
import com.company.hrms.model.dto.response.RecruitmentResponseDto;
import java.util.List;

public interface RecruitmentService {
    List<RecruitmentResponseDto> getAllCampaigns();
    RecruitmentResponseDto createCampaign(RecruitmentRequestDto request);
    RecruitmentResponseDto updateCampaign(Long id, RecruitmentRequestDto request);
    void deleteCampaign(Long id);
}